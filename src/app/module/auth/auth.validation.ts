import { z } from "zod";

const signUp = z.object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    phone: z.string().optional().nullable().optional(),
    profilePicture: z.string().optional().nullable().optional(),
    verificationToken: z.string().min(1, "Verification token is required"),
});

const login = z.object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    password: z.string().min(1, "Password is required"),
});

const changePassword = z.object({
    oldPassword: z.string().min(1, "Old password is required"),
    newPassword: z.string().min(6, "New password must be at least 6 characters"),
});

const emailValidation = z.object({
    email: z.string().email("Invalid email address"),
});

const forgotPassword = z.object({
    username: z.string().min(3, "Username must be at least 3 characters"),
});

const resetPassword = z.object({
    resetToken: z.string().min(1, "Reset token is required"),
    newPassword: z.string().min(6, "New password must be at least 6 characters"),
});

const verifyEmail = z.object({
    token: z.string().min(1, "Verification token is required"),
});

const updateProfile = z.object({
    firstName: z.string().min(1, "First name is required").optional(),
    lastName: z.string().min(1, "Last name is required").optional(),
    profilePicture: z.string().optional(),
    phone: z.string().optional(),
});

const revokeSession = z.object({
    sessionId: z.string().min(1, "Session ID is required"),
});

export const authValidation = {
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
