import mongoose from 'mongoose';

declare global {
  namespace Express {
    export interface User {
      _id: mongoose.Types.ObjectId;
      [key: string]: any;
    }
  }
} 