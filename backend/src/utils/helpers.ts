import User from '../models/userModel';

/**
 * Generate a random username based on a person's name
 */
export const generateRandomUsername = async (name: string): Promise<string> => {
  // Remove spaces and special characters, convert to lowercase
  let baseUsername = name.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  // Add a random number (1000-9999)
  let username = `${baseUsername}${Math.floor(1000 + Math.random() * 9000)}`;
  
  // Check if username exists
  const exists = await User.findOne({ username });
  
  // If username exists, try again with a different random number
  if (exists) {
    return generateRandomUsername(name);
  }
  
  return username;
}; 