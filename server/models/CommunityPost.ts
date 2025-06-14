import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from './User';

export interface ICommunityPost extends Document {
  userId: IUser['_id'];
  username: string;
  content: string;
  tags?: string[];
  likes: number;
  commentCount: number;
  createdAt: Date;
}

const CommunityPostSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  username: { type: String, required: true },
  content: { type: String, required: true },
  tags: [{ type: String }],
  likes: { type: Number, default: 0 },
  commentCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

export const CommunityPost = mongoose.model<ICommunityPost>('CommunityPost', CommunityPostSchema); 