"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = require("../../shared/catchAsync");
const sendResponse_1 = require("../../shared/sendResponse");
const auth_service_1 = require("./auth.service");
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const token_1 = require("../../utils/token");
const sendVerificationEmail = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const payload = req.body;
    const result = await auth_service_1.authService.sendVerificationEmail(payload);
    (0, sendResponse_1.sendResponse)(res, {
        httpStatusCode: http_status_1.default.CREATED,
        success: true,
        message: "Verification email sent successfully",
        data: result
    });
});
const verifyEmail = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { token } = req.body;
    if (!token || typeof token !== "string") {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Verification token is required");
    }
    const result = await auth_service_1.authService.verifyEmail(token);
    (0, sendResponse_1.sendResponse)(res, {
        httpStatusCode: http_status_1.default.OK,
        success: true,
        message: "Email verified successfully",
        data: result
    });
});
const signUpUser = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const payload = req.body;
    const result = await auth_service_1.authService.signUpUser(payload);
    const { accessToken, refreshToken, user } = result;
    token_1.tokenUtils.setAccessTokenCookie(res, accessToken);
    token_1.tokenUtils.setRefreshTokenCookie(res, refreshToken);
    (0, sendResponse_1.sendResponse)(res, {
        httpStatusCode: http_status_1.default.CREATED,
        success: true,
        message: "User registered and logged in successfully",
        data: {
            user,
            accessToken,
            refreshToken
        }
    });
});
const loginUser = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const payload = req.body;
    const meta = {
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
        deviceInfo: req.headers["user-agent"],
    };
    const result = await auth_service_1.authService.loginUser(payload, meta);
    const { accessToken, refreshToken, user } = result;
    token_1.tokenUtils.setAccessTokenCookie(res, accessToken);
    token_1.tokenUtils.setRefreshTokenCookie(res, refreshToken);
    (0, sendResponse_1.sendResponse)(res, {
        httpStatusCode: http_status_1.default.OK,
        success: true,
        message: "User logged in successfully",
        data: {
            user,
            accessToken,
            refreshToken
        },
    });
});
const getMe = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = req.user?.userId;
    if (!userId) {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, "Unauthorized");
    }
    const result = await auth_service_1.authService.getMe(userId);
    (0, sendResponse_1.sendResponse)(res, {
        httpStatusCode: http_status_1.default.OK,
        success: true,
        message: "User profile fetched successfully",
        data: result,
    });
});
const getNewToken = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, "Refresh token is missing");
    }
    const result = await auth_service_1.authService.getNewToken(refreshToken);
    const { accessToken, refreshToken: newRefreshToken } = result;
    token_1.tokenUtils.setAccessTokenCookie(res, accessToken);
    token_1.tokenUtils.setRefreshTokenCookie(res, newRefreshToken);
    (0, sendResponse_1.sendResponse)(res, {
        httpStatusCode: http_status_1.default.OK,
        success: true,
        message: "New tokens generated successfully",
        data: {
            accessToken,
            refreshToken: newRefreshToken
        },
    });
});
const logoutUser = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
        await auth_service_1.authService.logoutUser(refreshToken);
    }
    token_1.tokenUtils.clearAuthCookies(res);
    (0, sendResponse_1.sendResponse)(res, {
        httpStatusCode: http_status_1.default.OK,
        success: true,
        message: "User logged out successfully",
        data: {},
    });
});
const changePassword = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = req.user?.userId;
    if (!userId) {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, "Unauthorized");
    }
    const result = await auth_service_1.authService.changePassword(userId, req.body);
    // Clear auth cookies to force re-login with new password
    token_1.tokenUtils.clearAuthCookies(res);
    (0, sendResponse_1.sendResponse)(res, {
        httpStatusCode: http_status_1.default.OK,
        success: true,
        message: "Password changed successfully. Please log in again.",
        data: result,
    });
});
const forgotPassword = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const result = await auth_service_1.authService.forgotPassword(req.body);
    (0, sendResponse_1.sendResponse)(res, {
        httpStatusCode: http_status_1.default.OK,
        success: true,
        message: "Password reset email sent successfully",
        data: result,
    });
});
const resetPassword = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const result = await auth_service_1.authService.resetPassword(req.body);
    (0, sendResponse_1.sendResponse)(res, {
        httpStatusCode: http_status_1.default.OK,
        success: true,
        message: "Password reset successfully",
        data: result,
    });
});
const updateProfile = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = req.user?.userId;
    if (!userId) {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, "Unauthorized");
    }
    const result = await auth_service_1.authService.updateProfile(userId, req.body);
    (0, sendResponse_1.sendResponse)(res, {
        httpStatusCode: http_status_1.default.OK,
        success: true,
        message: "Profile updated successfully",
        data: result,
    });
});
const getMySessions = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = req.user?.userId;
    if (!userId) {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, "Unauthorized");
    }
    const result = await auth_service_1.authService.getMySessions(userId);
    (0, sendResponse_1.sendResponse)(res, {
        httpStatusCode: http_status_1.default.OK,
        success: true,
        message: "Sessions fetched successfully",
        data: result,
    });
});
const revokeSession = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = req.user?.userId;
    if (!userId) {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, "Unauthorized");
    }
    const result = await auth_service_1.authService.revokeSession(userId, req.body);
    (0, sendResponse_1.sendResponse)(res, {
        httpStatusCode: http_status_1.default.OK,
        success: true,
        message: "Session revoked successfully",
        data: result,
    });
});
exports.authController = {
    signUpUser,
    loginUser,
    getMe,
    getNewToken,
    logoutUser,
    changePassword,
    forgotPassword,
    resetPassword,
    sendVerificationEmail,
    verifyEmail,
    updateProfile,
    getMySessions,
    revokeSession,
};
