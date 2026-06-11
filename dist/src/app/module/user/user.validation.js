"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userValidation = void 0;
const zod_1 = require("zod");
const getUserByIdOrUsername = zod_1.z.object({
    identifier: zod_1.z.string().min(1, "Identifier is required"),
});
exports.userValidation = {
    getUserByIdOrUsername,
};
