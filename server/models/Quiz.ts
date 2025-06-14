import mongoose, { Schema, Document } from 'mongoose';

export interface IQuestion {
  questionText: string;
  options: string[];
  correctAnswer: number;
  points: number;
  order: number;
}

export interface IQuiz extends Document {
  title: string;
  description?: string;
  category: string;
  difficulty: string;
  timeLimit: number;
  questions: IQuestion[];
  createdAt: Date;
}

const QuestionSchema = new Schema({
  questionText: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: Number, required: true },
  points: { type: Number, default: 10 },
  order: { type: Number, required: true }
});

const QuizSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  category: { type: String, required: true },
  difficulty: { type: String, required: true, enum: ['easy', 'medium', 'hard'] },
  timeLimit: { type: Number, default: 60 },
  questions: [QuestionSchema],
  createdAt: { type: Date, default: Date.now }
});

export const Quiz = mongoose.model<IQuiz>('Quiz', QuizSchema); 