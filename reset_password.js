const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Load environment variables
require('dotenv').config();

async function resetPassword() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Import User model
    const User = require('./server/models/User');

    const username = 'zoanlogia';
    const newPassword = 'test123456'; // Temporary password

    console.log(`Resetting password for user: ${username}`);

    // Find user
    const user = await User.findOne({ username });
    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log('✅ User found:', user.email);

    // Hash new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await User.findByIdAndUpdate(user._id, {
      password: hashedPassword,
      updatedAt: new Date()
    });

    console.log('✅ Password updated successfully');
    console.log(`🔑 New temporary password: ${newPassword}`);
    console.log('');
    console.log('You can now login with:');
    console.log(`- Username: ${username}`);
    console.log(`- Email: ${user.email}`);
    console.log(`- Password: ${newPassword}`);
    console.log('');
    console.log('⚠️  Please change this password after logging in!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

resetPassword();