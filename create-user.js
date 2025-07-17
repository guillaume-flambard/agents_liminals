const bcrypt = require('bcryptjs');
const { MongoClient } = require('mongodb');

const uri = "mongodb://admin:password@mongo:27017/agents_liminals?authSource=admin";

async function createTestUser() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('agents_liminals');
    const users = db.collection('users');
    
    // Check if user exists
    const existingUser = await users.findOne({ username: 'testuser' });
    if (existingUser) {
      console.log('User already exists, removing...');
      await users.deleteOne({ username: 'testuser' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash('Password123', 12);
    
    // Create user
    const user = {
      email: 'test@example.com',
      username: 'testuser',
      password: hashedPassword,
      profile: {
        firstName: 'Test',
        lastName: 'User'
      },
      subscription: {
        type: 'free',
        dailyConsultations: 3
      },
      isActive: true,
      emailVerified: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await users.insertOne(user);
    console.log('User created:', result.insertedId);
    
    // Verify user was created
    const createdUser = await users.findOne({ username: 'testuser' });
    console.log('User verified:', createdUser.username, createdUser.email);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

createTestUser();