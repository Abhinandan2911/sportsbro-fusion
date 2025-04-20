import passport from 'passport';
import { setupGoogleStrategy } from '../auth/googleStrategy';
import User from '../models/user.model';

/**
 * Configure Passport.js strategies and serialization
 */
const configurePassport = () => {
  // Configure how user objects are serialized for session storage
  // Even though we're using JWT and not sessions, this is required for Passport
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });

  // Register strategies
  passport.use(setupGoogleStrategy());

  console.log('Passport configured with Google OAuth strategy');
  
  return passport;
};

export default configurePassport; 