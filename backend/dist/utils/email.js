"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer"));
const config_1 = __importDefault(require("../config"));
/**
 * Send an email using nodemailer
 * @param options Email options including recipient, subject, and content
 */
const sendEmail = (options) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Create a transporter
        const transporter = nodemailer_1.default.createTransport({
            host: config_1.default.emailConfig.SMTP_HOST,
            port: config_1.default.emailConfig.SMTP_PORT,
            secure: true, // true for 465, false for other ports
            auth: {
                user: config_1.default.emailConfig.SMTP_USER,
                pass: config_1.default.emailConfig.SMTP_PASSWORD,
            },
        });
        // Set email options
        const mailOptions = {
            from: `"${config_1.default.emailConfig.FROM_NAME}" <${config_1.default.emailConfig.FROM_EMAIL}>`,
            to: options.to,
            subject: options.subject,
            text: options.text || '',
            html: options.html || '',
        };
        // Send the email
        yield transporter.sendMail(mailOptions);
        console.log(`Email sent to ${options.to}`);
    }
    catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Email could not be sent');
    }
});
exports.default = sendEmail;
