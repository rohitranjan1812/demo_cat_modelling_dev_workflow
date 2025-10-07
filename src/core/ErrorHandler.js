/**
 * Centralized Error Handling System
 * Provides custom error classes and handling middleware
 */

const crypto = require('crypto');

// Generate a simple correlation ID
function generateCorrelationId() {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * Base Application Error
 */
class ApplicationError extends Error {
  constructor(message, statusCode = 500, details = {}, isOperational = true) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = isOperational;
    this.correlationId = generateCorrelationId();
    this.timestamp = new Date().toISOString();
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      details: this.details,
      correlationId: this.correlationId,
      timestamp: this.timestamp,
      ...(process.env.NODE_ENV !== 'production' && { stack: this.stack })
    };
  }
}

/**
 * Validation Error (400)
 */
class ValidationError extends ApplicationError {
  constructor(message, details = {}) {
    super(message, 400, details, true);
  }
}

/**
 * Not Found Error (404)
 */
class NotFoundError extends ApplicationError {
  constructor(resource, identifier) {
    const message = identifier 
      ? `${resource} not found: ${identifier}`
      : `${resource} not found`;
    super(message, 404, { resource, identifier }, true);
  }
}

/**
 * Authentication Error (401)
 */
class AuthenticationError extends ApplicationError {
  constructor(message = 'Authentication required') {
    super(message, 401, {}, true);
  }
}

/**
 * Authorization Error (403)
 */
class AuthorizationError extends ApplicationError {
  constructor(message = 'Insufficient permissions', requiredPermission = null) {
    super(message, 403, { requiredPermission }, true);
  }
}

/**
 * Conflict Error (409)
 */
class ConflictError extends ApplicationError {
  constructor(message, details = {}) {
    super(message, 409, details, true);
  }
}

/**
 * Bad Request Error (400)
 */
class BadRequestError extends ApplicationError {
  constructor(message, details = {}) {
    super(message, 400, details, true);
  }
}

/**
 * Internal Server Error (500)
 */
class InternalServerError extends ApplicationError {
  constructor(message = 'Internal server error', details = {}) {
    super(message, 500, details, false);
  }
}

/**
 * Database Error
 */
class DatabaseError extends ApplicationError {
  constructor(message, originalError = null) {
    super(message, 500, { originalError: originalError?.message }, false);
  }
}

/**
 * External Service Error
 */
class ExternalServiceError extends ApplicationError {
  constructor(service, message, details = {}) {
    super(`External service error (${service}): ${message}`, 502, { service, ...details }, true);
  }
}

/**
 * Error Handler Class
 */
class ErrorHandler {
  constructor() {
    this.logger = console; // Replace with Winston/Pino in production
  }

  /**
   * Handle error and log appropriately
   * @param {Error} error - Error object
   * @param {Object} req - Express request object (optional)
   * @returns {Object} Error information
   */
  handleError(error, req = null) {
    const errorInfo = {
      correlationId: error.correlationId || generateCorrelationId(),
      timestamp: error.timestamp || new Date().toISOString(),
      name: error.name || 'Error',
      message: error.message,
      statusCode: error.statusCode || 500,
      details: error.details || {},
      isOperational: error.isOperational || false
    };

    // Add request context if available
    if (req) {
      errorInfo.request = {
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.get('user-agent'),
        userId: req.user?.id,
        body: this.sanitizeRequestBody(req.body)
      };
    }

    // Log based on severity
    if (error.isOperational) {
      this.logger.warn('Operational error:', errorInfo);
    } else {
      this.logger.error('Programming error:', errorInfo);
      
      // In production, you might want to:
      // - Send alerts to monitoring service
      // - Restart the process gracefully
      // - Log to external error tracking (Sentry, Rollbar, etc.)
    }

    return errorInfo;
  }

  /**
   * Express error handling middleware
   * @returns {Function} Express middleware
   */
  middleware() {
    return (error, req, res, next) => {
      const errorInfo = this.handleError(error, req);

      // Don't expose internal details in production
      const responsePayload = {
        success: false,
        error: {
          message: error.message,
          correlationId: errorInfo.correlationId,
          ...(process.env.NODE_ENV !== 'production' && {
            details: error.details,
            stack: error.stack
          })
        }
      };

      res.status(error.statusCode || 500).json(responsePayload);
    };
  }

  /**
   * Async route wrapper to catch errors
   * @param {Function} fn - Async route handler
   * @returns {Function} Wrapped handler
   */
  static asyncHandler(fn) {
    return (req, res, next) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  }

  /**
   * Sanitize request body for logging (remove sensitive data)
   * @param {Object} body - Request body
   * @returns {Object} Sanitized body
   */
  sanitizeRequestBody(body) {
    if (!body) return {};

    const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'creditCard'];
    const sanitized = { ...body };

    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });

    return sanitized;
  }

  /**
   * Handle unhandled promise rejections
   */
  handleUnhandledRejection() {
    process.on('unhandledRejection', (reason, promise) => {
      this.logger.error('Unhandled Promise Rejection:', {
        reason,
        promise
      });

      // Optional: Exit process in production
      if (process.env.NODE_ENV === 'production') {
        process.exit(1);
      }
    });
  }

  /**
   * Handle uncaught exceptions
   */
  handleUncaughtException() {
    process.on('uncaughtException', (error) => {
      this.logger.error('Uncaught Exception:', error);

      // Graceful shutdown
      process.exit(1);
    });
  }

  /**
   * Initialize global error handlers
   */
  initializeGlobalHandlers() {
    this.handleUnhandledRejection();
    this.handleUncaughtException();
  }
}

// Export singleton instance and error classes
module.exports = {
  ErrorHandler: new ErrorHandler(),
  ApplicationError,
  ValidationError,
  NotFoundError,
  AuthenticationError,
  AuthorizationError,
  ConflictError,
  BadRequestError,
  InternalServerError,
  DatabaseError,
  ExternalServiceError,
  asyncHandler: ErrorHandler.asyncHandler
};
