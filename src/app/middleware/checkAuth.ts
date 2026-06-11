import { NextFunction, Request, Response } from "express";
import status from "http-status";
import AppError from "../errorHelpers/AppError";
import { CookieUtils } from "../utils/cookie";
import { jwtUtils } from "../utils/jwt";
import { env } from "../config/env";
import { IRequestUser } from "../interfaces/requestUser.interface";
import { UserStatus } from "../../generated/prisma/enums";

export const checkAuth = () => async (req: Request, res: Response, next: NextFunction) => {
    try {
        const accessToken = CookieUtils.getCookie(req, 'accessToken') || req.headers.authorization?.split(' ')[1];

        if (!accessToken) {
            throw new AppError(status.UNAUTHORIZED, 'Unauthorized access! No access token provided.');
        }

        const verifiedToken = jwtUtils.verifyToken(accessToken, env.ACCESS_TOKEN_SECRET);

        if (!verifiedToken.success || !verifiedToken.data) {
            throw new AppError(status.UNAUTHORIZED, 'Unauthorized access! Invalid or expired access token.');
        }

        const userData = verifiedToken.data as IRequestUser & { status?: string };

        if (userData.status === UserStatus.INACTIVE || userData.status === UserStatus.DELETED) {
            throw new AppError(status.UNAUTHORIZED, 'Unauthorized access! User account is not active.');
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
    } catch (error: any) {
        next(error);
    }
};
