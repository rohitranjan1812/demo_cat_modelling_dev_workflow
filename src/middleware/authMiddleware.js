/**
 * JWT Authentication Middleware for CAT Modeling Platform
 * Provides token-based authentication and authorization
 */

const jwt = require('jsonwebtoken');
// User model will be required dynamically to avoid circular dependency

const JWT_SECRET = process.env.JWT_SECRET || 'cat_modeling_platform_secret_2025';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Generate JWT token for user
 * @param {Object} user - User object
 * @returns {string} JWT token
 */
function generateToken(user) {
  return jwt.sign(
    {
      userId: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      permissions: user.permissions
    },
    JWT_SECRET,
    { 
      expiresIn: JWT_EXPIRES_IN,
      issuer: 'cat-modeling-platform',
      audience: 'cat-modeling-users'
    }
  );
}

/**
 * Generate refresh token
 * @param {Object} user - User object
 * @returns {string} Refresh token
 */
function generateRefreshToken(user) {
  return jwt.sign(
    { userId: user._id },
    JWT_SECRET + '_refresh',
    { 
      expiresIn: '30d',
      issuer: 'cat-modeling-platform'
    }
  );
}

/**
 * Verify JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object} Decoded token payload
 */
function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET, {
    issuer: 'cat-modeling-platform',
    audience: 'cat-modeling-users'
  });
}

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request
 */
async function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Access token required',
        errorCode: 'NO_TOKEN'
      });
    }

    const token = authHeader.split(' ')[1]; // Bearer <token>
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token format. Use: Bearer <token>',
        errorCode: 'INVALID_TOKEN_FORMAT'
      });
    }

    // Verify token
    const decoded = verifyToken(token);
    
    // Check if user still exists and is active
    const User = require('../models/User');
    const user = await User.findById(decoded.userId).select('-password');
    if (!user || user.status !== 'Active') {
      return res.status(401).json({
        success: false,
        message: 'User not found or inactive',
        errorCode: 'USER_INACTIVE'
      });
    }

    // Check if token was issued before password change
    if (user.passwordChangedAt && decoded.iat < user.passwordChangedAt.getTime() / 1000) {
      return res.status(401).json({
        success: false,
        message: 'Token invalid due to password change. Please login again.',
        errorCode: 'TOKEN_EXPIRED_PASSWORD_CHANGE'
      });
    }

    // Attach user to request
    req.user = user;
    req.tokenPayload = decoded;
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired',
        errorCode: 'TOKEN_EXPIRED',
        expiredAt: error.expiredAt
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
        errorCode: 'INVALID_TOKEN'
      });
    }

    console.error('Authentication error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication service error',
      errorCode: 'AUTH_SERVICE_ERROR'
    });
  }
}

/**
 * Optional authentication middleware
 * Attaches user if token is valid, but doesn't require authentication
 */
async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      req.user = null;
      return next();
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = verifyToken(token);
    const User = require('../models/User');
    const user = await User.findById(decoded.userId).select('-password');
    
    req.user = user && user.status === 'Active' ? user : null;
    req.tokenPayload = decoded;
    
    next();
  } catch (error) {
    // For optional auth, continue without user if token is invalid
    req.user = null;
    next();
  }
}

/**
 * Role-based authorization middleware
 * @param {Array<string>} allowedRoles - Array of allowed roles
 * @returns {Function} Middleware function
 */
