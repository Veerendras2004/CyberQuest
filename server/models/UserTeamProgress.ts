import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from './User';
import { ITeamChallenge } from './TeamChallenge';

export interface IUserTeamProgress extends Document {
  userId: IUser['_id'];
  challengeId: ITeamChallenge['_id'];
  score: number;
  completed: boolean;
  timeSpent?: number;
  attempts: number;
  completedAt?: Date;
}

const UserTeamProgressSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  challengeId: { type: Schema.Types.ObjectId, ref: 'TeamChallenge', required: true },
  score: { type: Number, required: true },
  completed: { type: Boolean, default: false },
  timeSpent: { type: Number },
  attempts: { type: Number, default: 1 },
  completedAt: { type: Date }
});

export const UserTeamProgress = mongoose.model<IUserTeamProgress>('UserTeamProgress', UserTeamProgressSchema); 