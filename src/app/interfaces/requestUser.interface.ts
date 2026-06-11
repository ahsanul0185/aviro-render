export interface IRequestUser {
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
    emailVerified: boolean;
    needsPasswordChange: boolean;
    phone: string | null;
}
