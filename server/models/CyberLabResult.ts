import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from './User';

export interface ICyberLabResult extends Document {
  userId: IUser['_id'];
  labType: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent?: number;
  completedAt: Date;
}

const CyberLabResultSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  labType: { type: String, required: true, enum: ['phishing', 'malware', 'social_engineering'] },
  score: { type: Number, required: true },
  totalQuestions: { type: Number, required: true },
  correctAnswers: { type: Number, required: true },
  timeSpent: { type: Number },
  completedAt: { type: Date, default: Date.now }
});

export const CyberLabResult = mongoose.model<ICyberLabResult>('CyberLabResult', CyberLabResultSchema); 