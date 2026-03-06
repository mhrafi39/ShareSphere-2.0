require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB\n');
    
    // Test the exact query from getPendingVerifications (NEW QUERY)
    const users = await User.find({
      nidVerified: false,
      role: { $ne: 'admin' }
    })
      .select('-password')
      .sort({ updatedAt: -1 });

    console.log(`=== Pending Verifications Query Result: ${users.length} users ===\n`);
    
    users.forEach(u => {
      console.log(`- ${u.name} (${u.email})`);
      console.log(`  Status: ${u.verificationStatus}`);
      console.log(`  NID Number: ${u.nidNumber || 'N/A'}`);
      console.log(`  NID Image: ${u.nidImage ? 'Yes' : 'No'}`);
      console.log(`  NID Verified: ${u.nidVerified}`);
      console.log('');
    });
    
    // Also check all users
    const allUsers = await User.find().select('name email nidNumber nidImage nidVerified verificationStatus');
    console.log(`\n=== All Users (${allUsers.length}) ===\n`);
    allUsers.forEach(u => {
      console.log(`- ${u.name}: status=${u.verificationStatus}, nidNum=${u.nidNumber ? 'Yes' : 'No'}, nidImg=${u.nidImage ? 'Yes' : 'No'}, verified=${u.nidVerified}`);
    });
    
    mongoose.connection.close();
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
