"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAuth = void 0;
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../errorHelpers/AppError"));
const cookie_1 = require("../utils/cookie");
const jwt_1 = require("../utils/jwt");
const env_1 = require("../config/env");
const enums_1 = require("../../generated/prisma/enums");
const checkAuth = () => async (req, res, next) => {
    try {
        const accessToken = cookie_1.CookieUtils.getCookie(req, 'accessToken') || req.headers.authorization?.split(' ')[1];
        if (!accessToken) {
            throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, 'Unauthorized access! No access token provided.');
        }
        const verifiedToken = jwt_1.jwtUtils.verifyToken(accessToken, env_1.env.ACCESS_TOKEN_SECRET);
        if (!verifiedToken.success || !verifiedToken.data) {
            throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, 'Unauthorized access! Invalid or expired access token.');
        }
        const userData = verifiedToken.data;
        if (userData.status === enums_1.UserStatus.INACTIVE || userData.status === enums_1.UserStatus.DELETED) {
            throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, 'Unauthorized access! User account is not active.');
        }
        req.user = {
            userId: userData.userId,
            email: userData.email,
            firstName: userData.firstName,
            lastName: userData.lastName,
            emailVerified: userData.emailVerified,
            needsPasswordChange: userData.needsPasswordChange,
            phone: userData.phone ?? null,
        };
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.checkAuth = checkAuth;
