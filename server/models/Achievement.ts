import mongoose, { Document } from 'mongoose';

export interface IAchievement extends Document {
  userId: string;
  name: string;
  description: string;
  icon: string;
  points: number;
  unlockedAt: Date;
}

const AchievementSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String, required: true },
  points: { type: Number, required: true },
  unlockedAt: { type: Date, default: Date.now }
});

export const Achievement = mongoose.model<IAchievement>('Achievement', AchievementSchema); 