import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Middleware to verify JWT token
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Access token required',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        phone: true,
        name: true,
        role: true,
        location: true,
        verified: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not found',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid token',
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Token expired',
      });
    }

    console.error('Auth middleware error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Authentication failed',
    });
  }
};

// Middleware to check if user has required role
export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Insufficient permissions',
      });
    }

    next();
  };
};

// Middleware for optional authentication (user info if available)
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          phone: true,
          name: true,
          role: true,
          location: true,
          verified: true,
        },
      });
      req.user = user;
    }

    next();
  } catch (error) {
    // Ignore auth errors for optional auth
    next();
  }
};