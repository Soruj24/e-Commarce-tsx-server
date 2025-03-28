import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import dotenv from 'dotenv';
import userRouter from './routes/userRoutes';

// Configure environment variables
dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

  app.use('/api/v1/users', userRouter);

// Route Error Handler
app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
  const error = new Error('Route not found');
  res.status(404).json({
    success: false,
    message: error.message
  });
});

// Error handling middleware (for catching internal errors)
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

export default app;
