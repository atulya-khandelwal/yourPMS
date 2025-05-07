"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = exports.refreshAccessToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("../config"));
const http_status_codes_1 = require("http-status-codes");
const refreshAccessToken = (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        return res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json({ error: 'Refresh Token missing' });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(refreshToken, config_1.default.serverConfig.JWT_REFRESH_SECRET);
        const newAccessToken = jsonwebtoken_1.default.sign({ userId: decoded.userId }, config_1.default.serverConfig.JWT_SECRET, { expiresIn: '1d' });
        return res.status(http_status_codes_1.StatusCodes.OK).json({ newAccessToken });
    }
    catch (error) {
        console.error('Error verifying refresh token:', error);
        return res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json({ error: 'Invalid or expired refresh token' });
    }
};
exports.refreshAccessToken = refreshAccessToken;
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json({ error: 'Unauthorized: No token provided' });
        return;
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(token, config_1.default.serverConfig.JWT_SECRET);
        if (!decoded || typeof decoded !== 'object' || !decoded.userId) {
            res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json({ error: 'Invalid token structure' });
            return;
        }
        // Cast to AuthenticatedRequest to set user property
        req.user = { userId: decoded.userId };
        next();
    }
    catch (error) {
        console.error('Auth middleware error:', error);
        res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json({ error: 'Unauthorized: Invalid token' });
    }
};
exports.authenticate = authenticate;
