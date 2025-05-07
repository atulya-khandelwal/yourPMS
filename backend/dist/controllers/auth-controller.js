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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.forgotPassword = exports.logout = exports.refreshToken = exports.login = exports.register = void 0;
const http_status_codes_1 = require("http-status-codes");
const db_1 = __importDefault(require("../db"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("../config"));
const user_validator_1 = require("../validators/user-validator");
const email_1 = __importDefault(require("../utils/email"));
/**
 * Generate both access and refresh tokens
 * @param userId User ID to include in the token
 * @returns Object containing both tokens
 */
const generateTokens = (userId) => {
    const accessToken = jsonwebtoken_1.default.sign({ userId }, config_1.default.serverConfig.JWT_SECRET, { expiresIn: '1d' });
    const refreshToken = jsonwebtoken_1.default.sign({ userId }, config_1.default.serverConfig.JWT_REFRESH_SECRET, { expiresIn: '7d' });
    return { accessToken, refreshToken };
};
/**
 * Register a new user
 */
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const parseResult = user_validator_1.registerSchema.safeParse(req.body);
        if (!parseResult.success) {
            return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
                success: false,
                errors: parseResult.error.flatten().fieldErrors,
            });
        }
        const { name, email, password } = parseResult.data;
        const userExists = yield db_1.default.query('SELECT id FROM users WHERE email = $1', [email]);
        if (userExists.rowCount) {
            return res.status(http_status_codes_1.StatusCodes.CONFLICT).json({
                success: false,
                error: 'Email Already Registered'
            });
        }
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        const result = yield db_1.default.query('INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email', [name, email, hashedPassword]);
        // Generate tokens
        const { accessToken, refreshToken } = generateTokens(result.rows[0].id);
        // Store refresh token in database
        yield db_1.default.query('UPDATE users SET refresh_token = $1 WHERE id = $2', [refreshToken, result.rows[0].id]);
        return res.status(http_status_codes_1.StatusCodes.CREATED).json({
            success: true,
            user: result.rows[0],
            accessToken,
            refreshToken
        });
    }
    catch (error) {
        console.error('Registration error: ', error);
        return res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            error: 'Internal Server Error'
        });
    }
});
exports.register = register;
/**
 * Login a user
 */
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const parseResult = user_validator_1.loginSchema.safeParse(req.body);
        if (!parseResult.success) {
            return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
                success: false,
                errors: parseResult.error.flatten().fieldErrors,
            });
        }
        const { email, password } = parseResult.data;
        const userResult = yield db_1.default.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userResult.rowCount === 0) {
            return res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json({
                success: false,
                error: 'Invalid Credentials'
            });
        }
        const user = userResult.rows[0];
        const passwordMatch = yield bcrypt_1.default.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json({
                success: false,
                error: 'Invalid Credentials'
            });
        }
        // Generate tokens
        const { accessToken, refreshToken } = generateTokens(user.id);
        // Store refresh token in database
        yield db_1.default.query('UPDATE users SET refresh_token = $1 WHERE id = $2', [refreshToken, user.id]);
        // Return tokens and user info (excluding password)
        const { password: _ } = user, userWithoutPassword = __rest(user, ["password"]);
        return res.status(http_status_codes_1.StatusCodes.OK).json({
            success: true,
            user: userWithoutPassword,
            accessToken,
            refreshToken
        });
    }
    catch (error) {
        console.log('Login error:', error);
        return res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            error: 'Internal Server Error'
        });
    }
});
exports.login = login;
/**
 * Refresh the access token using a valid refresh token
 */
const refreshToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
            success: false,
            error: 'Refresh Token missing'
        });
    }
    try {
        // Verify refresh token
        const decoded = jsonwebtoken_1.default.verify(refreshToken, config_1.default.serverConfig.JWT_REFRESH_SECRET);
        // Check if refresh token exists in database
        const userResult = yield db_1.default.query('SELECT id FROM users WHERE id = $1 AND refresh_token = $2', [decoded.userId, refreshToken]);
        if (userResult.rowCount === 0) {
            return res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json({
                success: false,
                error: 'Invalid refresh token'
            });
        }
        // Generate new access token
        const accessToken = jsonwebtoken_1.default.sign({ userId: decoded.userId }, config_1.default.serverConfig.JWT_SECRET, { expiresIn: '1d' });
        return res.status(http_status_codes_1.StatusCodes.OK).json({
            success: true,
            accessToken
        });
    }
    catch (error) {
        console.error('Error refreshing token:', error);
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            return res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json({
                success: false,
                error: 'Refresh token expired'
            });
        }
        return res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json({
            success: false,
            error: 'Invalid refresh token'
        });
    }
});
exports.refreshToken = refreshToken;
/**
 * Log out user by invalidating their refresh token
 */
const logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
            success: false,
            error: 'Refresh token required'
        });
    }
    try {
        // Remove refresh token from database
        yield db_1.default.query('UPDATE users SET refresh_token = NULL WHERE refresh_token = $1', [refreshToken]);
        return res.status(http_status_codes_1.StatusCodes.OK).json({
            success: true,
            message: 'Logged out successfully'
        });
    }
    catch (error) {
        console.error('Logout error:', error);
        return res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            error: 'Logout failed'
        });
    }
});
exports.logout = logout;
/**
 * Initiate password reset process by sending a reset link via email
 */
const forgotPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const parseResult = user_validator_1.forgotPasswordSchema.safeParse(req.body);
        if (!parseResult.success) {
            return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
                success: false,
                errors: parseResult.error.flatten().fieldErrors,
            });
        }
        const { email } = parseResult.data;
        // Check if user exists
        const userResult = yield db_1.default.query('SELECT id, email FROM users WHERE email = $1', [email]);
        // For security reasons, always return success even if email doesn't exist
        if (userResult.rowCount === 0) {
            return res.status(http_status_codes_1.StatusCodes.OK).json({
                success: true,
                message: 'You are not registered'
            });
        }
        const user = userResult.rows[0];
        // Generate reset token (short-lived)
        const resetToken = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email }, config_1.default.serverConfig.JWT_RESET_SECRET, { expiresIn: '15m' });
        // Save token hash in database
        const resetTokenHash = yield bcrypt_1.default.hash(resetToken, 10);
        yield db_1.default.query('UPDATE users SET reset_token = $1, reset_token_expires = NOW() + INTERVAL \'15 minutes\' WHERE id = $2', [resetTokenHash, user.id]);
        // Create reset URL
        const resetUrl = `${config_1.default.serverConfig.FRONTEND_URL}/reset-password?token=${resetToken}`;
        // Send email with reset link
        yield (0, email_1.default)({
            to: email,
            subject: 'Password Reset Request',
            html: `
        <p>You requested a password reset.</p>
        <p>Click <a href="${resetUrl}">here</a> to reset your password.</p>
        <p>This link is valid for 15 minutes.</p>
        <p>If you did not request this, please ignore this email.</p>
      `
        });
        return res.status(http_status_codes_1.StatusCodes.OK).json({
            success: true,
            message: 'If your email is registered, you will receive a password reset link'
        });
    }
    catch (error) {
        console.error('Forgot password error:', error);
        return res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            error: 'Failed to process request'
        });
    }
});
exports.forgotPassword = forgotPassword;
/**
 * Reset password using valid reset token
 */
const resetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const parseResult = user_validator_1.resetPasswordSchema.safeParse(req.body);
        if (!parseResult.success) {
            return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
                success: false,
                errors: parseResult.error.flatten().fieldErrors,
            });
        }
        const { token, password } = parseResult.data;
        let decoded;
        try {
            // Verify token
            decoded = jsonwebtoken_1.default.verify(token, config_1.default.serverConfig.JWT_RESET_SECRET);
        }
        catch (error) {
            return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
                success: false,
                error: 'Invalid or expired reset token'
            });
        }
        // Get user and check if reset token is valid
        const userResult = yield db_1.default.query('SELECT id, reset_token, reset_token_expires FROM users WHERE id = $1 AND email = $2 AND reset_token_expires > NOW()', [decoded.userId, decoded.email]);
        if (userResult.rowCount === 0) {
            return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
                success: false,
                error: 'Invalid or expired reset token'
            });
        }
        // Hash new password
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        // Update password and clear reset token
        yield db_1.default.query('UPDATE users SET password = $1, reset_token = NULL, reset_token_expires = NULL WHERE id = $2', [hashedPassword, decoded.userId]);
        return res.status(http_status_codes_1.StatusCodes.OK).json({
            success: true,
            message: 'Password has been reset successfully'
        });
    }
    catch (error) {
        console.error('Reset password error:', error);
        return res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            error: 'Failed to reset password'
        });
    }
});
exports.resetPassword = resetPassword;
