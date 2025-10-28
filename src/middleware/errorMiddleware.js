/**
 * Error Handling Middleware
 * Express middleware for centralized error handling, logging, and response formatting
 */

const { globalErrorHandler } = require('../utils/ErrorHandler');
const { AppError } = require('../errors/CustomErrors');

/**
 * Global Error Handling Middleware
 * Catches all errors and formats responses consistently
 */
const globalErrorMiddleware = (error, req, res, next) => {
  // Generate request ID if not present
  const requestId = req.id || req.headers['x-request-id'] || generateRequestId();

  // Build context for error handling
  const context = {
    requestId,
    method: req.method,
    url: req.originalUrl,
    userAgent: req.get('User-Agent'),
    ip: req.ip || req.connection.remoteAddress,
    userId: req.user?.id,
    timestamp: new Date().toISOString()
  };

  // Handle the error
  const errorResponse = globalErrorHandler.handle(error, context);

  // Log the error
  logError(error, context, req);

  // Send response
  res.status(errorResponse.error.statusCode || 500).json(errorResponse);
};

/**
 * 404 Not Found Handler
 */
const notFoundHandler = (req, res) => {
  const error = new AppError(
    `Route ${req.method} ${req.originalUrl} not found`,
    404,
    'ROUTE_NOT_FOUND'
  );
  
  const context = {
    requestId: req.id || generateRequestId(),
    method: req.method,
    url: req.originalUrl
  };

  const errorResponse = globalErrorHandler.handle(error, context);
  res.status(404).json(errorResponse);
};

/**
 * Async Error Wrapper
 * Wraps async route handlers to catch errors
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Validation Error Handler
 * Handles express-validator errors
 */
const validationErrorHandler = (req, res, next) => {
  const { validationResult } = require('express-validator');
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const validationErrors = errors.array().map(error => ({
      field: error.param,
      message: error.msg,
      value: error.value,
      location: error.location
    }));

    const error = new AppError(
      'Validation failed',
      400,
      'VALIDATION_ERROR',
      { validationErrors }
    );

    return next(error);
  }
  
  next();
};

/**
 * Rate Limiting Error Handler
 */
const rateLimitHandler = (req, res) => {
  const error = new AppError(
    'Too many requests, please try again later',
    429,
    'RATE_LIMIT_EXCEEDED'
  );

  const context = {
    requestId: req.id || generateRequestId(),
    method: req.method,
    url: req.originalUrl,
    ip: req.ip
  };

  const errorResponse = globalErrorHandler.handle(error, context);
  res.status(429).json(errorResponse);
};

/**
 * Request Timeout Handler
 */
const timeoutHandler = (timeout = 30000) => {
  return (req, res, next) => {
    res.setTimeout(timeout, () => {
      const error = new AppError(
        `Request timeout after ${timeout}ms`,
        408,
        'REQUEST_TIMEOUT'
      );
      next(error);
    });
    next();
  };
};

/**
 * CORS Error Handler
 */
const corsErrorHandler = (error, req, res, next) => {
  if (error.message && error.message.includes('CORS')) {
    const corsError = new AppError(
      'Cross-origin request blocked',
      403,
      'CORS_ERROR'
    );
    return next(corsError);
  }
  next(error);
};

/**
 * Database Connection Error Handler
 */
const dbErrorHandler = (error, req, res, next) => {
  if (error.name === 'MongooseError' || 
      error.name === 'MongoError' ||
      error.name === 'MongoNetworkError') {
    
    const dbError = new AppError(
      'Database service temporarily unavailable',
      503,
      'DATABASE_UNAVAILABLE',
      { originalError: error.message }
    );
    return next(dbError);
  }
  next(error);
};

/**
 * Log error with appropriate level
 */
const logError = (error, context, req) => {
  const logData = {
    error: {
      name: error.name,
      message: error.message,
      code: error.code,
      statusCode: error.statusCode
    },
    context,
    request: {
      method: req.method,
      url: req.originalUrl,
      body: sanitizeRequestBody(req.body),
      query: req.query,
      params: req.params
    }
  };

  // Determine log level based on error severity
  if (error.statusCode >= 500) {
    console.error('[ERROR]', logData);
  } else if (error.statusCode >= 400) {
    console.warn('[WARNING]', logData);
  } else {
    console.info('[INFO]', logData);
  }

  // Additional logging for critical errors
  if (error.statusCode >= 500) {
    // Here you could integrate with external logging services
    // like Winston, Bunyan, or cloud logging services
    console.error('[CRITICAL ERROR STACK]', error.stack);
  }
};

/**
 * Sanitize request body for logging
 */
const sanitizeRequestBody = (body) => {
  if (!body || typeof body !== 'object') {
    return body;
  }

  const sensitiveFields = [
    'password', 'token', 'secret', 'key', 'auth', 'authorization',
    'cookie', 'session', 'ssn', 'social', 'credit', 'card'
  ];

  const sanitized = { ...body };
  
  for (const field of sensitiveFields) {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  }

  return sanitized;
};

/**
 * Generate unique request ID
 */
const generateRequestId = () => {
  return 'req_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

/**
 * Error Recovery Middleware
 * Attempts to recover from certain types of errors
 */
const errorRecoveryMiddleware = (error, req, res, next) => {
  // Only attempt recovery for retryable errors
  if (!globalErrorHandler.isRetryable(error)) {
    return next(error);
  }

  // Check if this is a retry attempt
  const retryCount = parseInt(req.headers['x-retry-count'] || '0');
  const maxRetries = 3;

  if (retryCount < maxRetries) {
    // Log the retry attempt
    console.warn(`[RETRY] Attempting recovery for ${error.code}, retry ${retryCount + 1}/${maxRetries}`);
    
    // Set retry headers for client
    res.set({
      'X-Retry-After': Math.pow(2, retryCount), // Exponential backoff
      'X-Retry-Count': retryCount + 1,
      'X-Max-Retries': maxRetries
    });

    // For certain error types, we can suggest client-side retry
    if (error.code === 'DATABASE_UNAVAILABLE' || error.code === 'TIMEOUT_ERROR') {
      const retryError = new AppError(
        `Service temporarily unavailable. Retry after ${Math.pow(2, retryCount)} seconds.`,
        503,
        'SERVICE_UNAVAILABLE',
        {
          retryable: true,
          retryAfter: Math.pow(2, retryCount),
          retryCount: retryCount + 1,
          maxRetries
        }
      );
      return next(retryError);
    }
  }

  // If max retries exceeded or error is not recoverable
  next(error);
};

/**
 * Health Check Error Handler
 */
const healthCheckErrorHandler = (req, res, next) => {
  if (req.path === '/health' || req.path === '/status') {
    try {
      // Basic health check logic
      const healthStatus = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        errors: globalErrorHandler.getStatistics()
      };
      
      res.json(healthStatus);
    } catch (error) {
      const healthError = new AppError(
        'Health check failed',
        503,
        'HEALTH_CHECK_FAILED'
      );
      next(healthError);
    }
  } else {
    next();
  }
};

module.exports = {
  globalErrorMiddleware,
  notFoundHandler,
  asyncHandler,
  validationErrorHandler,
  rateLimitHandler,
  timeoutHandler,
  corsErrorHandler,
  dbErrorHandler,
  errorRecoveryMiddleware,
  healthCheckErrorHandler,
  generateRequestId
};