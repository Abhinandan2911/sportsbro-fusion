import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import session from 'express-session';

// Load environment variables BEFORE importing modules that use them
dotenv.config();
console.log('Environment variables loaded');

// Now import passport after dotenv is configured
import passport from './config/passport';
import { googleAuthCallback } from './controllers/authController';

// Import routes
import authRoutes from './routes/authRoutes';
import productRoutes from './routes/productRoutes';
import teamRoutes from './routes/teamRoutes';
import adminRoutes from './routes/adminRoutes';

// Create Express app
const app: Express = express();
const port = process.env.PORT || 5001;

// Define the frontend URL for redirects
const frontendURL = process.env.NODE_ENV === 'production' 
  ? 'https://yourdomain.com' 
  : 'http://localhost:8081';

// Define allowed origins for CORS based on environment
const getAllowedOrigins = () => {
  // Production environments
  if (process.env.NODE_ENV === 'production') {
    return [
      process.env.FRONTEND_URL || 'https://sportsbro.com',
      'https://www.sportsbro.com',
      'https://app.sportsbro.com'
    ].filter(Boolean);
  }
  
  // Development environments
  return [
    'http://localhost:8080',  // Common Vite default
    'http://localhost:8081',  // Alternative Vite port
    'http://localhost:3000',  // Common React default
    'http://127.0.0.1:8080',
    'http://127.0.0.1:8081',
    'http://127.0.0.1:3000'
  ];
};

const allowedOrigins = getAllowedOrigins();

console.log('========== SERVER CONFIGURATION ==========');
console.log('Frontend URL for redirects:', frontendURL);
console.log('Backend running on port:', port);
console.log('Node Environment:', process.env.NODE_ENV || 'development');
console.log('Allowed origins:', allowedOrigins);
console.log('==========================================');

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      console.warn(`CORS blocked request from origin: ${origin}`);
      return callback(new Error(`CORS policy: Origin ${origin} not allowed`), false);
    }
    
    console.log(`CORS allowed request from origin: ${origin}`);
    return callback(null, true);
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add session middleware - REQUIRED for Passport Google strategy
app.use(
  // @ts-ignore - Ignoring TypeScript error with express-session
  session({
    secret: process.env.JWT_SECRET || 'sportsbro_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: { 
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    }
  })
);

// Initialize Passport (WITH session support)
app.use(passport.initialize());
app.use(passport.session());

// Add the Google auth route directly to the main app for the initial authentication step
app.get('/auth/google', (req, res, next) => {
  console.log('========== STARTING GOOGLE AUTH (ROOT) ==========');
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  console.log('Starting Google authentication flow from IP:', req.ip);
  console.log('==========================================');
  passport.authenticate('google', { scope: ['profile', 'email', 'openid'] })(req, res, next);
});

// Also add the API path version for compatibility with frontend
app.get('/api/auth/google', (req, res, next) => {
  console.log('========== STARTING GOOGLE AUTH (API PATH) ==========');
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  console.log('Starting Google authentication flow from IP:', req.ip);
  console.log('==========================================');
  passport.authenticate('google', { scope: ['profile', 'email', 'openid'] })(req, res, next);
});

// Add the simplified callback route directly to the main app
app.get('/callback', 
  (req, res, next) => {
    console.log('========== GOOGLE CALLBACK RECEIVED (ROOT) ==========');
    console.log('Callback query params:', JSON.stringify(req.query, null, 2));
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    console.log('==============================================');
    next();
  },
  passport.authenticate('google', { 
    session: false,
    failureRedirect: `${frontendURL}/login?error=true&message=Authentication+failed` 
  }), 
  googleAuthCallback
);

// Also add the callback route with the API path structure for compatibility
app.get('/api/auth/google/callback', 
  (req, res, next) => {
    console.log('========== GOOGLE CALLBACK RECEIVED (API PATH) ==========');
    console.log('Callback query params:', JSON.stringify(req.query, null, 2));
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    console.log('==============================================');
    next();
  },
  passport.authenticate('google', { 
    session: false,
    failureRedirect: `${frontendURL}/login?error=true&message=Authentication+failed` 
  }), 
  googleAuthCallback
);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI as string)
  .then(() => {
    console.log('Connected to MongoDB successfully');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    
    // More user-friendly error message if MongoDB isn't running
    if (error.name === 'MongoNetworkError') {
      console.error('\n------------------------------------------------');
      console.error('Failed to connect to MongoDB. Please make sure:');
      console.error('1. If using local MongoDB: MongoDB service is running');
      console.error('2. If using MongoDB Atlas: Check your connection string and network access');
      console.error('3. Your MONGO_URI in .env file is correct');
      console.error('------------------------------------------------\n');
    }
  });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/admin', adminRoutes);

// Add a health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running normally',
    timestamp: new Date().toISOString()
  });
});

// Default route
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Welcome to the SportsBro API' });
});

// Handle 404 routes
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 