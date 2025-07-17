const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function resetPassword() {
  try {
    const User = require('./server/models/User');
    
    const username = 'zoanlogia';
    const newPassword = 'test123456';
    
    console.log('Resetting password for user:', username);
    
    const user = await User.findOne({ username });
    if (!user) {
      console.log('User not found');
      return;
    }
    
    console.log('User found:', user.email);
    
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
    await User.findByIdAndUpdate(user._id, {
      password: hashedPassword,
      updatedAt: new Date()
    });
    
    console.log('✅ Password updated successfully');
    console.log('🔑 New temporary password:', newPassword);
    console.log('');
    console.log('You can now login with:');
    console.log('- Username: zoanlogia');
    console.log('- Email: gflambard@gmail.com');
    console.log('- Password: test123456');
    console.log('');
    console.log('⚠️  Please change this password after logging in!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

resetPassword();