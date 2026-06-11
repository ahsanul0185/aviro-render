export interface ICreateUserPayload {
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string | null;
    profilePicture?: string | null;
    verificationToken: string;
}

export interface ILoginUserPayload {
    username: string;
    password: string;
}

export interface ILoginMeta {
    ipAddress?: string;
    userAgent?: string;
    deviceInfo?: string;
}

export interface IChangePasswordPayload {
    oldPassword: string;
    newPassword: string;
}

export interface IForgotPasswordPayload {
    username: string;
}

export interface IResetPasswordPayload {
    resetToken: string;
    newPassword: string;
}

export interface IUpdateProfilePayload {
    firstName?: string;
    lastName?: string;
    profilePicture?: string;
    phone?: string;
}

export interface IRevokeSessionPayload {
    sessionId: string;
}
