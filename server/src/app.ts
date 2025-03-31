import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import createHttpError, { isHttpError } from 'http-errors';
import compression from 'compression';
import mongoSanitize from 'express-mongo-sanitize';
const xss = require('xss-clean')

// Routes
import userRouter from './routes/userRoutes';
import { errorResponse } from './controllers/responesController';

dotenv.config();

const app = express();

// Basic middleware
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(helmet());
app.use(compression());

// Security middleware
app.use(mongoSanitize());
app.use(xss());

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to API routes
app.use('/api/v1', limiter);

// API Routes
app.use('/api/v1/users', userRouter);

// Health check endpoint
app.get('/api/v1/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Static files
app.use('/uploads', express.static('uploads'));

// 404 Handler
app.use((req: Request, res: Response, next: NextFunction) => {
  next(createHttpError(404, `Endpoint not found: ${req.originalUrl}`));
});


// Global Error Handler
app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
  let statusCode = 500;
  let message = 'Internal Server Error';
  let errors: any = undefined;

  if (err instanceof Error) {
    message = err.message;
    if ((err as any).status) statusCode = (err as any).status;
    if ((err as any).errors) errors = (err as any).errors;
  }

  errorResponse(res, {
    statusCode,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err instanceof Error ? err.stack : undefined }),
  });
});

export default app;