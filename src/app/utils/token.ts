import { Response } from "express";
import { JwtPayload, SignOptions } from "jsonwebtoken";
import crypto from "crypto";
import { env } from "../config/env";
import { CookieUtils } from "./cookie";
import { jwtUtils } from "./jwt";

/**
 * Converts a time string like "15m", "1h", "7d" to milliseconds.
 * Supports: ms (milliseconds), s (seconds), m (minutes), h (hours), d (days)
 */
const ms = (timeStr: string): number => {
    const match = timeStr.match(/^([0-9]+)([msdh])$/);
    if (!match) {
        throw new Error(`Invalid time format: "${timeStr}". Expected format like "15m", "1h", "7d".`);
    }

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
        case 'm': return value * 60 * 1000;
        case 'h': return value * 60 * 60 * 1000;
        case 'd': return value * 24 * 60 * 60 * 1000;
        case 's': return value * 1000;
        default: return value;
    }
};


//Creating access token
const getAccessToken = (payload: JwtPayload) => {
    const accessToken = jwtUtils.createToken(
        payload,
        env.ACCESS_TOKEN_SECRET,
        { expiresIn: env.ACCESS_TOKEN_EXPIRES_IN } as SignOptions
    );

    return accessToken;
}

const getRefreshToken = (payload: JwtPayload) => {
    const refreshToken = jwtUtils.createToken(
        payload,
        env.REFRESH_TOKEN_SECRET,
        { expiresIn: env.REFRESH_TOKEN_EXPIRES_IN } as SignOptions
    );
    return refreshToken;
}


const setAccessTokenCookie = (res: Response, token: string) => {
    CookieUtils.setCookie(res, 'accessToken', token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: '/',
        domain: ".aviro24.shop",
        maxAge: ms(env.ACCESS_TOKEN_EXPIRES_IN),
    });
}

const setRefreshTokenCookie = (res: Response, token: string) => {
    CookieUtils.setCookie(res, 'refreshToken', token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: '/',
        domain: ".aviro24.shop",
        maxAge: ms(env.REFRESH_TOKEN_EXPIRES_IN),
    });
}

const clearAuthCookies = (res: Response) => {
    CookieUtils.clearCookie(res, 'accessToken', {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: '/',
    });
    CookieUtils.clearCookie(res, 'refreshToken', {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: '/',
    });
}

const hashToken = (token: string): string => {
    return crypto.createHash("sha256").update(token).digest("hex");
}

const getExpiresAtFromDuration = (duration: string): Date => {
    return new Date(Date.now() + ms(duration));
}


export const tokenUtils = {
    getAccessToken,
    getRefreshToken,
    setAccessTokenCookie,
    setRefreshTokenCookie,
    clearAuthCookies,
    hashToken,
    getExpiresAtFromDuration,
};
