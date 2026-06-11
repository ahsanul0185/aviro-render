import { z } from "zod";

const getUserByIdOrUsername = z.object({
    identifier: z.string().min(1, "Identifier is required"),
});

export const userValidation = {
    getUserByIdOrUsername,
};
