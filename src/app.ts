import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Application, Request, Response } from "express";

import { globalErrorHandler } from "./app/middleware/globalErrorHandler";
import { notFound } from "./app/middleware/notFound";
import { env } from "./app/config/env";
import { IndexRoutes } from "./app/routes";

const app: Application = express();

// Allowed origins
const allowedOrigins = [
  env.FRONTEND_URL,     
  env.ACCOUNTS_URL,     
].filter(Boolean); // Remove undefined values

// Dynamic CORS options
const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    // Allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) {
      return callback(null, true);
    }
    
    // Check if origin is allowed
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      console.log(`Allowed origins: ${allowedOrigins.join(', ')}`);
      callback(new Error(`CORS policy: Origin ${origin} not allowed`));
    }
  },
  credentials: true, // Important: Allow cookies to be sent
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Content-Type", 
    "Authorization", 
    "X-Requested-With",
    "Accept",
    "Origin",
    "Access-Control-Allow-Origin",
    "Access-Control-Allow-Credentials"
  ],
  exposedHeaders: ["Set-Cookie", "Date", "ETag"],
  maxAge: 86400, // 24 hours cache for preflight requests
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Apply CORS middleware
app.use(cors(corsOptions));


// Other middlewares
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/v1", IndexRoutes);

// Basic entry route
app.get('/', (req: Request, res: Response) => {
    res.status(200).json({
        message: "aviro auth-server is running!",
        allowedOrigins: allowedOrigins
    });
});
// Error handlers
app.use(globalErrorHandler);
app.use(notFound);

export default app;