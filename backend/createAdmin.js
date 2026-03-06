require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const createAdminUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');

    const adminEmail = 'admin123@gmail.com';
    const adminPassword = 'admin123';
    const adminName = 'Admin User';

    // Check if user already exists
    let user = await User.findOne({ email: adminEmail });

    if (user) {
      // User exists, update their role to admin
      user.role = 'admin';
      await user.save();
      console.log(`✅ User '${adminEmail}' role updated to admin`);
    } else {
      // Create new admin user
      user = await User.create({
        name: adminName,
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
        isVerified: true,
      });
      console.log(`✅ Admin user created successfully!`);
    }

    console.log('\n📋 Admin Credentials:');
    console.log('   Email:', adminEmail);
    console.log('   Password:', adminPassword);
    console.log('   Role:', user.role);
    console.log('\n✨ You can now login with these credentials and access admin pages!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

createAdminUser();
