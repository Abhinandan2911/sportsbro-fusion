/**
 * Script to set a user as admin by email
 * Run with: npx ts-node src/scripts/makeAdmin.ts [email]
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/userModel';

// Load environment variables
dotenv.config();

// Get email from command line arguments
const email = process.argv[2];

if (!email) {
  console.error('Please provide an email address as an argument');
  console.error('Usage: npx ts-node src/scripts/makeAdmin.ts [email]');
  process.exit(1);
}

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI as string)
  .then(async () => {
    console.log('Connected to MongoDB successfully');
    
    try {
      // Find user by email
      const user = await User.findOne({ email: email.toLowerCase() });
      
      if (!user) {
        console.error(`User with email ${email} not found`);
        process.exit(1);
      }
      
      // Set user as admin
      user.isAdmin = true;
      await user.save();
      
      console.log(`User ${user.fullName} (${user.email}) is now an admin`);
      
      // Extra info
      console.log('\nUser details:');
      console.log(`- Name: ${user.fullName}`);
      console.log(`- ID: ${user._id}`);
      console.log(`- Username: ${user.username}`);
      console.log(`- Email: ${user.email}`);
      console.log(`- Auth provider: ${user.authProvider}`);
      
      console.log('\nAdmin access URLs:');
      console.log(`- Admin dashboard: http://localhost:8081/admin`);
      console.log(`- Admin API: http://localhost:5001/api/admin/users?adminToken=${process.env.ADMIN_TOKEN || 'set_your_admin_token_in_env'}`);
      
    } catch (error) {
      console.error('Error setting user as admin:', error);
    } finally {
      // Disconnect from MongoDB
      mongoose.disconnect();
    }
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }); 