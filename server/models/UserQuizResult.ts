import mongoose, { Document } from 'mongoose';

export interface IUserQuizResult extends Document {
  userId: string;
  quizId: string;
  score: number;
  duration: number;
  answers: {
    questionId: string;
    selectedAnswer: string;
    isCorrect: boolean;
  }[];
  createdAt: Date;
}

const UserQuizResultSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  quizId: { type: String, required: true },
  score: { type: Number, required: true },
  duration: { type: Number, required: true },
  answers: [{
    questionId: { type: String, required: true },
    selectedAnswer: { type: String, required: true },
    isCorrect: { type: Boolean, required: true }
  }],
  createdAt: { type: Date, default: Date.now }
});

export const UserQuizResult = mongoose.model<IUserQuizResult>('UserQuizResult', UserQuizResultSchema); 