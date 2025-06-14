import express from 'express';
import { registerRoutes } from './routes';
import connectDB from './db';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// Log API request duration
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.url} - ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Connect to MongoDB and start server
(async () => {
  try {
    await connectDB();
    console.log('Database connected, registering routes...');
    
    // Register API routes BEFORE static file serving
    const server = await registerRoutes(app);
    
    // Serve static files in production
    if (process.env.NODE_ENV === 'production') {
      app.use(express.static(path.join(__dirname, '../dist')));
      app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../dist/index.html'));
      });
    } else {
      // In development, serve the Vite dev server
      app.get('*', (req, res) => {
        res.redirect('http://localhost:5173' + req.url);
      });
    }

    // Error handling middleware
    app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
      console.error('Server error:', err.stack);
      res.status(500).json({ message: 'Something went wrong!' });
    });

    const port = process.env.PORT || 5000;
    server.listen(port, () => {
      console.log(`Server running on port ${port}`);
      if (process.env.NODE_ENV === 'development') {
        console.log('Development mode: Client is served by Vite at http://localhost:5173');
      }
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
})();