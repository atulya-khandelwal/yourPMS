import { Request, Response } from 'express';
import { StatusCodes } from "http-status-codes";
import db from '../db';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import configs from '../config';
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from '../validators/user-validator';
import  sendEmail  from '../utils/email';

// Define interfaces for type safety
interface TokenPayload {
  userId: number;
  iat?: number;
  exp?: number;
}

interface ResetTokenPayload extends TokenPayload {
  email: string;
}

interface RefreshTokenRequest extends Request {
  body: {
    refreshToken: string;
  };
}

/**
 * Generate both access and refresh tokens
 * @param userId User ID to include in the token
 * @returns Object containing both tokens
 */
const generateTokens = (userId: number): { accessToken: string, refreshToken: string } => {
  const accessToken = jwt.sign(
    { userId },
    configs.serverConfig.JWT_SECRET as string,
    { expiresIn: '1d' }
  );
  
  const refreshToken = jwt.sign(
    { userId },
    configs.serverConfig.JWT_REFRESH_SECRET as string,
    { expiresIn: '7d' }
  );
  
  return { accessToken, refreshToken };
};

/**
 * Register a new user
 */
export const register = async (req: Request, res: Response): Promise<any> => {
  try {
    const parseResult = registerSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        errors: parseResult.error.flatten().fieldErrors,
      });
    } 
    const { name, email, password } = parseResult.data;

    const userExists = await db.query('SELECT id FROM users WHERE email = $1', [email]);

    if (userExists.rowCount) {
      return res.status(StatusCodes.CONFLICT).json({ 
        success: false,
        error: 'Email Already Registered' 
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email',
      [name, email, hashedPassword]
    );

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(result.rows[0].id);
    
    // Store refresh token in database
    await db.query('UPDATE users SET refresh_token = $1 WHERE id = $2', 
      [refreshToken, result.rows[0].id]
    );

    return res.status(StatusCodes.CREATED).json({
      success: true,
      user: result.rows[0],
      accessToken,
      refreshToken
    });

  } catch (error) {
    console.error('Registration error: ', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
      success: false,
      error: 'Internal Server Error' 
    });
  }
};

/**
 * Login a user
 */
export const login = async (req: Request, res: Response): Promise<any> => {
  try {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        errors: parseResult.error.flatten().fieldErrors,
      });
    } 

    const { email, password } = parseResult.data;

    const userResult = await db.query('SELECT * FROM users WHERE email = $1', [email]);

    if (userResult.rowCount === 0) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ 
        success: false,
        error: 'Invalid Credentials' 
      });
    }

    const user = userResult.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ 
        success: false,
        error: 'Invalid Credentials' 
      });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id);
    
    // Store refresh token in database
    await db.query('UPDATE users SET refresh_token = $1 WHERE id = $2', 
      [refreshToken, user.id]
    );

    // Return tokens and user info (excluding password)
    const { password: _, ...userWithoutPassword } = user;
    
    return res.status(StatusCodes.OK).json({ 
      success: true,
      user: userWithoutPassword,
      accessToken, 
      refreshToken 
    });
  } catch (error) {
    console.log('Login error:', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
      success: false,
      error: 'Internal Server Error' 
    });
  }
};

/**
 * Refresh the access token using a valid refresh token
 */
export const refreshToken = async (req: RefreshTokenRequest, res: Response): Promise<any> => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(StatusCodes.BAD_REQUEST).json({ 
      success: false,
      error: 'Refresh Token missing' 
    });
  }

  try {
    // Verify refresh token
    const decoded = jwt.verify(
      refreshToken,
      configs.serverConfig.JWT_REFRESH_SECRET as string
    ) as TokenPayload;

    // Check if refresh token exists in database
    const userResult = await db.query(
      'SELECT id FROM users WHERE id = $1 AND refresh_token = $2',
      [decoded.userId, refreshToken]
    );

    if (userResult.rowCount === 0) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ 
        success: false,
        error: 'Invalid refresh token' 
      });
    }

    // Generate new access token
    const accessToken = jwt.sign(
      { userId: decoded.userId },
      configs.serverConfig.JWT_SECRET as string,
      { expiresIn: '1d' }
    );

    return res.status(StatusCodes.OK).json({ 
      success: true,
      accessToken 
    });
  } catch (error) {
    console.error('Error refreshing token:', error);
    
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ 
        success: false,
        error: 'Refresh token expired' 
      });
    }
    
    return res.status(StatusCodes.UNAUTHORIZED).json({ 
      success: false,
      error: 'Invalid refresh token' 
    });
  }
};

