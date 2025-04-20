import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/user.model';
import { generateToken } from '../utils/generateToken';

/**
 * Setup and return Google OAuth Strategy for Passport
 * This strategy handles authenticating users with Google credentials
 * and finding or creating user records in MongoDB
 */
export const setupGoogleStrategy = () => {
  return new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL!,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0].value;
        const fullName = profile.displayName;
        const profilePhoto = profile.photos?.[0].value;

        let user = await User.findOne({ email });

        if (!user) {
          user = await User.create({
            fullName,
            email,
            profilePhoto,
            authProvider: 'google',
          });
        }

        const token = generateToken(user._id.toString());
        
        // Create a plain object that can be safely serialized
        const userObject = user.toObject();
        // Add token to user object
        (userObject as any).token = token;
        
        return done(null, userObject);
      } catch (err) {
        return done(err, false);
      }
    }
  );
}; 