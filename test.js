const mongoose = require('mongoose');
const MONGO_URI = "mongodb+srv://mushtech256_db_user:Mtvt96J1IcyL78Eu@cluster0.kd5otgm.mongodb.net/?appName=Cluster0";

const userSchema = new mongoose.Schema({
  phone_number: String,
  balance: Number
});
const User = mongoose.model('User', userSchema);

async function runTest() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected for testing...");

  // Create a dummy user
  const testUser = new User({ phone_number: "+256700000000", balance: 5000 });
  await testUser.save();
  console.log("Test user successfully saved to MongoDB Atlas!");

  process.exit(0);
}

runTest();

