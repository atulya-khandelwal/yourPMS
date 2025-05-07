"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const zod_1 = require("zod");
dotenv_1.default.config();
const envSchema = zod_1.z.object({
    PORT: zod_1.z.string().min(1),
    DATABASE_URL: zod_1.z.string().url({ message: "Invalid Database URL" }),
    JWT_SECRET: zod_1.z.string().min(1),
    JWT_REFRESH_SECRET: zod_1.z.string().min(1),
});
const parseEnv = envSchema.safeParse(process.env);
if (!parseEnv.success) {
    console.error('Invalid Environment variables', parseEnv.error.format());
    process.exit(1);
}
const env = parseEnv.data;
const serverConfig = {
    DATABASE_URL: process.env.DATABASE_URL,
    PORT: process.env.PORT || 5000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1d',
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
    JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    JWT_RESET_SECRET: process.env.JWT_RESET_SECRET || process.env.JWT_SECRET, // Fallback to JWT_SECRET
    FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:4000'
};
exports.default = serverConfig;
