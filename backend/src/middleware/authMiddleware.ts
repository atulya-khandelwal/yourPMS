import { Request, Response, NextFunction } from "express";
import jwt from 'jsonwebtoken';
import configs from '../config';
import { StatusCodes } from "http-status-codes";

interface AuthenticatedRequest extends Request {
    user?: { userId: number };
}

export const refreshAccessToken = (req: Request, res: Response): Response => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Refresh Token missing' });
    }

    try {
        const decoded = jwt.verify(
            refreshToken,
            configs.serverConfig.JWT_REFRESH_SECRET as string
        ) as { userId: number };

        const newAccessToken = jwt.sign(
            { userId: decoded.userId },
            configs.serverConfig.JWT_SECRET as string,
            { expiresIn: '1d' }
        );

        return res.status(StatusCodes.OK).json({ newAccessToken });
    } catch (error) {
        console.error('Error verifying refresh token:', error);
        return res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Invalid or expired refresh token' });
    }
};


export const authenticate = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Unauthorized: No token provided' });
        return;
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(
            token,
            configs.serverConfig.JWT_SECRET as string
        ) as { userId: number };

        if (!decoded || typeof decoded !== 'object' || !decoded.userId) {
            res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Invalid token structure' });
            return;
        }

        // Cast to AuthenticatedRequest to set user property
        (req as AuthenticatedRequest).user = { userId: decoded.userId };
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Unauthorized: Invalid token' });
    }
};