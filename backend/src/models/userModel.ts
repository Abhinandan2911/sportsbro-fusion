import mongoose, { Document, Schema } from 'mongoose';

// Interface for User document
export interface IUser extends Document {
  fullName: string;
  email: string;
  password: string;
  username: string;
  gender?: string;
  sports?: string[];
  achievements?: Array<{
    title: string;
    description: string;
    year?: string;
  }>;
  profilePhoto?: string;
  googleId?: string;
  authProvider?: 'local' | 'google';
  isAdmin?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// User Schema
const UserSchema: Schema = new Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters'],
      match: [
        /^[a-zA-Z0-9_\.]+$/,
        'Username can only contain letters, numbers, underscores, and dots',
      ],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
    },
    sports: {
      type: [String],
      default: [],
    },
    achievements: [
      {
        title: {
          type: String,
          required: true,
        },
        description: {
          type: String,
          required: true,
        },
        year: {
          type: String,
        },
      },
    ],
    profilePhoto: {
      type: String,
    },
    googleId: {
      type: String,
      sparse: true,
      index: true
    },
    authProvider: {
      type: String,
      enum: ['local', 'google'],
      default: 'local'
    },
    isAdmin: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model<IUser>('User', UserSchema);

export default User; 