import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";

const getUserByIdOrUsername = async (identifier: string) => {
    const user = await prisma.user.findFirst({
        where: {
            OR: [
                { id: identifier },
                { username: identifier },
            ],
        },
    });

    if (!user) {
        throw new AppError(status.NOT_FOUND, "User not found");
    }

    if (user.isDeleted || user.status === "INACTIVE" || user.status === "DELETED") {
        throw new AppError(status.FORBIDDEN, "User account is inactive or deleted");
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user;

    return userWithoutPassword;
};

export const userService = {
    getUserByIdOrUsername,
};
