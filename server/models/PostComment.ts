import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from './User';
import { ICommunityPost } from './CommunityPost';

export interface IPostComment extends Document {
  postId: ICommunityPost['_id'];
  userId: IUser['_id'];
  username: string;
  content: string;
  createdAt: Date;
}

const PostCommentSchema = new Schema({
  postId: { type: Schema.Types.ObjectId, ref: 'CommunityPost', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  username: { type: String, required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export const PostComment = mongoose.model<IPostComment>('PostComment', PostCommentSchema); 