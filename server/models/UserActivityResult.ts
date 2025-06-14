import mongoose, { Document } from 'mongoose';

export interface IUserActivityResult extends Document {
  userId: string;
  activityId: string;
  score: number;
  duration: number;
  completed: boolean;
  createdAt: Date;
}

const UserActivityResultSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  activityId: { type: String, required: true },
  score: { type: Number, required: true },
  duration: { type: Number, required: true },
  completed: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

export const UserActivityResult = mongoose.model<IUserActivityResult>('UserActivityResult', UserActivityResultSchema); 