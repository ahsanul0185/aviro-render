"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tokenUtils = void 0;
const crypto_1 = __importDefault(require("crypto"));
const env_1 = require("../config/env");
const cookie_1 = require("./cookie");
const jwt_1 = require("./jwt");
/**
 * Converts a time string like "15m", "1h", "7d" to milliseconds.
 * Supports: ms (milliseconds), s (seconds), m (minutes), h (hours), d (days)
 */
const ms = (timeStr) => {
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
const getAccessToken = (payload) => {
    const accessToken = jwt_1.jwtUtils.createToken(payload, env_1.env.ACCESS_TOKEN_SECRET, { expiresIn: env_1.env.ACCESS_TOKEN_EXPIRES_IN });
    return accessToken;
};
const getRefreshToken = (payload) => {
    const refreshToken = jwt_1.jwtUtils.createToken(payload, env_1.env.REFRESH_TOKEN_SECRET, { expiresIn: env_1.env.REFRESH_TOKEN_EXPIRES_IN });
    return refreshToken;
};
const setAccessTokenCookie = (res, token) => {
    cookie_1.CookieUtils.setCookie(res, 'accessToken', token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: '/',
        domain: ".aviro24.shop",
        maxAge: ms(env_1.env.ACCESS_TOKEN_EXPIRES_IN),
    });
};
const setRefreshTokenCookie = (res, token) => {
    cookie_1.CookieUtils.setCookie(res, 'refreshToken', token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: '/',
        domain: ".aviro24.shop",
        maxAge: ms(env_1.env.REFRESH_TOKEN_EXPIRES_IN),
    });
};
const clearAuthCookies = (res) => {
    cookie_1.CookieUtils.clearCookie(res, 'accessToken', {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: '/',
    });
    cookie_1.CookieUtils.clearCookie(res, 'refreshToken', {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: '/',
    });
};
const hashToken = (token) => {
    return crypto_1.default.createHash("sha256").update(token).digest("hex");
};
const getExpiresAtFromDuration = (duration) => {
    return new Date(Date.now() + ms(duration));
};
exports.tokenUtils = {
    getAccessToken,
    getRefreshToken,
    setAccessTokenCookie,
    setRefreshTokenCookie,
    clearAuthCookies,
    hashToken,
    getExpiresAtFromDuration,
};
