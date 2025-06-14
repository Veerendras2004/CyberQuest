import mongoose from 'mongoose';
import { User, Quiz, Activity, UserQuizResult, UserActivityResult, Achievement, TeamChallenge, UserTeamProgress, CyberLabResult, CommunityPost, PostComment } from './models';

// Remove all Drizzle imports and use only MongoDB types
export interface IStorage {
  // Users
  getUser(id: string): Promise<any | null>;
  getUserByUsername(username: string): Promise<any | null>;
  createUser(user: any): Promise<any>;
  updateUserScore(userId: string, scoreToAdd: number): Promise<void>;
  updateUserStreak(userId: string, streak: number): Promise<void>;

  // Quizzes
  getAllQuizzes(): Promise<any[]>;
  getQuizById(id: string): Promise<any | null>;
  getQuestionsByQuizId(quizId: string): Promise<any[]>;
  createQuiz(quiz: any): Promise<any>;
  createQuestion(question: any): Promise<any>;

  // Activities
  getAllActivities(): Promise<any[]>;
  getActivityById(id: string): Promise<any | null>;
  createActivity(activity: any): Promise<any>;

  // Results
  saveQuizResult(result: any): Promise<any>;
  saveActivityResult(result: any): Promise<any>;
  getUserQuizResults(userId: string): Promise<any[]>;
  getUserActivityResults(userId: string): Promise<any[]>;

  // Leaderboard
  getLeaderboard(limit?: number): Promise<Array<any & { rank: number }>>;
  getUserRank(userId: string): Promise<number>;

  // Achievements
  getUserAchievements(userId: string): Promise<any[]>;
  createAchievement(achievement: any): Promise<any>;

  // Dashboard stats
  getUserStats(userId: string): Promise<{
    totalScore: number;
    rank: number;
    streak: number;
    avgScore: number;
    completedQuizzes: number;
    completedActivities: number;
    timeSpent: number;
    weeklyScores: number[];
  }>;

  // Team management
  updateUserTeam(userId: string, team: string): Promise<void>;
  getUserTeam(userId: string): Promise<string | null>;

  // Team challenges
  getTeamChallenges(team: string): Promise<any[]>;
  getTeamChallengeById(id: string): Promise<any | null>;
  createTeamChallenge(challenge: any): Promise<any>;
  getUserTeamProgress(userId: string, team: string): Promise<any[]>;
  saveTeamProgress(progress: any): Promise<any>;

  // Cyber lab
  saveCyberLabResult(result: any): Promise<any>;
  getUserCyberLabResults(userId: string): Promise<any[]>;

  // Community
  getCommunityPosts(limit?: number): Promise<any[]>;
  createCommunityPost(post: any): Promise<any>;
  getPostComments(postId: string): Promise<any[]>;
  createPostComment(comment: any): Promise<any>;
  likePost(postId: string): Promise<void>;
}

