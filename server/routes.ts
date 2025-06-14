import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserQuizResultSchema, insertUserActivityResultSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // User routes
  app.get("/api/user/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  app.get("/api/user/:id/stats", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const stats = await storage.getUserStats(userId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user stats" });
    }
  });

  // Quiz routes
  app.get("/api/quizzes", async (req, res) => {
    try {
      const quizzes = await storage.getAllQuizzes();
      res.json(quizzes);
    } catch (error) {
      res.status(500).json({ message: "Failed to get quizzes" });
    }
  });

  app.get("/api/quiz/:id", async (req, res) => {
    try {
      const quizId = parseInt(req.params.id);
      const quiz = await storage.getQuizById(quizId);
      if (!quiz) {
        return res.status(404).json({ message: "Quiz not found" });
      }
      res.json(quiz);
    } catch (error) {
      res.status(500).json({ message: "Failed to get quiz" });
    }
  });

  app.get("/api/quiz/:id/questions", async (req, res) => {
    try {
      const quizId = parseInt(req.params.id);
      const questions = await storage.getQuestionsByQuizId(quizId);
      res.json(questions);
    } catch (error) {
      res.status(500).json({ message: "Failed to get questions" });
    }
  });

  app.post("/api/quiz/result", async (req, res) => {
    try {
      const validatedData = insertUserQuizResultSchema.parse(req.body);
      const result = await storage.saveQuizResult(validatedData);
      res.json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid quiz result data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to save quiz result" });
    }
  });

  // Activity routes
  app.get("/api/activities", async (req, res) => {
    try {
      const activities = await storage.getAllActivities();
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: "Failed to get activities" });
    }
  });

  app.get("/api/activity/:id", async (req, res) => {
    try {
      const activityId = parseInt(req.params.id);
      const activity = await storage.getActivityById(activityId);
      if (!activity) {
        return res.status(404).json({ message: "Activity not found" });
      }
      res.json(activity);
    } catch (error) {
      res.status(500).json({ message: "Failed to get activity" });
    }
  });

  app.post("/api/activity/result", async (req, res) => {
    try {
      const validatedData = insertUserActivityResultSchema.parse(req.body);
      const result = await storage.saveActivityResult(validatedData);
      res.json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid activity result data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to save activity result" });
    }
  });

  // Leaderboard routes
  app.get("/api/leaderboard", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
      const leaderboard = await storage.getLeaderboard(limit);
      res.json(leaderboard);
    } catch (error) {
      res.status(500).json({ message: "Failed to get leaderboard" });
    }
  });

  app.get("/api/user/:id/rank", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const rank = await storage.getUserRank(userId);
      res.json({ rank });
    } catch (error) {
      res.status(500).json({ message: "Failed to get user rank" });
    }
  });

  // Achievements routes
  app.get("/api/user/:id/achievements", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const achievements = await storage.getUserAchievements(userId);
      res.json(achievements);
    } catch (error) {
      res.status(500).json({ message: "Failed to get achievements" });
    }
  });

  // Results routes
  app.get("/api/user/:id/quiz-results", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const results = await storage.getUserQuizResults(userId);
      res.json(results);
    } catch (error) {
      res.status(500).json({ message: "Failed to get quiz results" });
    }
  });

  app.get("/api/user/:id/activity-results", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const results = await storage.getUserActivityResults(userId);
      res.json(results);
    } catch (error) {
      res.status(500).json({ message: "Failed to get activity results" });
    }
  });

  // Seed data for demonstration
  app.post("/api/seed", async (req, res) => {
    try {
      // Create sample user
      const user = await storage.createUser({
        username: "alexchen",
        password: "password123",
        firstName: "Alex",
        lastName: "Chen",
        email: "alex@example.com"
      });

      // Create sample quiz
      const quiz = await storage.createQuiz({
        title: "Mathematics Quiz",
        description: "Test your basic math skills",
        category: "Mathematics",
        difficulty: "medium",
        timeLimit: 60
      });

      // Create sample questions
      await storage.createQuestion({
        quizId: quiz.id,
        questionText: "What is 15 × 8?",
        options: ["120", "130", "125", "115"],
        correctAnswer: 0,
        points: 10,
        order: 1
      });

      await storage.createQuestion({
        quizId: quiz.id,
        questionText: "What is 144 ÷ 12?",
        options: ["11", "12", "13", "14"],
        correctAnswer: 1,
        points: 10,
        order: 2
      });

      // Create sample activities
      await storage.createActivity({
        title: "Word Scramble",
        description: "Unscramble letters to form words and improve your vocabulary skills.",
        type: "word_scramble",
        category: "Language",
        difficulty: "easy",
        timeEstimate: "5-10 min",
        maxScore: 100,
        imageUrl: "https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200",
        isNew: true,
        gameData: {
          words: ["LEARNING", "EDUCATION", "KNOWLEDGE", "STUDENT", "TEACHER"]
        }
      });

      await storage.createActivity({
        title: "Number Puzzle",
        description: "Solve mathematical puzzles and improve your problem-solving skills.",
        type: "number_puzzle",
        category: "Mathematics",
        difficulty: "medium",
        timeEstimate: "10-15 min",
        maxScore: 150,
        imageUrl: "https://images.unsplash.com/photo-1611996575749-79a3a250f948?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200",
        isPopular: true,
        gameData: {
          puzzles: [
            { sequence: [2, 4, 8, 16], answer: 32 },
            { sequence: [1, 1, 2, 3, 5], answer: 8 }
          ]
        }
      });

      await storage.createActivity({
        title: "Memory Match",
        description: "Test and improve your memory by matching pairs of cards.",
        type: "memory_match",
        category: "Memory",
        difficulty: "easy",
        timeEstimate: "3-8 min",
        maxScore: 200,
        imageUrl: "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200",
        gameData: {
          gridSize: 4,
          symbols: ["🎮", "🎯", "🏆", "⭐", "🎨", "🎪", "🎭", "🎲"]
        }
      });

      res.json({ message: "Sample data created successfully", userId: user.id });
    } catch (error) {
      res.status(500).json({ message: "Failed to seed data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
