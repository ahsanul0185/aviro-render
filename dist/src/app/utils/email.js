"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const ejs_1 = __importDefault(require("ejs"));
const http_status_1 = __importDefault(require("http-status"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const path_1 = __importDefault(require("path"));
const env_1 = require("../config/env");
const AppError_1 = __importDefault(require("../errorHelpers/AppError"));
const transporter = nodemailer_1.default.createTransport({
    host: env_1.env.EMAIL_SENDER_SMTP_HOST,
    port: Number(env_1.env.EMAIL_SENDER_SMTP_PORT),
    secure: Number(env_1.env.EMAIL_SENDER_SMTP_PORT) === 465,
    auth: {
        user: env_1.env.EMAIL_SENDER_SMTP_USER,
        pass: env_1.env.EMAIL_SENDER_SMTP_PASS
    },
    tls: {
        rejectUnauthorized: false
    }
});
const sendEmail = async ({ subject, templateData, templateName, to, attachments }) => {
    try {
        const templatePath = path_1.default.resolve(process.cwd(), `src/app/templates/${templateName}.ejs`);
        const html = await ejs_1.default.renderFile(templatePath, templateData);
        await transporter.sendMail({
            from: env_1.env.EMAIL_SENDER_SMTP_USER,
            to: to,
            subject: subject,
            html: html,
            attachments: attachments?.map((attachment) => ({
                filename: attachment.filename,
                content: attachment.content,
                contentType: attachment.contentType,
            }))
        });
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, `Email could not be sent: ${error.message}`);
    }
};
exports.sendEmail = sendEmail;
