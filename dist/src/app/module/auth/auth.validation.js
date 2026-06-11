"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authValidation = void 0;
const zod_1 = require("zod");
const signUp = zod_1.z.object({
    username: zod_1.z.string().min(3, "Username must be at least 3 characters"),
    firstName: zod_1.z.string().min(1, "First name is required"),
    lastName: zod_1.z.string().min(1, "Last name is required"),
    email: zod_1.z.string().email("Invalid email address"),
    password: zod_1.z.string().min(6, "Password must be at least 6 characters"),
    phone: zod_1.z.string().optional().nullable().optional(),
    profilePicture: zod_1.z.string().optional().nullable().optional(),
    verificationToken: zod_1.z.string().min(1, "Verification token is required"),
});
const login = zod_1.z.object({
    username: zod_1.z.string().min(3, "Username must be at least 3 characters"),
    password: zod_1.z.string().min(1, "Password is required"),
});
const changePassword = zod_1.z.object({
    oldPassword: zod_1.z.string().min(1, "Old password is required"),
    newPassword: zod_1.z.string().min(6, "New password must be at least 6 characters"),
});
const emailValidation = zod_1.z.object({
    email: zod_1.z.string().email("Invalid email address"),
});
const forgotPassword = zod_1.z.object({
    username: zod_1.z.string().min(3, "Username must be at least 3 characters"),
});
const resetPassword = zod_1.z.object({
    resetToken: zod_1.z.string().min(1, "Reset token is required"),
    newPassword: zod_1.z.string().min(6, "New password must be at least 6 characters"),
});
const verifyEmail = zod_1.z.object({
    token: zod_1.z.string().min(1, "Verification token is required"),
});
const updateProfile = zod_1.z.object({
    firstName: zod_1.z.string().min(1, "First name is required").optional(),
    lastName: zod_1.z.string().min(1, "Last name is required").optional(),
    profilePicture: zod_1.z.string().optional(),
    phone: zod_1.z.string().optional(),
});
const revokeSession = zod_1.z.object({
    sessionId: zod_1.z.string().min(1, "Session ID is required"),
});
exports.authValidation = {
    signUp,
    login,
    changePassword,
    emailValidation,
    forgotPassword,
    resetPassword,
    verifyEmail,
    updateProfile,
    revokeSession,
};
