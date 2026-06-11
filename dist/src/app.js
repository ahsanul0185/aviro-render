"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const globalErrorHandler_1 = require("./app/middleware/globalErrorHandler");
const notFound_1 = require("./app/middleware/notFound");
const env_1 = require("./app/config/env");
const routes_1 = require("./app/routes");
const app = (0, express_1.default)();
// Allowed origins
const allowedOrigins = [
    env_1.env.FRONTEND_URL,
    env_1.env.ACCOUNTS_URL,
].filter(Boolean); // Remove undefined values
// Dynamic CORS options
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, curl, postman)
        if (!origin) {
            return callback(null, true);
        }
        // Check if origin is allowed
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
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
app.use((0, cors_1.default)(corsOptions));
// Other middlewares
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Routes
app.use("/api/v1", routes_1.IndexRoutes);
// Basic entry route
app.get('/', (req, res) => {
    res.status(200).json({
        message: "aviro auth-server is running!",
        allowedOrigins: allowedOrigins
    });
});
// Error handlers
app.use(globalErrorHandler_1.globalErrorHandler);
app.use(notFound_1.notFound);
exports.default = app;
