import mongoose, { Schema, Document } from 'mongoose';

export interface IActivity extends Document {
  title: string;
  description?: string;
  type: string;
  category: string;
  difficulty: string;
  timeEstimate?: string;
  gameData?: any;
  maxScore: number;
  imageUrl?: string;
  isNew: boolean;
  isPopular: boolean;
  createdAt: Date;
}

const ActivitySchema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  type: { type: String, required: true, enum: ['word_scramble', 'number_puzzle', 'memory_match'] },
  category: { type: String, required: true },
  difficulty: { type: String, required: true, enum: ['easy', 'medium', 'hard'] },
  timeEstimate: { type: String },
  gameData: { type: Schema.Types.Mixed },
  maxScore: { type: Number, default: 100 },
  imageUrl: { type: String },
  isNew: { type: Boolean, default: false },
  isPopular: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

export const Activity = mongoose.model<IActivity>('Activity', ActivitySchema); 