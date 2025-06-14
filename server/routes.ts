import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserQuizResultSchema, insertUserActivityResultSchema, insertTeamChallengeSchema,
  insertUserTeamProgressSchema, insertCyberLabResultSchema, insertCommunityPostSchema,
  insertPostCommentSchema
} from "@shared/schema";
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

  // Seed cybersecurity learning data
  app.post("/api/seed", async (req, res) => {
    try {
      // Create sample user
      const user = await storage.createUser({
        username: "cybersec_learner",
        password: "SecurePass123!",
        firstName: "Alex",
        lastName: "Security",
        email: "alex@cybersec.learn"
      });

      // Create Beginner Cybersecurity Quiz
      const beginnerQuiz = await storage.createQuiz({
        title: "Cybersecurity Fundamentals",
        description: "Essential cybersecurity concepts for beginners",
        category: "Cybersecurity",
        difficulty: "easy", 
        timeLimit: 45
      });

      // Beginner Questions
      const beginnerQuestions = [
        {
          questionText: "What does the 'S' in HTTPS stand for?",
          options: ["Server", "Secure", "System", "Standard"],
          correctAnswer: 1,
          points: 10
        },
        {
          questionText: "Which of the following is considered a strong password?",
          options: ["password123", "123456", "P@ssw0rd#2024!", "qwerty"],
          correctAnswer: 2,
          points: 10
        },
        {
          questionText: "What is phishing?",
          options: ["A type of malware", "A method to catch fish", "A social engineering attack", "A firewall technique"],
          correctAnswer: 2,
          points: 10
        },
        {
          questionText: "Which protocol is used for secure email transmission?",
          options: ["HTTP", "FTP", "SMTP", "TLS/SSL"],
          correctAnswer: 3,
          points: 10
        },
        {
          questionText: "What is the primary purpose of a firewall?",
          options: ["Speed up internet", "Block malicious traffic", "Store passwords", "Encrypt files"],
          correctAnswer: 1,
          points: 10
        }
      ];

      for (let i = 0; i < beginnerQuestions.length; i++) {
        await storage.createQuestion({
          quizId: beginnerQuiz.id,
          ...beginnerQuestions[i],
          order: i + 1
        });
      }

      // Create Intermediate Cybersecurity Quiz
      const intermediateQuiz = await storage.createQuiz({
        title: "Network Security & Threats",
        description: "Advanced network security concepts and threat analysis",
        category: "Cybersecurity",
        difficulty: "medium",
        timeLimit: 60
      });

      // Intermediate Questions
      const intermediateQuestions = [
        {
          questionText: "Which type of attack involves overwhelming a server with traffic?",
          options: ["SQL Injection", "Cross-Site Scripting", "DDoS Attack", "Man-in-the-Middle"],
          correctAnswer: 2,
          points: 15
        },
        {
          questionText: "What is the main difference between symmetric and asymmetric encryption?",
          options: ["Speed of encryption", "Key usage", "Algorithm complexity", "File size"],
          correctAnswer: 1,
          points: 15
        },
        {
          questionText: "Which of these is NOT a common vulnerability in web applications?",
          options: ["SQL Injection", "Buffer Overflow", "CSRF", "Physical Access"],
          correctAnswer: 3,
          points: 15
        },
        {
          questionText: "What does IDS stand for in cybersecurity?",
          options: ["Internet Detection System", "Intrusion Detection System", "Internal Defense System", "Identity Defense Service"],
          correctAnswer: 1,
          points: 15
        },
        {
          questionText: "Which hashing algorithm is considered most secure currently?",
          options: ["MD5", "SHA-1", "SHA-256", "CRC32"],
          correctAnswer: 2,
          points: 15
        }
      ];

      for (let i = 0; i < intermediateQuestions.length; i++) {
        await storage.createQuestion({
          quizId: intermediateQuiz.id,
          ...intermediateQuestions[i],
          order: i + 1
        });
      }

      // Create Hard Cybersecurity Quiz
      const hardQuiz = await storage.createQuiz({
        title: "Advanced Cyber Defense",
        description: "Expert-level cybersecurity challenges and advanced topics",
        category: "Cybersecurity",
        difficulty: "hard",
        timeLimit: 90
      });

      // Hard Questions
      const hardQuestions = [
        {
          questionText: "In a zero-day exploit, what does 'zero-day' refer to?",
          options: ["Time to patch", "Days since discovery", "Attack duration", "Vulnerability lifespan"],
          correctAnswer: 0,
          points: 20
        },
        {
          questionText: "Which technique is used in advanced persistent threats (APTs)?",
          options: ["Quick in-and-out attacks", "Long-term stealthy presence", "Brute force attacks", "Social media manipulation"],
          correctAnswer: 1,
          points: 20
        },
        {
          questionText: "What is the primary goal of threat hunting?",
          options: ["Patch vulnerabilities", "Proactively find threats", "Train employees", "Install security tools"],
          correctAnswer: 1,
          points: 20
        },
        {
          questionText: "Which framework is commonly used for incident response?",
          options: ["OWASP", "NIST", "ISO 27001", "COBIT"],
          correctAnswer: 1,
          points: 20
        },
        {
          questionText: "What is lateral movement in cybersecurity?",
          options: ["Moving between network segments", "Physical security movement", "Data transfer protocols", "Firewall configuration"],
          correctAnswer: 0,
          points: 20
        }
      ];

      for (let i = 0; i < hardQuestions.length; i++) {
        await storage.createQuestion({
          quizId: hardQuiz.id,
          ...hardQuestions[i],
          order: i + 1
        });
      }

      // Create cybersecurity-themed activities
      await storage.createActivity({
        title: "Security Term Scramble",
        description: "Unscramble cybersecurity terms and strengthen your security vocabulary.",
        type: "word_scramble",
        category: "Cybersecurity",
        difficulty: "easy",
        timeEstimate: "5-10 min",
        maxScore: 100,
        imageUrl: "https://images.unsplash.com/photo-1563986768609-322da13575f3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200",
        isNew: true,
        gameData: {
          words: ["FIREWALL", "ENCRYPTION", "MALWARE", "PHISHING", "AUTHENTICATION", "VULNERABILITY", "INTRUSION", "CRYPTOGRAPHY"]
        }
      });

      await storage.createActivity({
        title: "Cyber Threat Sequence",
        description: "Identify patterns in cybersecurity attack sequences and improve threat detection skills.",
        type: "number_puzzle",
        category: "Cybersecurity",
        difficulty: "medium",
        timeEstimate: "10-15 min",
        maxScore: 150,
        imageUrl: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200",
        isPopular: true,
        gameData: {
          puzzles: [
            { sequence: [1, 2, 4, 8, 16], answer: 32, hint: "Binary progression" },
            { sequence: [80, 443, 22, 21], answer: 25, hint: "Common port numbers" },
            { sequence: [128, 192, 256, 384], answer: 512, hint: "Encryption key sizes" }
          ]
        }
      });

      await storage.createActivity({
        title: "Security Symbol Match",
        description: "Match cybersecurity symbols and icons to improve pattern recognition skills.",
        type: "memory_match",
        category: "Cybersecurity",
        difficulty: "easy",
        timeEstimate: "3-8 min",
        maxScore: 200,
        imageUrl: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200",
        gameData: {
          gridSize: 4,
          symbols: ["🔒", "🛡️", "🔑", "⚠️", "🚨", "🔐", "🛠️", "🎯"]
        }
      });

      await storage.createActivity({
        title: "Password Cracking Challenge",
        description: "Learn about password security by understanding common attack patterns.",
        type: "word_scramble",
        category: "Cybersecurity",
        difficulty: "hard",
        timeEstimate: "8-12 min",
        maxScore: 120,
        imageUrl: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200",
        gameData: {
          words: ["BRUTEFORCE", "DICTIONARY", "RAINBOW", "SALTING", "HASHING", "KEYLOGGER"]
        }
      });

      res.json({ message: "Cybersecurity learning data created successfully", userId: user.id });
    } catch (error) {
      console.error("Seed error:", error);
      res.status(500).json({ message: "Failed to seed data", error: error.message });
    }
  });

  // Team management routes
  app.get("/api/user/:id/team", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const team = await storage.getUserTeam(userId);
      res.json(team);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user team" });
    }
  });

  app.post("/api/user/:id/team", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { team } = req.body;
      await storage.updateUserTeam(userId, team);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to update user team" });
    }
  });

  // Team challenges routes
  app.get("/api/team-challenges/:team", async (req, res) => {
    try {
      const team = req.params.team;
      const challenges = await storage.getTeamChallenges(team);
      res.json(challenges);
    } catch (error) {
      res.status(500).json({ message: "Failed to get team challenges" });
    }
  });

  app.post("/api/team-progress", async (req, res) => {
    try {
      const validatedData = insertUserTeamProgressSchema.parse(req.body);
      const progress = await storage.saveTeamProgress(validatedData);
      res.json(progress);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid progress data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to save progress" });
    }
  });

  // Cyber lab routes
  app.get("/api/user/:id/cyber-lab-results", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const results = await storage.getUserCyberLabResults(userId);
      res.json(results);
    } catch (error) {
      res.status(500).json({ message: "Failed to get cyber lab results" });
    }
  });

  app.post("/api/cyber-lab-results", async (req, res) => {
    try {
      const validatedData = insertCyberLabResultSchema.parse(req.body);
      const result = await storage.saveCyberLabResult(validatedData);
      res.json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid lab result data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to save lab result" });
    }
  });

  // Community routes
  app.get("/api/community-posts", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const posts = await storage.getCommunityPosts(limit);
      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: "Failed to get community posts" });
    }
  });

  app.post("/api/community-posts", async (req, res) => {
    try {
      const validatedData = insertCommunityPostSchema.parse(req.body);
      const post = await storage.createCommunityPost(validatedData);
      res.json(post);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid post data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create post" });
    }
  });

  app.get("/api/community-posts/:id/comments", async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const comments = await storage.getPostComments(postId);
      res.json(comments);
    } catch (error) {
      res.status(500).json({ message: "Failed to get comments" });
    }
  });

  app.post("/api/post-comments", async (req, res) => {
    try {
      const validatedData = insertPostCommentSchema.parse(req.body);
      const comment = await storage.createPostComment(validatedData);
      res.json(comment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid comment data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create comment" });
    }
  });

  app.post("/api/community-posts/:id/like", async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      await storage.likePost(postId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to like post" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
