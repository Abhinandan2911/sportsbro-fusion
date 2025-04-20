import mongoose, { Document, Schema } from 'mongoose';

// Interface for Team document
export interface ITeam extends Document {
  name: string;
  sport: string;
  city: string;
  state: string;
  district?: string;
  skillLevel: string;
  members: mongoose.Types.ObjectId[];
  joinRequests: mongoose.Types.ObjectId[];
  maxSize: number;
  description: string;
  contactDetails: string;
  imgUrl?: string;
  createdBy: mongoose.Types.ObjectId;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Team Schema
const TeamSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Team name is required'],
      trim: true,
    },
    sport: {
      type: String,
      required: [true, 'Sport is required'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'City or village is required'],
      trim: true,
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true,
    },
    district: {
      type: String,
      trim: true,
    },
    skillLevel: {
      type: String,
      required: [true, 'Skill level is required'],
      enum: ['Beginner', 'Intermediate', 'Advanced'],
    },
    members: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],
    joinRequests: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: []
    }],
    maxSize: {
      type: Number,
      required: [true, 'Maximum team size is required'],
      min: [2, 'Team size must be at least 2'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    contactDetails: {
      type: String,
      required: [true, 'Contact details are required'],
    },
    imgUrl: {
      type: String,
      default: 'https://images.unsplash.com/photo-1519861531473-9200262188bf',
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isPublic: {
      type: Boolean,
      default: true,
      description: 'If true, users can send join requests; if false, users must be invited',
    }
  },
  {
    timestamps: true,
  }
);

// Add a text index for better search across all major text fields
TeamSchema.index({ 
  name: 'text', 
  description: 'text', 
  city: 'text',
  state: 'text',
  district: 'text',
  sport: 'text'
});

const Team = mongoose.model<ITeam>('Team', TeamSchema);

export default Team; 