/* eslint-disable @typescript-eslint/no-explicit-any */
import ejs from "ejs";
import status from "http-status";
import nodemailer from "nodemailer";
import path from "path";
import { env } from "../config/env";
import AppError from "../errorHelpers/AppError";

const transporter = nodemailer.createTransport({
    host: env.EMAIL_SENDER_SMTP_HOST,
    port: Number(env.EMAIL_SENDER_SMTP_PORT),
    secure: Number(env.EMAIL_SENDER_SMTP_PORT) === 465,
    auth: {
        user: env.EMAIL_SENDER_SMTP_USER,
        pass: env.EMAIL_SENDER_SMTP_PASS
    },
    tls: {
        rejectUnauthorized: false
    }
})

interface SendEmailOptions {
    to: string;
    subject: string;
    templateName: string;
    templateData: Record<string, any>;
    attachments?: {
        filename: string;
        content: Buffer | string;
        contentType: string;
    }[]
}

export const sendEmail = async ({subject, templateData, templateName, to, attachments} : SendEmailOptions) => {
    try {
        const templatePath = path.resolve(process.cwd(), `src/app/templates/${templateName}.ejs`);

        const html = await ejs.renderFile(templatePath, templateData);

        await transporter.sendMail({
            from: env.EMAIL_SENDER_SMTP_USER,
            to : to,
            subject : subject,
            html : html,
            attachments: attachments?.map((attachment) => ({
                filename: attachment.filename,
                content: attachment.content,
                contentType: attachment.contentType,
            }))
        })

    } catch (error : any) {
        throw new AppError(status.INTERNAL_SERVER_ERROR, `Email could not be sent: ${error.message}`);
    }
}