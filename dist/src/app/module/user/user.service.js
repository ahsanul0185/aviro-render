"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const prisma_1 = require("../../lib/prisma");
const getUserByIdOrUsername = async (identifier) => {
    const user = await prisma_1.prisma.user.findFirst({
        where: {
            OR: [
                { id: identifier },
                { username: identifier },
            ],
        },
    });
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "User not found");
    }
    if (user.isDeleted || user.status === "INACTIVE" || user.status === "DELETED") {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, "User account is inactive or deleted");
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
};
exports.userService = {
    getUserByIdOrUsername,
};
