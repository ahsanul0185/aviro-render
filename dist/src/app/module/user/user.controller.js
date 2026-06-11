"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = require("../../shared/catchAsync");
const sendResponse_1 = require("../../shared/sendResponse");
const user_service_1 = require("./user.service");
const getUserByIdOrUsername = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const identifier = req.params.identifier;
    const result = await user_service_1.userService.getUserByIdOrUsername(identifier);
    (0, sendResponse_1.sendResponse)(res, {
        httpStatusCode: http_status_1.default.OK,
        success: true,
        message: "User fetched successfully",
        data: result,
    });
});
exports.userController = {
    getUserByIdOrUsername,
};
