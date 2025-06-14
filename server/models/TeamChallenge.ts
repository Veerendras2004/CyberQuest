import mongoose, { Schema, Document } from 'mongoose';

export interface ITeamChallenge extends Document {
  title: string;
  description?: string;
  team: string;
  category: string;
  difficulty: string;
  type: string;
  content?: any;
  maxScore: number;
  unlockLevel: number;
  createdAt: Date;
}

const TeamChallengeSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  team: { type: String, required: true, enum: ['red', 'white'] },
  category: { type: String, required: true },
  difficulty: { type: String, required: true, enum: ['easy', 'medium', 'hard'] },
  type: { type: String, required: true, enum: ['simulation', 'quiz', 'lab'] },
  content: { type: Schema.Types.Mixed },
  maxScore: { type: Number, default: 100 },
  unlockLevel: { type: Number, default: 1 },
  createdAt: { type: Date, default: Date.now }
});

export const TeamChallenge = mongoose.model<ITeamChallenge>('TeamChallenge', TeamChallengeSchema); 