/**
 * Log out user by invalidating their refresh token
 */
export const logout = async (req: RefreshTokenRequest, res: Response): Promise<any> => {
  const { refreshToken } = req.body;
  
  if (!refreshToken) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      error: 'Refresh token required'
    });
  }
  
  try {
    // Remove refresh token from database
    await db.query('UPDATE users SET refresh_token = NULL WHERE refresh_token = $1', [refreshToken]);
    
    return res.status(StatusCodes.OK).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Logout failed'
    });
  }
};

/**
 * Initiate password reset process by sending a reset link via email
 */
export const forgotPassword = async (req: Request, res: Response): Promise<any> => {
  try {
    const parseResult = forgotPasswordSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        errors: parseResult.error.flatten().fieldErrors,
      });
    }
    
    const { email } = parseResult.data;
    
    // Check if user exists
    const userResult = await db.query('SELECT id, email FROM users WHERE email = $1', [email]);
    
    // For security reasons, always return success even if email doesn't exist
    if (userResult.rowCount === 0) {
      return res.status(StatusCodes.OK).json({
        success: true,
        message: 'You are not registered'
      });
    }
    
    const user = userResult.rows[0];
    
    // Generate reset token (short-lived)
    const resetToken = jwt.sign(
      { userId: user.id, email: user.email },
      configs.serverConfig.JWT_RESET_SECRET as string,
      { expiresIn: '15m' }
    );
    
    // Save token hash in database
    const resetTokenHash = await bcrypt.hash(resetToken, 10);
    await db.query(
      'UPDATE users SET reset_token = $1, reset_token_expires = NOW() + INTERVAL \'15 minutes\' WHERE id = $2',
      [resetTokenHash, user.id]
    );
    
    // Create reset URL
    const resetUrl = `${configs.serverConfig.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    // Send email with reset link
    await sendEmail({
      to: email,
      subject: 'Password Reset Request',
      html: `
        <p>You requested a password reset.</p>
        <p>Click <a href="${resetUrl}">here</a> to reset your password.</p>
        <p>This link is valid for 15 minutes.</p>
        <p>If you did not request this, please ignore this email.</p>
      `
    });
    
    return res.status(StatusCodes.OK).json({
      success: true,
      message: 'If your email is registered, you will receive a password reset link'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Failed to process request'
    });
  }
};

/**
 * Reset password using valid reset token
 */
export const resetPassword = async (req: Request, res: Response): Promise<any> => {
  try {
    const parseResult = resetPasswordSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        errors: parseResult.error.flatten().fieldErrors,
      });
    }
    
    const { token, password } = parseResult.data;
    
    let decoded: ResetTokenPayload;
    try {
      // Verify token
      decoded = jwt.verify(
        token,
        configs.serverConfig.JWT_RESET_SECRET as string
      ) as ResetTokenPayload;
    } catch (error) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        error: 'Invalid or expired reset token'
      });
    }
    
    // Get user and check if reset token is valid
    const userResult = await db.query(
      'SELECT id, reset_token, reset_token_expires FROM users WHERE id = $1 AND email = $2 AND reset_token_expires > NOW()',
      [decoded.userId, decoded.email]
    );
    
    if (userResult.rowCount === 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        error: 'Invalid or expired reset token'
      });
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Update password and clear reset token
    await db.query(
      'UPDATE users SET password = $1, reset_token = NULL, reset_token_expires = NULL WHERE id = $2',
      [hashedPassword, decoded.userId]
    );
    
    return res.status(StatusCodes.OK).json({
      success: true,
      message: 'Password has been reset successfully'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Failed to reset password'
    });
  }
};