const mongoose = require('mongoose');

const mongoURI = 'mongodb+srv://mushtech256:mushtech256@cluster0.mongodb.net/apex-investments?retryWrites=true&w=majority';

async function cleanRigs() {
    try {
        await mongoose.connect(mongoURI);
        console.log('Connected to MongoDB for deep rig cleanup...');
        
        const User = mongoose.model('User', new mongoose.Schema({ rigs: Array }, { strict: false }));
        const users = await User.find({});
        
        for (let user of users) {
            if (user.rigs && Array.isArray(user.rigs)) {
                const seen = new Set();
                const cleaned = [];
                
                for (let r of user.rigs) {
                    const sig = (r.rigId || r.name || 'rig') + '_' + (r.payout || r.daily_return || 0);
                    if (!seen.has(sig)) {
                        seen.add(sig);
                        cleaned.push(r);
                    }
                }
                
                if (cleaned.length !== user.rigs.length) {
                    const removedCount = user.rigs.length - cleaned.length;
                    user.rigs = cleaned;
                    user.markModified('rigs');
                    await user.save();
                    console.log('Cleaned rigs for user, removed ' + removedCount + ' duplicates.');
                }
            }
        }
        console.log('Database rig cleanup finished successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Error during database cleanup:', err);
        process.exit(1);
    }
}

cleanRigs();
