import 'express-session';
import { IUser } from '../models/userModel';

declare module 'express-session' {
  interface SessionData {
    passport: {
      user: string; // User ID
    };
  }
}

declare global {
  namespace Express {
    interface User extends IUser {}
  }
} 