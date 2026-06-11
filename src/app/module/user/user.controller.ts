import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { userService } from "./user.service";

const getUserByIdOrUsername = catchAsync(
    async (req: Request, res: Response) => {
        const identifier = req.params.identifier as string;
        const result = await userService.getUserByIdOrUsername(identifier);

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "User fetched successfully",
            data: result,
        });
    }
);

export const userController = {
    getUserByIdOrUsername,
};
