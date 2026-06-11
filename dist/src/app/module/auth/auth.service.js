"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = void 0;
const crypto_1 = __importDefault(require("crypto"));
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const prisma_1 = require("../../lib/prisma");
const bcrypt_1 = require("../../utils/bcrypt");
const jwt_1 = require("../../utils/jwt");
const token_1 = require("../../utils/token");
const env_1 = require("../../config/env");
const email_1 = require("../../utils/email");
const enums_1 = require("../../../generated/prisma/enums");
const verifyEmail = async (token) => {
    const hashedToken = crypto_1.default.createHash("sha256").update(token).digest("hex");
    const verification = await prisma_1.prisma.verification.findUnique({
        where: {
            value: hashedToken,
        }
    });
    if (!verification) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Invalid or expired verification token");
    }
    if (verification.expiresAt < new Date()) {
        await prisma_1.prisma.verification.delete({
            where: { id: verification.id }
        });
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Verification token has expired");
    }
    // Extract email from identifier (format: "email-verification:<email>")
    const email = verification.identifier.split(":")[1];
    // Mark email as verified
    await prisma_1.prisma.user.updateMany({
        where: { email },
        data: { emailVerified: true }
    });
    return {
        message: "Email verified successfully",
        email,
    };
};
const sendVerificationEmail = async (payload) => {
    const { email } = payload;
    const user = await prisma_1.prisma.user.findFirst({
        where: { email }
    });
    // Generate a secure random token
    const rawToken = crypto_1.default.randomBytes(32).toString("hex");
    // Hash the token before storing
    const hashedToken = crypto_1.default.createHash("sha256").update(rawToken).digest("hex");
    // Token expires in 1 hour
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    // Build verification URL with raw token
    const verificationUrl = `${env_1.env.FRONTEND_URL}/auth/sign-up?email=${email}&token=${rawToken}`;
    // Send the email first
    await (0, email_1.sendEmail)({
        to: email,
        subject: "Verify your email address",
        templateName: "verification-email",
        templateData: {
            name: email.split("@")[0],
            verificationUrl,
        }
    });
    // Store the hashed token with identifier (no userId since user doesn't exist yet)
    await prisma_1.prisma.verification.create({
        data: {
            identifier: `email-verification:${email}`,
            value: hashedToken,
            expiresAt,
        }
    });
    return { message: "Verification email sent successfully" };
};
const signUpUser = async (payload) => {
    const { username, email, password, firstName, lastName, phone, profilePicture, verificationToken } = payload;
    // Verify the token
    const hashedToken = crypto_1.default.createHash("sha256").update(verificationToken).digest("hex");
    const verification = await prisma_1.prisma.verification.findUnique({
        where: {
            value: hashedToken,
        }
    });
    if (!verification) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Invalid or expired verification token");
    }
    if (verification.expiresAt < new Date()) {
        await prisma_1.prisma.verification.delete({
            where: { id: verification.id }
        });
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Verification token has expired");
    }
    // Verify the identifier matches the email
    const expectedIdentifier = `email-verification:${email}`;
    if (verification.identifier !== expectedIdentifier) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Verification token does not match the provided email");
    }
    const isUserExist = await prisma_1.prisma.user.findUnique({
        where: { username }
    });
    if (isUserExist) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Username already exists with this username");
    }
    const hashedPassword = await bcrypt_1.bcryptUtils.hash(password);
    const result = await prisma_1.prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
            data: {
                username,
                firstName,
                lastName,
                email,
                password: hashedPassword,
                phone: phone ?? null,
                profilePicture: profilePicture ?? null,
            }
        });
        // Delete the verification record after successful signup
        await tx.verification.delete({
            where: { id: verification.id }
        });
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password: _, ...userWithoutPassword } = user;
        return { user: userWithoutPassword };
    });
    // Auto sign-in: generate tokens for the newly created user
    const jwtPayload = {
        userId: result.user.id,
        username: result.user.username,
        firstName: result.user.firstName,
        lastName: result.user.lastName,
        email: result.user.email,
        status: result.user.status,
        needPasswordChange: result.user.needPasswordChange,
        emailVerified: result.user.emailVerified,
    };
    const accessToken = token_1.tokenUtils.getAccessToken(jwtPayload);
    const refreshToken = token_1.tokenUtils.getRefreshToken(jwtPayload);
    const refreshTokenHash = token_1.tokenUtils.hashToken(refreshToken);
    // Create session
    await prisma_1.prisma.session.create({
        data: {
            userId: result.user.id,
            refreshToken: refreshTokenHash,
            expiresAt: token_1.tokenUtils.getExpiresAtFromDuration(env_1.env.REFRESH_TOKEN_EXPIRES_IN),
        }
    });
    return {
        user: result.user,
        accessToken,
        refreshToken,
    };
};
const loginUser = async (payload, meta) => {
    const { username, password } = payload;
    const user = await prisma_1.prisma.user.findUnique({
        where: { username }
    });
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "User not found");
    }
    if (user.isDeleted || user.status === enums_1.UserStatus.INACTIVE || user.status === enums_1.UserStatus.DELETED) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, "User account is inactive or deleted");
    }
    const isPasswordMatched = await bcrypt_1.bcryptUtils.compare(password, user.password);
    if (!isPasswordMatched) {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, "Invalid password");
    }
    const jwtPayload = {
        userId: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        status: user.status,
        needPasswordChange: user.needPasswordChange,
        emailVerified: user.emailVerified,
    };
    const accessToken = token_1.tokenUtils.getAccessToken(jwtPayload);
    const refreshToken = token_1.tokenUtils.getRefreshToken(jwtPayload);
    const refreshTokenHash = token_1.tokenUtils.hashToken(refreshToken);
    // Create session
    await prisma_1.prisma.session.create({
        data: {
            userId: user.id,
            refreshToken: refreshTokenHash,
            ipAddress: meta?.ipAddress ?? null,
            userAgent: meta?.userAgent ?? null,
            expiresAt: token_1.tokenUtils.getExpiresAtFromDuration(env_1.env.REFRESH_TOKEN_EXPIRES_IN),
        }
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user;
    return {
        user: userWithoutPassword,
        accessToken,
        refreshToken,
    };
};
const getNewToken = async (refreshToken) => {
    const verifiedRefreshToken = jwt_1.jwtUtils.verifyToken(refreshToken, env_1.env.REFRESH_TOKEN_SECRET);
    if (!verifiedRefreshToken.success && verifiedRefreshToken.error) {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, "Invalid refresh token");
    }
    const { userId } = verifiedRefreshToken.data;
    const refreshTokenHash = token_1.tokenUtils.hashToken(refreshToken);
    // Look up the session
    const session = await prisma_1.prisma.session.findUnique({
        where: { refreshToken: refreshTokenHash }
    });
    // Reuse detection: token is valid JWT but not found in DB → likely stolen and already rotated
    if (!session) {
        // Try to find any session for this user to revoke all
        await prisma_1.prisma.session.updateMany({
            where: { userId, revokedAt: null },
            data: { revokedAt: new Date() }
        });
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, "Session invalidated. Please log in again.");
    }
    // Check if session is revoked or expired
    if (session.revokedAt) {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, "Session has been revoked. Please log in again.");
    }
    if (session.expiresAt < new Date()) {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, "Session has expired. Please log in again.");
    }
    const user = await prisma_1.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.isDeleted || user.status === enums_1.UserStatus.INACTIVE || user.status === enums_1.UserStatus.DELETED) {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, "User account is inactive or deleted");
    }
    const jwtPayload = {
        userId: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        status: user.status,
        needPasswordChange: user.needPasswordChange,
        emailVerified: user.emailVerified,
    };
    const newAccessToken = token_1.tokenUtils.getAccessToken(jwtPayload);
    const newRefreshToken = token_1.tokenUtils.getRefreshToken(jwtPayload);
    const newRefreshTokenHash = token_1.tokenUtils.hashToken(newRefreshToken);
    // Token rotation: delete old session, create new one
    await prisma_1.prisma.$transaction(async (tx) => {
        await tx.session.delete({
            where: { id: session.id }
        });
        await tx.session.create({
            data: {
                userId: user.id,
                refreshToken: newRefreshTokenHash,
                ipAddress: session.ipAddress,
                userAgent: session.userAgent,
                expiresAt: token_1.tokenUtils.getExpiresAtFromDuration(env_1.env.REFRESH_TOKEN_EXPIRES_IN),
                lastUsedAt: new Date(),
            }
        });
    });
    return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
    };
};
const getMe = async (userId) => {
    const user = await prisma_1.prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            status: true,
            emailVerified: true,
            needPasswordChange: true,
            profilePicture: true,
            phone: true,
            createdAt: true,
            updatedAt: true,
        }
    });
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "User not found");
    }
    return user;
};
const changePassword = async (userId, payload) => {
    const { oldPassword, newPassword } = payload;
    const user = await prisma_1.prisma.user.findUnique({
        where: { id: userId }
    });
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "User not found");
    }
    const isPasswordMatched = await bcrypt_1.bcryptUtils.compare(oldPassword, user.password);
    if (!isPasswordMatched) {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, "Old password is incorrect");
    }
    const hashedPassword = await bcrypt_1.bcryptUtils.hash(newPassword);
    await prisma_1.prisma.$transaction(async (tx) => {
        await tx.user.update({
            where: { id: userId },
            data: {
                password: hashedPassword,
                needPasswordChange: false,
            }
        });
        // Revoke all sessions for the user
        await tx.session.updateMany({
            where: { userId, revokedAt: null },
            data: { revokedAt: new Date() }
        });
    });
    return { message: "Password changed successfully" };
};
const forgotPassword = async (payload) => {
    const { username } = payload;
    const user = await prisma_1.prisma.user.findUnique({
        where: { username }
    });
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "User not found with this username");
    }
    if (user.isDeleted || user.status === "INACTIVE" || user.status === "DELETED") {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, "User account is inactive or deleted");
    }
    // Delete any existing password-reset tokens for this user
    await prisma_1.prisma.verification.deleteMany({
        where: { identifier: `password-reset:${user.id}` }
    });
    // Generate a secure random token
    const rawToken = crypto_1.default.randomBytes(32).toString("hex");
    const hashedToken = crypto_1.default.createHash("sha256").update(rawToken).digest("hex");
    // Token expires in 1 hour
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    await prisma_1.prisma.verification.create({
        data: {
            identifier: `password-reset:${user.id}`,
            value: hashedToken,
            expiresAt,
        }
    });
    // Build reset URL with raw token
    const resetUrl = `${env_1.env.FRONTEND_URL}/auth/reset-password?token=${rawToken}`;
    await (0, email_1.sendEmail)({
        to: user.email,
        subject: "Reset your password",
        templateName: "forgot-password",
        templateData: {
            name: user.firstName || user.email.split("@")[0],
            resetUrl,
        }
    });
    return { message: "Password reset email sent successfully" };
};
const resetPassword = async (payload) => {
    const { resetToken, newPassword } = payload;
    const hashedToken = crypto_1.default.createHash("sha256").update(resetToken).digest("hex");
    const verification = await prisma_1.prisma.verification.findUnique({
        where: { value: hashedToken }
    });
    if (!verification) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Invalid or expired reset token");
    }
    if (!verification.identifier.startsWith("password-reset:")) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Invalid reset token");
    }
    if (verification.expiresAt < new Date()) {
        await prisma_1.prisma.verification.delete({
            where: { id: verification.id }
        });
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Reset token has expired");
    }
    // Extract userId from identifier (format: "password-reset:<userId>")
    const userId = verification.identifier.split(":")[1];
    const hashedPassword = await bcrypt_1.bcryptUtils.hash(newPassword);
    await prisma_1.prisma.$transaction(async (tx) => {
        await tx.user.update({
            where: { id: userId },
            data: {
                password: hashedPassword,
                needPasswordChange: false,
            }
        });
        // Revoke all sessions for the user after password reset
        await tx.session.updateMany({
            where: { userId, revokedAt: null },
            data: { revokedAt: new Date() }
        });
        // Delete the verification record to prevent reuse
        await tx.verification.delete({
            where: { id: verification.id }
        });
    });
    return { message: "Password reset successfully" };
};
const logoutUser = async (refreshToken) => {
    const refreshTokenHash = token_1.tokenUtils.hashToken(refreshToken);
    await prisma_1.prisma.session.updateMany({
        where: { refreshToken: refreshTokenHash, revokedAt: null },
        data: { revokedAt: new Date() }
    });
    return { message: "Logged out successfully" };
};
const updateProfile = async (userId, payload) => {
    const user = await prisma_1.prisma.user.findUnique({
        where: { id: userId }
    });
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "User not found");
    }
    if (user.isDeleted || user.status === "INACTIVE" || user.status === "DELETED") {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, "User account is inactive or deleted");
    }
    const updatedUser = await prisma_1.prisma.user.update({
        where: { id: userId },
        data: {
            ...(payload.firstName !== undefined && { firstName: payload.firstName }),
            ...(payload.lastName !== undefined && { lastName: payload.lastName }),
            ...(payload.profilePicture !== undefined && { profilePicture: payload.profilePicture }),
            ...(payload.phone !== undefined && { phone: payload.phone }),
        }
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
};
const getMySessions = async (userId) => {
    const sessions = await prisma_1.prisma.session.findMany({
        where: {
            userId,
            revokedAt: null,
            expiresAt: { gt: new Date() },
        },
        select: {
            id: true,
            ipAddress: true,
            userAgent: true,
            createdAt: true,
            expiresAt: true,
            lastUsedAt: true,
        },
        orderBy: { createdAt: 'desc' },
    });
    return sessions;
};
const revokeSession = async (userId, payload) => {
    const { sessionId } = payload;
    const session = await prisma_1.prisma.session.findFirst({
        where: { id: sessionId, userId }
    });
    if (!session) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Session not found");
    }
    if (session.revokedAt) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Session is already revoked");
    }
    await prisma_1.prisma.session.update({
        where: { id: sessionId },
        data: { revokedAt: new Date() }
    });
    return { message: "Session revoked successfully" };
};
exports.authService = {
    signUpUser,
    loginUser,
    getMe,
    getNewToken,
    changePassword,
    forgotPassword,
    resetPassword,
    logoutUser,
    sendVerificationEmail,
    verifyEmail,
    updateProfile,
    getMySessions,
    revokeSession,
};
