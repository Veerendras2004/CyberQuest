import { 
  users, quizzes, questions, activities, userQuizResults, userActivityResults, achievements,
  teamChallenges, userTeamProgress, cyberLabResults, communityPosts, postComments,
  type User, type InsertUser, type Quiz, type InsertQuiz, type Question, type InsertQuestion,
  type Activity, type InsertActivity, type UserQuizResult, type InsertUserQuizResult,
  type UserActivityResult, type InsertUserActivityResult, type Achievement, type InsertAchievement,
  type TeamChallenge, type InsertTeamChallenge, type UserTeamProgress, type InsertUserTeamProgress,
  type CyberLabResult, type InsertCyberLabResult, type CommunityPost, type InsertCommunityPost,
  type PostComment, type InsertPostComment
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, and, gte, lte } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserScore(userId: number, scoreToAdd: number): Promise<void>;
  updateUserStreak(userId: number, streak: number): Promise<void>;

  // Quizzes
  getAllQuizzes(): Promise<Quiz[]>;
  getQuizById(id: number): Promise<Quiz | undefined>;
  getQuestionsByQuizId(quizId: number): Promise<Question[]>;
  createQuiz(quiz: InsertQuiz): Promise<Quiz>;
  createQuestion(question: InsertQuestion): Promise<Question>;

  // Activities
  getAllActivities(): Promise<Activity[]>;
  getActivityById(id: number): Promise<Activity | undefined>;
  createActivity(activity: InsertActivity): Promise<Activity>;

  // Results
  saveQuizResult(result: InsertUserQuizResult): Promise<UserQuizResult>;
  saveActivityResult(result: InsertUserActivityResult): Promise<UserActivityResult>;
  getUserQuizResults(userId: number): Promise<UserQuizResult[]>;
  getUserActivityResults(userId: number): Promise<UserActivityResult[]>;

  // Leaderboard
  getLeaderboard(limit?: number): Promise<Array<User & { rank: number }>>;
  getUserRank(userId: number): Promise<number>;

  // Achievements
  getUserAchievements(userId: number): Promise<Achievement[]>;
  createAchievement(achievement: InsertAchievement): Promise<Achievement>;

  // Dashboard stats
  getUserStats(userId: number): Promise<{
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
  updateUserTeam(userId: number, team: string): Promise<void>;
  getUserTeam(userId: number): Promise<string | null>;

  // Team challenges
  getTeamChallenges(team: string): Promise<TeamChallenge[]>;
  getTeamChallengeById(id: number): Promise<TeamChallenge | undefined>;
  createTeamChallenge(challenge: InsertTeamChallenge): Promise<TeamChallenge>;
  getUserTeamProgress(userId: number, team: string): Promise<UserTeamProgress[]>;
  saveTeamProgress(progress: InsertUserTeamProgress): Promise<UserTeamProgress>;

  // Cyber lab
  saveCyberLabResult(result: InsertCyberLabResult): Promise<CyberLabResult>;
  getUserCyberLabResults(userId: number): Promise<CyberLabResult[]>;

  // Community
  getCommunityPosts(limit?: number): Promise<CommunityPost[]>;
  createCommunityPost(post: InsertCommunityPost): Promise<CommunityPost>;
  getPostComments(postId: number): Promise<PostComment[]>;
  createPostComment(comment: InsertPostComment): Promise<PostComment>;
  likePost(postId: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUserScore(userId: number, scoreToAdd: number): Promise<void> {
    await db
      .update(users)
      .set({ 
        totalScore: sql`${users.totalScore} + ${scoreToAdd}`,
        lastActivity: new Date()
      })
      .where(eq(users.id, userId));
  }

  async updateUserStreak(userId: number, streak: number): Promise<void> {
    await db
      .update(users)
      .set({ streak, lastActivity: new Date() })
      .where(eq(users.id, userId));
  }

  async getAllQuizzes(): Promise<Quiz[]> {
    return await db.select().from(quizzes).orderBy(desc(quizzes.createdAt));
  }

  async getQuizById(id: number): Promise<Quiz | undefined> {
    const [quiz] = await db.select().from(quizzes).where(eq(quizzes.id, id));
    return quiz || undefined;
  }

  async getQuestionsByQuizId(quizId: number): Promise<Question[]> {
    return await db
      .select()
      .from(questions)
      .where(eq(questions.quizId, quizId))
      .orderBy(questions.order);
  }

  async createQuiz(quiz: InsertQuiz): Promise<Quiz> {
    const [newQuiz] = await db.insert(quizzes).values(quiz).returning();
    return newQuiz;
  }

  async createQuestion(question: InsertQuestion): Promise<Question> {
    const [newQuestion] = await db.insert(questions).values(question).returning();
    return newQuestion;
  }

  async getAllActivities(): Promise<Activity[]> {
    return await db.select().from(activities).orderBy(desc(activities.createdAt));
  }

  async getActivityById(id: number): Promise<Activity | undefined> {
    const [activity] = await db.select().from(activities).where(eq(activities.id, id));
    return activity || undefined;
  }

  async createActivity(activity: InsertActivity): Promise<Activity> {
    const [newActivity] = await db.insert(activities).values(activity).returning();
    return newActivity;
  }

  async saveQuizResult(result: InsertUserQuizResult): Promise<UserQuizResult> {
    const [newResult] = await db.insert(userQuizResults).values(result).returning();
    await this.updateUserScore(result.userId, result.score);
    return newResult;
  }

  async saveActivityResult(result: InsertUserActivityResult): Promise<UserActivityResult> {
    const [newResult] = await db.insert(userActivityResults).values(result).returning();
    await this.updateUserScore(result.userId, result.score);
    return newResult;
  }

  async getUserQuizResults(userId: number): Promise<UserQuizResult[]> {
    return await db
      .select()
      .from(userQuizResults)
      .where(eq(userQuizResults.userId, userId))
      .orderBy(desc(userQuizResults.completedAt));
  }

  async getUserActivityResults(userId: number): Promise<UserActivityResult[]> {
    return await db
      .select()
      .from(userActivityResults)
      .where(eq(userActivityResults.userId, userId))
      .orderBy(desc(userActivityResults.completedAt));
  }

  async getLeaderboard(limit = 100): Promise<Array<User & { rank: number }>> {
    const usersWithRank = await db
      .select({
        id: users.id,
        username: users.username,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        totalScore: users.totalScore,
        streak: users.streak,
        lastActivity: users.lastActivity,
        createdAt: users.createdAt,
        password: users.password,
        rank: sql<number>`ROW_NUMBER() OVER (ORDER BY ${users.totalScore} DESC)`.as('rank')
      })
      .from(users)
      .orderBy(desc(users.totalScore))
      .limit(limit);

    return usersWithRank;
  }

  async getUserRank(userId: number): Promise<number> {
    const user = await this.getUser(userId);
    if (!user) return 0;

    const [result] = await db
      .select({ rank: sql<number>`COUNT(*) + 1` })
      .from(users)
      .where(sql`${users.totalScore} > ${user.totalScore}`);

    return result?.rank || 1;
  }

  async getUserAchievements(userId: number): Promise<Achievement[]> {
    return await db
      .select()
      .from(achievements)
      .where(eq(achievements.userId, userId))
      .orderBy(desc(achievements.earnedAt));
  }

  async createAchievement(achievement: InsertAchievement): Promise<Achievement> {
    const [newAchievement] = await db.insert(achievements).values(achievement).returning();
    return newAchievement;
  }

  async getUserStats(userId: number): Promise<{
    totalScore: number;
    rank: number;
    streak: number;
    avgScore: number;
    completedQuizzes: number;
    completedActivities: number;
    timeSpent: number;
    weeklyScores: number[];
  }> {
    const user = await this.getUser(userId);
    if (!user) {
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

    const rank = await this.getUserRank(userId);
    
    const [quizStats] = await db
      .select({
        count: sql<number>`COUNT(*)`,
        avgScore: sql<number>`COALESCE(AVG(${userQuizResults.score}), 0)`,
        totalTime: sql<number>`COALESCE(SUM(${userQuizResults.timeSpent}), 0)`
      })
      .from(userQuizResults)
      .where(eq(userQuizResults.userId, userId));

    const [activityStats] = await db
      .select({
        count: sql<number>`COUNT(*)`,
        totalTime: sql<number>`COALESCE(SUM(${userActivityResults.timeSpent}), 0)`
      })
      .from(userActivityResults)
      .where(eq(userActivityResults.userId, userId));

    // Get weekly scores (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const weeklyQuizScores = await db
      .select({
        date: sql<string>`DATE(${userQuizResults.completedAt})`,
        totalScore: sql<number>`SUM(${userQuizResults.score})`
      })
      .from(userQuizResults)
      .where(
        and(
          eq(userQuizResults.userId, userId),
          gte(userQuizResults.completedAt, weekAgo)
        )
      )
      .groupBy(sql`DATE(${userQuizResults.completedAt})`)
      .orderBy(sql`DATE(${userQuizResults.completedAt})`);

    const weeklyActivityScores = await db
      .select({
        date: sql<string>`DATE(${userActivityResults.completedAt})`,
        totalScore: sql<number>`SUM(${userActivityResults.score})`
      })
      .from(userActivityResults)
      .where(
        and(
          eq(userActivityResults.userId, userId),
          gte(userActivityResults.completedAt, weekAgo)
        )
      )
      .groupBy(sql`DATE(${userActivityResults.completedAt})`)
      .orderBy(sql`DATE(${userActivityResults.completedAt})`);

    // Combine and format weekly scores
    const scoresByDate = new Map<string, number>();
    weeklyQuizScores.forEach(({ date, totalScore }) => {
      scoresByDate.set(date, (scoresByDate.get(date) || 0) + totalScore);
    });
    weeklyActivityScores.forEach(({ date, totalScore }) => {
      scoresByDate.set(date, (scoresByDate.get(date) || 0) + totalScore);
    });

    const weeklyScores: number[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      weeklyScores.push(scoresByDate.get(dateStr) || 0);
    }

    return {
      totalScore: user.totalScore || 0,
      rank,
      streak: user.streak || 0,
      avgScore: Math.round(quizStats?.avgScore || 0),
      completedQuizzes: quizStats?.count || 0,
      completedActivities: activityStats?.count || 0,
      timeSpent: Math.round(((quizStats?.totalTime || 0) + (activityStats?.totalTime || 0)) / 3600 * 10) / 10, // hours
      weeklyScores
    };
  }

  // Team management methods
  async updateUserTeam(userId: number, team: string): Promise<void> {
    await db
      .update(users)
      .set({ teamSelection: team })
      .where(eq(users.id, userId));
  }

  async getUserTeam(userId: number): Promise<string | null> {
    const user = await this.getUser(userId);
    return user?.teamSelection || null;
  }

  // Team challenges methods
  async getTeamChallenges(team: string): Promise<TeamChallenge[]> {
    return await db
      .select()
      .from(teamChallenges)
      .where(eq(teamChallenges.team, team))
      .orderBy(teamChallenges.unlockLevel, desc(teamChallenges.createdAt));
  }

  async getTeamChallengeById(id: number): Promise<TeamChallenge | undefined> {
    const [challenge] = await db
      .select()
      .from(teamChallenges)
      .where(eq(teamChallenges.id, id));
    return challenge || undefined;
  }

  async createTeamChallenge(challenge: InsertTeamChallenge): Promise<TeamChallenge> {
    const [newChallenge] = await db
      .insert(teamChallenges)
      .values(challenge)
      .returning();
    return newChallenge;
  }

  async getUserTeamProgress(userId: number, team: string): Promise<UserTeamProgress[]> {
    return await db
      .select()
      .from(userTeamProgress)
      .innerJoin(teamChallenges, eq(userTeamProgress.challengeId, teamChallenges.id))
      .where(and(
        eq(userTeamProgress.userId, userId),
        eq(teamChallenges.team, team)
      ))
      .orderBy(desc(userTeamProgress.completedAt));
  }

  async saveTeamProgress(progress: InsertUserTeamProgress): Promise<UserTeamProgress> {
    const [newProgress] = await db
      .insert(userTeamProgress)
      .values(progress)
      .returning();
    
    // Update user total score
    if (progress.userId && progress.score) {
      await this.updateUserScore(progress.userId, progress.score);
    }
    
    return newProgress;
  }

  // Cyber lab methods
  async saveCyberLabResult(result: InsertCyberLabResult): Promise<CyberLabResult> {
    const [newResult] = await db
      .insert(cyberLabResults)
      .values(result)
      .returning();
    
    // Update user total score
    if (result.userId && result.score) {
      await this.updateUserScore(result.userId, result.score);
    }
    
    return newResult;
  }

  async getUserCyberLabResults(userId: number): Promise<CyberLabResult[]> {
    return await db
      .select()
      .from(cyberLabResults)
      .where(eq(cyberLabResults.userId, userId))
      .orderBy(desc(cyberLabResults.completedAt));
  }

  // Community methods
  async getCommunityPosts(limit = 50): Promise<CommunityPost[]> {
    return await db
      .select()
      .from(communityPosts)
      .orderBy(desc(communityPosts.createdAt))
      .limit(limit);
  }

  async createCommunityPost(post: InsertCommunityPost): Promise<CommunityPost> {
    const [newPost] = await db
      .insert(communityPosts)
      .values(post)
      .returning();
    return newPost;
  }

  async getPostComments(postId: number): Promise<PostComment[]> {
    return await db
      .select()
      .from(postComments)
      .where(eq(postComments.postId, postId))
      .orderBy(postComments.createdAt);
  }

  async createPostComment(comment: InsertPostComment): Promise<PostComment> {
    const [newComment] = await db
      .insert(postComments)
      .values(comment)
      .returning();
    
    // Update comment count on post
    await db
      .update(communityPosts)
      .set({ commentCount: sql`${communityPosts.commentCount} + 1` })
      .where(eq(communityPosts.id, comment.postId));
    
    return newComment;
  }

  async likePost(postId: number): Promise<void> {
    await db
      .update(communityPosts)
      .set({ likes: sql`${communityPosts.likes} + 1` })
      .where(eq(communityPosts.id, postId));
  }
}

export const storage = new DatabaseStorage();
