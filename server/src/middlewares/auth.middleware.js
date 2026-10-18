import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';
import { User } from '../models/User.js';

export const verifyJWT = async (req, res, next) => {
  try {
    let token;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('Authentication required. Missing token.', 401));
    }

    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);

    // Verify user still exists in the database
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(new AppError('User belonging to this token no longer exists.', 401));
    }

    req.user = currentUser;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid token signature.', 401));
    }
    if (err.name === 'TokenExpiredError') {
      return next(new AppError('Token has expired. Please log in again.', 401));
    }
    next(err);
  }
};

export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError(`Access forbidden: '${req.user.role}' lacks necessary permissions.`, 403)
      );
    }
    next();
  };
};