import express from 'express';
import { 
  register, 
  login,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword
} from '../../controllers/auth-controller';

const router = express.Router();

// Authentication routes
router.post('/register', register);
router.post('/login', login);
router.post('/refresh-token', refreshToken);
router.post('/logout', logout);

// Password management routes
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;