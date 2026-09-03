const fs = require('fs');
const mongoose = require('mongoose');

// Automatically extract the exact MongoDB URI from your server.js file
const serverCode = fs.readFileSync('server.js', 'utf8');
const match = serverCode.match(/mongodb\+srv:\/\/[^'"`]+/);
const MONGO_URI = match ? match[0] : null;

if (!MONGO_URI) {
    console.error('Could not find MongoDB URI in server.js');
    process.exit(1);
}

console.log('Found MongoDB URI from server.js, connecting...');

async function cleanDuplicates() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB successfully!');

        const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));

        const users = await User.find({});
        for (let user of users) {
            if (user.rigs && Array.isArray(user.rigs)) {
                const seen = new Set();
                const uniqueRigs = [];
                
                for (let rig of user.rigs) {
                    const signature = `${rig.rigId || rig.name || 'unknown'}_${rig.payout || 5000}_${rig.rentedAt || 'default'}`;
                    if (!seen.has(signature)) {
                        seen.add(signature);
                        uniqueRigs.push(rig);
                    }
                }

                if (uniqueRigs.length !== user.rigs.length) {
                    console.log(`Cleaning user ${user.phone_number || user._id}: reduced from ${user.rigs.length} to ${uniqueRigs.length} rigs.`);
                    user.rigs = uniqueRigs;
                    await user.save();
                }
            }
        }

        console.log('Duplicate cleanup completed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Error during cleanup:', err);
        process.exit(1);
    }
}

cleanDuplicates();
