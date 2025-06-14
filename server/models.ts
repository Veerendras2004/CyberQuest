import mongoose from 'mongoose';

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  password: String,
  totalScore: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  experience: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  lastActivity: { type: Date, default: Date.now },
  achievements: [String],
  teamSelection: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Quiz Schema
const quizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  category: String,
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'] },
  timeLimit: Number,
  questions: [{
    questionText: String,
    options: [String],
    correctAnswer: Number,
    points: Number,
    order: Number
  }],
  createdAt: { type: Date, default: Date.now }
});

// Activity Schema
const activitySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  type: String,
  category: String,
  difficulty: String,
  timeEstimate: String,
  maxScore: Number,
  imageUrl: String,
  isNew: Boolean,
  isPopular: Boolean,
  gameData: mongoose.Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now }
});

// User Quiz Result Schema
const userQuizResultSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  score: { type: Number, required: true },
  totalQuestions: Number,
  correctAnswers: Number,
  timeSpent: Number,
  completedAt: { type: Date, default: Date.now }
});

// User Activity Result Schema
const userActivityResultSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  activityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Activity', required: true },
  score: { type: Number, required: true },
  timeSpent: Number,
  completedAt: { type: Date, default: Date.now }
});

// Achievement Schema
const achievementSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  title: String,
  description: String,
  icon: String,
  earnedAt: { type: Date, default: Date.now }
});

// Team Challenge Schema
const teamChallengeSchema = new mongoose.Schema({
  team: { type: String, required: true },
  title: String,
  description: String,
  type: String,
  difficulty: String,
  points: Number,
  timeLimit: Number,
  createdAt: { type: Date, default: Date.now }
});

// User Team Progress Schema
const userTeamProgressSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  team: { type: String, required: true },
  challengeId: { type: mongoose.Schema.Types.ObjectId, ref: 'TeamChallenge' },
  score: Number,
  completedAt: { type: Date, default: Date.now }
});

// Cyber Lab Result Schema
const cyberLabResultSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  labId: String,
  score: Number,
  completedAt: { type: Date, default: Date.now }
});

// Community Post Schema
const communityPostSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  title: String,
  content: String,
  likes: { type: Number, default: 0 },
  commentCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

// Post Comment Schema
const postCommentSchema = new mongoose.Schema({
  postId: { type: mongoose.Schema.Types.ObjectId, ref: 'CommunityPost', required: true },
  userId: { type: String, required: true },
  content: String,
  createdAt: { type: Date, default: Date.now }
});

// Export models
export const User = mongoose.model('User', userSchema);
export const Quiz = mongoose.model('Quiz', quizSchema);
export const Activity = mongoose.model('Activity', activitySchema);
export const UserQuizResult = mongoose.model('UserQuizResult', userQuizResultSchema);
export const UserActivityResult = mongoose.model('UserActivityResult', userActivityResultSchema);
export const Achievement = mongoose.model('Achievement', achievementSchema);
export const TeamChallenge = mongoose.model('TeamChallenge', teamChallengeSchema);
export const UserTeamProgress = mongoose.model('UserTeamProgress', userTeamProgressSchema);
export const CyberLabResult = mongoose.model('CyberLabResult', cyberLabResultSchema);
export const CommunityPost = mongoose.model('CommunityPost', communityPostSchema);
export const PostComment = mongoose.model('PostComment', postCommentSchema);