function requireRole(allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        errorCode: 'AUTH_REQUIRED'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required roles: ${allowedRoles.join(', ')}`,
        errorCode: 'INSUFFICIENT_PERMISSIONS',
        userRole: req.user.role,
        requiredRoles: allowedRoles
      });
    }

    next();
  };
}

/**
 * Permission-based authorization middleware
 * @param {Array<string>} requiredPermissions - Array of required permissions
 * @returns {Function} Middleware function
 */
function requirePermission(requiredPermissions) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        errorCode: 'AUTH_REQUIRED'
      });
    }

    const userPermissions = req.user.permissions || [];
    const hasAllPermissions = requiredPermissions.every(permission => 
      userPermissions.includes(permission)
    );

    if (!hasAllPermissions) {
      const missingPermissions = requiredPermissions.filter(permission => 
        !userPermissions.includes(permission)
      );
      
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
        errorCode: 'INSUFFICIENT_PERMISSIONS',
        missingPermissions,
        userPermissions
      });
    }

    next();
  };
}

/**
 * Resource ownership authorization middleware
 * Checks if user owns or has access to a specific resource
 * @param {string} resourceType - Type of resource (hazard, vulnerability, etc.)
 * @returns {Function} Middleware function
 */
function requireResourceAccess(resourceType) {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        errorCode: 'AUTH_REQUIRED'
      });
    }

    try {
      const resourceId = req.params.id;
      const Model = require(`../models/${resourceType}`);
      
      const resource = await Model.findById(resourceId);
      if (!resource) {
        return res.status(404).json({
          success: false,
          message: `${resourceType} not found`,
          errorCode: 'RESOURCE_NOT_FOUND'
        });
      }

      // Check ownership or admin role
      const isOwner = resource.createdBy === req.user._id.toString();
      const isAdmin = req.user.role === 'Admin';
      const canRead = req.user.permissions?.includes(`read_${resourceType.toLowerCase()}s`);
      
      if (!isOwner && !isAdmin && !canRead) {
        return res.status(403).json({
          success: false,
          message: 'Access denied to this resource',
          errorCode: 'RESOURCE_ACCESS_DENIED'
        });
      }

      req.resource = resource;
      next();
    } catch (error) {
      console.error('Resource access check error:', error);
      res.status(500).json({
        success: false,
        message: 'Error checking resource access',
        errorCode: 'RESOURCE_ACCESS_ERROR'
      });
    }
  };
}

/**
 * Rate limiting middleware for authentication endpoints
 * @param {number} maxAttempts - Maximum attempts per time window
 * @param {number} windowMs - Time window in milliseconds
 * @returns {Function} Middleware function
 */
function rateLimit(maxAttempts = 5, windowMs = 15 * 60 * 1000) { // 15 minutes
  const attempts = new Map();
  
  return (req, res, next) => {
    // In development, be more lenient with rate limiting
    if (process.env.NODE_ENV === 'development') {
      // Increase limits for development
      const devMaxAttempts = Math.max(maxAttempts * 10, 100);
      const devWindowMs = Math.min(windowMs, 5 * 60 * 1000); // Max 5 minutes in dev
      
      const clientId = req.ip || req.connection.remoteAddress;
      const now = Date.now();
      
      // Clean old attempts
      for (const [id, data] of attempts.entries()) {
        if (now - data.firstAttempt > devWindowMs) {
          attempts.delete(id);
        }
      }
      
      const clientAttempts = attempts.get(clientId);
      
      if (!clientAttempts) {
        attempts.set(clientId, {
          count: 1,
          firstAttempt: now
        });
        return next();
      }
      
      if (now - clientAttempts.firstAttempt > devWindowMs) {
        // Reset window
        attempts.set(clientId, {
          count: 1,
          firstAttempt: now
        });
        return next();
      }
      
      if (clientAttempts.count >= devMaxAttempts) {
        const resetTime = new Date(clientAttempts.firstAttempt + devWindowMs);
        return res.status(429).json({
          success: false,
          message: 'Too many authentication attempts (development mode)',
          errorCode: 'RATE_LIMIT_EXCEEDED',
          retryAfter: resetTime,
          maxAttempts: devMaxAttempts,
          windowMinutes: Math.floor(devWindowMs / (1000 * 60))
        });
      }
      
      clientAttempts.count++;
      return next();
    }
    
    // Production rate limiting
    const clientId = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    
    // Clean old attempts
    for (const [id, data] of attempts.entries()) {
      if (now - data.firstAttempt > windowMs) {
        attempts.delete(id);
      }
    }
    
    const clientAttempts = attempts.get(clientId);
    
    if (!clientAttempts) {
      attempts.set(clientId, {
        count: 1,
        firstAttempt: now
      });
      return next();
    }
    
    if (now - clientAttempts.firstAttempt > windowMs) {
      // Reset window
      attempts.set(clientId, {
        count: 1,
        firstAttempt: now
      });
      return next();
    }
    
    if (clientAttempts.count >= maxAttempts) {
      const resetTime = new Date(clientAttempts.firstAttempt + windowMs);
      return res.status(429).json({
        success: false,
        message: 'Too many authentication attempts',
        errorCode: 'RATE_LIMIT_EXCEEDED',
        retryAfter: resetTime,
        maxAttempts,
        windowMinutes: Math.floor(windowMs / (1000 * 60))
      });
    }
    
    clientAttempts.count++;
    next();
  };
}

/**
 * API Key authentication middleware (for service-to-service communication)
 * @param {string} validApiKey - Valid API key
 * @returns {Function} Middleware function
 */
function authenticateApiKey(validApiKey) {
  return (req, res, next) => {
    const apiKey = req.headers['x-api-key'] || req.headers['X-API-Key'];
    
    if (!apiKey) {
      return res.status(401).json({
        success: false,
        message: 'API key required',
        errorCode: 'NO_API_KEY'
      });
    }

    if (apiKey !== validApiKey) {
      return res.status(401).json({
        success: false,
        message: 'Invalid API key',
        errorCode: 'INVALID_API_KEY'
      });
    }

    // Set service user for API key requests
    req.user = {
      _id: 'service',
      username: 'service',
      role: 'Service',
      permissions: ['read_all', 'write_all']
    };

    next();
  };
}

/**
 * Development mode bypass middleware
 * Allows bypassing authentication in development environment
 */
function devAuthBypass(req, res, next) {
  if (process.env.NODE_ENV === 'development' && process.env.BYPASS_AUTH === 'true') {
    // Create mock user for development
    req.user = {
      _id: 'dev-user',
      username: 'developer',
      email: 'dev@catmodeling.com',
      role: 'Admin',
      permissions: ['read_all', 'write_all', 'admin'],
      status: 'Active'
    };
    
    return next();
  }
  
  // Continue with normal authentication
  return authenticateToken(req, res, next);
}

module.exports = {
  generateToken,
  generateRefreshToken,
  verifyToken,
  authenticateToken,
  optionalAuth,
  requireRole,
  requirePermission,
  requireResourceAccess,
  rateLimit,
  authenticateApiKey,
  devAuthBypass,
  JWT_SECRET,
  JWT_EXPIRES_IN
};
