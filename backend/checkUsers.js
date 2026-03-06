require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sharesphere')
  .then(async () => {
    console.log('Connected to MongoDB\n');
    
    // Check all users and their verification status
    const allUsers = await User.find().select('name email verificationStatus nidNumber nidVerified');
    console.log('=== All Users ===');
    allUsers.forEach(u => {
      console.log(`- ${u.name} (${u.email}): status=${u.verificationStatus}, nidNumber=${u.nidNumber || 'none'}, nidVerified=${u.nidVerified}`);
    });
    
    // Check unverified users
    const unverified = await User.find({ nidVerified: false });
    console.log(`\n=== Total unverified users: ${unverified.length} ===`);
    
    // Check pending verifications (current query)
    const pending = await User.find({ verificationStatus: 'pending', nidNumber: { $exists: true, $ne: null } });
    console.log(`\n=== Pending verifications (current query): ${pending.length} ===`);
    
    // Check users with nidNumber but not pending
    const withNID = await User.find({ nidNumber: { $exists: true, $ne: null, $ne: '' } });
    console.log(`\n=== Users with NID number: ${withNID.length} ===`);
    withNID.forEach(u => {
      console.log(`- ${u.name}: status=${u.verificationStatus}, nidNumber=${u.nidNumber}`);
    });
    
    mongoose.connection.close();
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
