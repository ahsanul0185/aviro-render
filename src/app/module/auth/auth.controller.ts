import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { authService } from "./auth.service";

import AppError from "../../errorHelpers/AppError";
import { tokenUtils } from "../../utils/token";



const sendVerificationEmail = catchAsync(
    async (req: Request, res: Response) => {
        const payload = req.body;
        const result = await authService.sendVerificationEmail(payload);

        sendResponse(res, {
            httpStatusCode: status.CREATED,
            success: true,
            message: "Verification email sent successfully",
            data: result
        })
    }
)

const verifyEmail = catchAsync(
    async (req: Request, res: Response) => {
        const { token } = req.body;

        if (!token || typeof token !== "string") {
            throw new AppError(status.BAD_REQUEST, "Verification token is required");
        }

        const result = await authService.verifyEmail(token);

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Email verified successfully",
            data: result
        })
    }
)

const signUpUser = catchAsync(
    async (req: Request, res: Response) => {
        const payload = req.body;
        const result = await authService.signUpUser(payload);

        const { accessToken, refreshToken, user } = result;

        tokenUtils.setAccessTokenCookie(res, accessToken);
        tokenUtils.setRefreshTokenCookie(res, refreshToken);

        sendResponse(res, {
            httpStatusCode: status.CREATED,
            success: true,
            message: "User registered and logged in successfully",
            data: {
                user,
                accessToken,
                refreshToken
            }
        })
    }
)

const loginUser = catchAsync(
    async (req: Request, res: Response) => {
        const payload = req.body;
        const meta = {
            ipAddress: req.ip,
            userAgent: req.headers["user-agent"],
            deviceInfo: req.headers["user-agent"],
        };

        const result = await authService.loginUser(payload, meta);

        const { accessToken, refreshToken, user } = result;

        tokenUtils.setAccessTokenCookie(res, accessToken);
        tokenUtils.setRefreshTokenCookie(res, refreshToken);

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "User logged in successfully",
            data: {
                user,
                accessToken,
                refreshToken
            },
        })
    }
)

const getMe = catchAsync(
    async (req: Request, res: Response) => {
        const userId = req.user?.userId;

        if (!userId) {
            throw new AppError(status.UNAUTHORIZED, "Unauthorized");
        }

        const result = await authService.getMe(userId);

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "User profile fetched successfully",
            data: result,
        })
    }
)


const getNewToken = catchAsync(
    async (req: Request, res: Response) => {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            throw new AppError(status.UNAUTHORIZED, "Refresh token is missing");
        }

        const result = await authService.getNewToken(refreshToken);

        const { accessToken, refreshToken: newRefreshToken } = result;

        tokenUtils.setAccessTokenCookie(res, accessToken);
        tokenUtils.setRefreshTokenCookie(res, newRefreshToken);

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "New tokens generated successfully",
            data: {
                accessToken,
                refreshToken: newRefreshToken
            },
        });
    }
)


const logoutUser = catchAsync(
    async (req: Request, res: Response) => {
        const refreshToken = req.cookies.refreshToken;
        if (refreshToken) {
            await authService.logoutUser(refreshToken);
        }

        tokenUtils.clearAuthCookies(res);

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "User logged out successfully",
            data: {},
        });
    }
)

const changePassword = catchAsync(
    async (req: Request, res: Response) => {
        const userId = req.user?.userId;

        if (!userId) {
            throw new AppError(status.UNAUTHORIZED, "Unauthorized");
        }

        const result = await authService.changePassword(userId, req.body);

        // Clear auth cookies to force re-login with new password
        tokenUtils.clearAuthCookies(res);

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Password changed successfully. Please log in again.",
            data: result,
        });
    }
)

const forgotPassword = catchAsync(
    async (req: Request, res: Response) => {
        const result = await authService.forgotPassword(req.body);

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Password reset email sent successfully",
            data: result,
        });
    }
)

const resetPassword = catchAsync(
    async (req: Request, res: Response) => {
        const result = await authService.resetPassword(req.body);

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Password reset successfully",
            data: result,
        });
    }
)


const updateProfile = catchAsync(
    async (req: Request, res: Response) => {
        const userId = req.user?.userId;

        if (!userId) {
            throw new AppError(status.UNAUTHORIZED, "Unauthorized");
        }

        const result = await authService.updateProfile(userId, req.body);

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Profile updated successfully",
            data: result,
        });
    }
);

const getMySessions = catchAsync(
    async (req: Request, res: Response) => {
        const userId = req.user?.userId;

        if (!userId) {
            throw new AppError(status.UNAUTHORIZED, "Unauthorized");
        }

        const result = await authService.getMySessions(userId);

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Sessions fetched successfully",
            data: result,
        });
    }
);

const revokeSession = catchAsync(
    async (req: Request, res: Response) => {
        const userId = req.user?.userId;

        if (!userId) {
            throw new AppError(status.UNAUTHORIZED, "Unauthorized");
        }

        const result = await authService.revokeSession(userId, req.body);

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Session revoked successfully",
            data: result,
        });
    }
);

export const authController = {
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
