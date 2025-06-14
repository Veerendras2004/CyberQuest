import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  totalScore: integer("total_score").default(0),
  streak: integer("streak").default(0),
  teamSelection: text("team_selection"), // "red", "white", or null
  lastActivity: timestamp("last_activity"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const quizzes = pgTable("quizzes", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  difficulty: text("difficulty").notNull(), // easy, medium, hard
  timeLimit: integer("time_limit").default(60), // seconds per question
  createdAt: timestamp("created_at").defaultNow(),
});

export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  quizId: integer("quiz_id").references(() => quizzes.id),
  questionText: text("question_text").notNull(),
  options: json("options").$type<string[]>().notNull(),
  correctAnswer: integer("correct_answer").notNull(), // index of correct option
  points: integer("points").default(10),
  order: integer("order").notNull(),
});

export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  type: text("type").notNull(), // word_scramble, number_puzzle, memory_match
  category: text("category").notNull(),
  difficulty: text("difficulty").notNull(),
  timeEstimate: text("time_estimate"), // "5-10 min"
  gameData: json("game_data").$type<any>(), // specific game configuration
  maxScore: integer("max_score").default(100),
  imageUrl: text("image_url"),
  isNew: boolean("is_new").default(false),
  isPopular: boolean("is_popular").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userQuizResults = pgTable("user_quiz_results", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  quizId: integer("quiz_id").references(() => quizzes.id),
  score: integer("score").notNull(),
  totalQuestions: integer("total_questions").notNull(),
  correctAnswers: integer("correct_answers").notNull(),
  timeSpent: integer("time_spent"), // total seconds
  completedAt: timestamp("completed_at").defaultNow(),
});

export const userActivityResults = pgTable("user_activity_results", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  activityId: integer("activity_id").references(() => activities.id),
  score: integer("score").notNull(),
  timeSpent: integer("time_spent"), // seconds
  gameState: json("game_state").$type<any>(), // final game state
  completedAt: timestamp("completed_at").defaultNow(),
});

export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  type: text("type").notNull(), // badge, milestone, streak
  title: text("title").notNull(),
  description: text("description"),
  iconName: text("icon_name"), // FontAwesome icon name
  earnedAt: timestamp("earned_at").defaultNow(),
});

export const teamChallenges = pgTable("team_challenges", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  team: text("team").notNull(), // "red" or "white"
  category: text("category").notNull(), // e.g., "penetration_testing", "incident_response"
  difficulty: text("difficulty").notNull(),
  type: text("type").notNull(), // "simulation", "quiz", "lab"
  content: json("content").$type<any>(), // challenge-specific data
  maxScore: integer("max_score").default(100),
  unlockLevel: integer("unlock_level").default(1),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userTeamProgress = pgTable("user_team_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  challengeId: integer("challenge_id").references(() => teamChallenges.id),
  score: integer("score").notNull(),
  completed: boolean("completed").default(false),
  timeSpent: integer("time_spent"), // seconds
  attempts: integer("attempts").default(1),
  completedAt: timestamp("completed_at").defaultNow(),
});

export const cyberLabResults = pgTable("cyber_lab_results", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  labType: text("lab_type").notNull(), // "phishing", "malware", "social_engineering"
  score: integer("score").notNull(),
  totalQuestions: integer("total_questions").notNull(),
  correctAnswers: integer("correct_answers").notNull(),
  timeSpent: integer("time_spent"),
  completedAt: timestamp("completed_at").defaultNow(),
});

export const communityPosts = pgTable("community_posts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  username: text("username").notNull(),
  content: text("content").notNull(),
  tags: text("tags").array(),
  likes: integer("likes").default(0),
  commentCount: integer("comment_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const postComments = pgTable("post_comments", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").references(() => communityPosts.id),
  userId: integer("user_id").references(() => users.id),
  username: text("username").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  quizResults: many(userQuizResults),
  activityResults: many(userActivityResults),
  achievements: many(achievements),
}));

export const quizzesRelations = relations(quizzes, ({ many }) => ({
  questions: many(questions),
  results: many(userQuizResults),
}));

export const questionsRelations = relations(questions, ({ one }) => ({
  quiz: one(quizzes, {
    fields: [questions.quizId],
    references: [quizzes.id],
  }),
}));

export const activitiesRelations = relations(activities, ({ many }) => ({
  results: many(userActivityResults),
}));

export const userQuizResultsRelations = relations(userQuizResults, ({ one }) => ({
  user: one(users, {
    fields: [userQuizResults.userId],
    references: [users.id],
  }),
  quiz: one(quizzes, {
    fields: [userQuizResults.quizId],
    references: [quizzes.id],
  }),
}));

export const userActivityResultsRelations = relations(userActivityResults, ({ one }) => ({
  user: one(users, {
    fields: [userActivityResults.userId],
    references: [users.id],
  }),
  activity: one(activities, {
    fields: [userActivityResults.activityId],
    references: [activities.id],
  }),
}));

export const achievementsRelations = relations(achievements, ({ one }) => ({
  user: one(users, {
    fields: [achievements.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  totalScore: true,
  streak: true,
  lastActivity: true,
  createdAt: true,
});

export const insertQuizSchema = createInsertSchema(quizzes).omit({
  id: true,
  createdAt: true,
});

export const insertQuestionSchema = createInsertSchema(questions).omit({
  id: true,
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
  createdAt: true,
});

export const insertUserQuizResultSchema = createInsertSchema(userQuizResults).omit({
  id: true,
  completedAt: true,
});

export const insertUserActivityResultSchema = createInsertSchema(userActivityResults).omit({
  id: true,
  completedAt: true,
});

export const insertAchievementSchema = createInsertSchema(achievements).omit({
  id: true,
  earnedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Quiz = typeof quizzes.$inferSelect;
export type InsertQuiz = z.infer<typeof insertQuizSchema>;
export type Question = typeof questions.$inferSelect;
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;
export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type UserQuizResult = typeof userQuizResults.$inferSelect;
export type InsertUserQuizResult = z.infer<typeof insertUserQuizResultSchema>;
export type UserActivityResult = typeof userActivityResults.$inferSelect;
export type InsertUserActivityResult = z.infer<typeof insertUserActivityResultSchema>;
export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;