export class MongoDBStorage implements IStorage {
  async getUser(id: string): Promise<any | null> {
    try {
      let user = await User.findById(id);
      if (!user) {
        // Create a default user if not found
        const defaultUser = new User({
          _id: new mongoose.Types.ObjectId(id.length === 24 ? id : undefined),
          firstName: "Alex",
          lastName: "User",
          email: "alex@example.com",
          totalScore: 0,
          level: 1,
          experience: 0,
          streak: 0,
          lastActivity: new Date(),
          achievements: [],
          teamSelection: null,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        user = await defaultUser.save();
      }
      return user;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  }

  async getUserByUsername(username: string): Promise<any | null> {
    try {
      return await User.findOne({ username });
    } catch (error) {
      console.error('Error getting user by username:', error);
      return null;
    }
  }

  async createUser(user: any): Promise<any> {
    try {
      const newUser = new User(user);
      return await newUser.save();
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async updateUserScore(userId: string, scoreToAdd: number): Promise<void> {
    try {
      await User.findByIdAndUpdate(userId, {
        $inc: { totalScore: scoreToAdd },
        lastActivity: new Date()
      });
    } catch (error) {
      console.error('Error updating user score:', error);
    }
  }

  async updateUserStreak(userId: string, streak: number): Promise<void> {
    try {
      await User.findByIdAndUpdate(userId, {
        streak,
        lastActivity: new Date()
      });
    } catch (error) {
      console.error('Error updating user streak:', error);
    }
  }

  async getAllQuizzes(): Promise<any[]> {
    try {
      return await Quiz.find().sort({ createdAt: -1 });
    } catch (error) {
      console.error('Error getting all quizzes:', error);
      return [];
    }
  }

  async getQuizById(id: string): Promise<any | null> {
    try {
      return await Quiz.findById(id);
    } catch (error) {
      console.error('Error getting quiz by ID:', error);
      return null;
    }
  }

  async getQuestionsByQuizId(quizId: string): Promise<any[]> {
    try {
      const quiz = await Quiz.findById(quizId);
      return quiz?.questions || [];
    } catch (error) {
      console.error('Error getting questions by quiz ID:', error);
      return [];
    }
  }

  async createQuiz(quiz: any): Promise<any> {
    try {
      const newQuiz = new Quiz(quiz);
      return await newQuiz.save();
    } catch (error) {
      console.error('Error creating quiz:', error);
      throw error;
    }
  }

  async createQuestion(question: any): Promise<any> {
    try {
      // Add question to existing quiz
      const quiz = await Quiz.findById(question.quizId);
      if (!quiz) throw new Error('Quiz not found');
      
      quiz.questions.push({
        questionText: question.questionText,
        options: question.options,
        correctAnswer: question.correctAnswer,
        points: question.points,
        order: question.order
      });
      
      await quiz.save();
      return quiz.questions[quiz.questions.length - 1];
    } catch (error) {
      console.error('Error creating question:', error);
      throw error;
    }
  }

  async getAllActivities(): Promise<any[]> {
    try {
      return await Activity.find().sort({ createdAt: -1 });
    } catch (error) {
      console.error('Error getting all activities:', error);
      return [];
    }
  }

  async getActivityById(id: string): Promise<any | null> {
    try {
      return await Activity.findById(id);
    } catch (error) {
      console.error('Error getting activity by ID:', error);
      return null;
    }
  }

  async createActivity(activity: any): Promise<any> {
    try {
      const newActivity = new Activity(activity);
      return await newActivity.save();
    } catch (error) {
      console.error('Error creating activity:', error);
      throw error;
    }
  }

  async saveQuizResult(result: any): Promise<any> {
    try {
      const newResult = new UserQuizResult(result);
      await newResult.save();
      if (result.userId && result.score) {
        await this.updateUserScore(result.userId, result.score);
      }
      return newResult;
    } catch (error) {
      console.error('Error saving quiz result:', error);
      throw error;
    }
  }

  async saveActivityResult(result: any): Promise<any> {
    try {
      const newResult = new UserActivityResult(result);
      await newResult.save();
      if (result.userId && result.score) {
        await this.updateUserScore(result.userId, result.score);
      }
      return newResult;
    } catch (error) {
      console.error('Error saving activity result:', error);
      throw error;
    }
  }

  async getUserQuizResults(userId: string): Promise<any[]> {
    try {
      return await UserQuizResult.find({ userId }).sort({ completedAt: -1 });
    } catch (error) {
      console.error('Error getting user quiz results:', error);
      return [];
    }
  }

  async getUserActivityResults(userId: string): Promise<any[]> {
    try {
      return await UserActivityResult.find({ userId }).sort({ completedAt: -1 });
    } catch (error) {
      console.error('Error getting user activity results:', error);
      return [];
    }
  }

  async getLeaderboard(limit = 100): Promise<Array<any & { rank: number }>> {
    try {
      const users = await User.find()
        .sort({ totalScore: -1 })
        .limit(limit);
      
      return users.map((user, index) => ({
        ...user.toObject(),
        rank: index + 1
      }));
    } catch (error) {
      console.error('Error getting leaderboard:', error);
      return [];
    }
  }

  async getUserRank(userId: string): Promise<number> {
    try {
      const user = await User.findById(userId);
      if (!user) return 0;

      const count = await User.countDocuments({ totalScore: { $gt: user.totalScore } });
      return count + 1;
    } catch (error) {
      console.error('Error getting user rank:', error);
      return 0;
    }
  }

  async getUserAchievements(userId: string): Promise<any[]> {
    try {
      return await Achievement.find({ userId }).sort({ earnedAt: -1 });
    } catch (error) {
      console.error('Error getting user achievements:', error);
      return [];
    }
  }

  async createAchievement(achievement: any): Promise<any> {
    try {
      const newAchievement = new Achievement(achievement);
      return await newAchievement.save();
    } catch (error) {
      console.error('Error creating achievement:', error);
      throw error;
    }
  }

  async getUserStats(userId: string): Promise<{
    totalScore: number;
    rank: number;
    streak: number;
    avgScore: number;
    completedQuizzes: number;
    completedActivities: number;
    timeSpent: number;
    weeklyScores: number[];
  }> {
    try {
      const user = await this.getUser(userId);
      if (!user) throw new Error('User not found');

      const rank = await this.getUserRank(userId);
      const quizResults = await UserQuizResult.find({ userId });
      const activityResults = await UserActivityResult.find({ userId });

      const totalScore = user.totalScore || 0;
      const streak = user.streak || 0;
      const completedQuizzes = quizResults.length;
      const completedActivities = activityResults.length;
      const timeSpent = quizResults.reduce((sum, r) => sum + (r.timeSpent || 0), 0) +
                       activityResults.reduce((sum, r) => sum + (r.timeSpent || 0), 0);
      
      const avgScore = (quizResults.reduce((sum, r) => sum + r.score, 0) +
                       activityResults.reduce((sum, r) => sum + r.score, 0)) /
                      (completedQuizzes + completedActivities || 1);

      // Get weekly scores (last 7 days)
      const weeklyScores = await Promise.all(
        Array.from({ length: 7 }, async (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const startOfDay = new Date(date.setHours(0, 0, 0, 0));
          const endOfDay = new Date(date.setHours(23, 59, 59, 999));

          const dayQuizResults = await UserQuizResult.find({
            userId,
            completedAt: { $gte: startOfDay, $lte: endOfDay }
          });
          const dayActivityResults = await UserActivityResult.find({
            userId,
            completedAt: { $gte: startOfDay, $lte: endOfDay }
          });

          return dayQuizResults.reduce((sum, r) => sum + r.score, 0) +
                 dayActivityResults.reduce((sum, r) => sum + r.score, 0);
        })
      );

      return {
        totalScore,
        rank,
        streak,
        avgScore: Math.round(avgScore),
        completedQuizzes,
        completedActivities,
        timeSpent,
        weeklyScores
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      return {
        totalScore: 0,
        rank: 0,
        streak: 0,
        avgScore: 0,
        completedQuizzes: 0,
        completedActivities: 0,
        timeSpent: 0,
        weeklyScores: [0, 0, 0, 0, 0, 0, 0]
      };
    }
  }

  // Implementing remaining methods with proper error handling...
  async updateUserTeam(userId: string, team: string): Promise<void> {
    try {
      await User.findByIdAndUpdate(userId, { teamSelection: team });
    } catch (error) {
      console.error('Error updating user team:', error);
    }
  }

  async getUserTeam(userId: string): Promise<string | null> {
    try {
      const user = await User.findById(userId);
      return user?.teamSelection || null;
    } catch (error) {
      console.error('Error getting user team:', error);
      return null;
    }
  }

  async getTeamChallenges(team: string): Promise<any[]> {
    try {
      return await TeamChallenge.find({ team }).sort({ createdAt: -1 });
    } catch (error) {
      console.error('Error getting team challenges:', error);
      return [];
    }
  }

  async getTeamChallengeById(id: string): Promise<any | null> {
    try {
      return await TeamChallenge.findById(id);
    } catch (error) {
      console.error('Error getting team challenge by ID:', error);
      return null;
    }
  }

  async createTeamChallenge(challenge: any): Promise<any> {
    try {
      const newChallenge = new TeamChallenge(challenge);
      return await newChallenge.save();
    } catch (error) {
      console.error('Error creating team challenge:', error);
      throw error;
    }
  }

  async getUserTeamProgress(userId: string, team: string): Promise<any[]> {
    try {
      return await UserTeamProgress.find({ userId, team }).sort({ completedAt: -1 });
    } catch (error) {
      console.error('Error getting user team progress:', error);
      return [];
    }
  }

  async saveTeamProgress(progress: any): Promise<any> {
    try {
      const newProgress = new UserTeamProgress(progress);
      return await newProgress.save();
    } catch (error) {
      console.error('Error saving team progress:', error);
      throw error;
    }
  }

  async saveCyberLabResult(result: any): Promise<any> {
    try {
      const newResult = new CyberLabResult(result);
      return await newResult.save();
    } catch (error) {
      console.error('Error saving cyber lab result:', error);
      throw error;
    }
  }

  async getUserCyberLabResults(userId: string): Promise<any[]> {
    try {
      return await CyberLabResult.find({ userId }).sort({ completedAt: -1 });
    } catch (error) {
      console.error('Error getting user cyber lab results:', error);
      return [];
    }
  }

  async getCommunityPosts(limit = 50): Promise<any[]> {
    try {
      return await CommunityPost.find().sort({ createdAt: -1 }).limit(limit);
    } catch (error) {
      console.error('Error getting community posts:', error);
      return [];
    }
  }

  async createCommunityPost(post: any): Promise<any> {
    try {
      const newPost = new CommunityPost(post);
      return await newPost.save();
    } catch (error) {
      console.error('Error creating community post:', error);
      throw error;
    }
  }

  async getPostComments(postId: string): Promise<any[]> {
    try {
      return await PostComment.find({ postId }).sort({ createdAt: -1 });
    } catch (error) {
      console.error('Error getting post comments:', error);
      return [];
    }
  }

  async createPostComment(comment: any): Promise<any> {
    try {
      const newComment = new PostComment(comment);
      await newComment.save();
      await CommunityPost.findByIdAndUpdate(comment.postId, {
        $inc: { commentCount: 1 }
      });
      return newComment;
    } catch (error) {
      console.error('Error creating post comment:', error);
      throw error;
    }
  }

  async likePost(postId: string): Promise<void> {
    try {
      await CommunityPost.findByIdAndUpdate(postId, {
        $inc: { likes: 1 }
      });
    } catch (error) {
      console.error('Error liking post:', error);
    }
  }
}

export const storage = new MongoDBStorage();