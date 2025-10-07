/**
 * Standardized Error Handler Middleware
 * Ensures consistent error response format across all endpoints
 */

/**
 * Standard error response format
 * @param {Error} error - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
function errorHandler(error, req, res, next) {
  // If response already sent, delegate to default Express error handler
  if (res.headersSent) {
    return next(error);
  }

  // Default error status and message
  let statusCode = error.statusCode || error.status || 500;
  let message = error.message || 'Internal Server Error';
  
  // Handle specific error types
  if (error.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
  } else if (error.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
  } else if (error.code === 11000) {
    statusCode = 409;
    message = 'Duplicate entry';
  } else if (error.name === 'UnauthorizedError') {
    statusCode = 401;
    message = 'Unauthorized';
  } else if (error.name === 'MongoError' || error.name === 'MongoServerError') {
    statusCode = 500;
    message = 'Database error';
  }

  // Log error for debugging (only in non-production)
  if (process.env.NODE_ENV !== 'production') {
    console.error('Error Handler:', {
      message: error.message,
      stack: error.stack,
      url: req.url,
      method: req.method,
      body: req.body,
      params: req.params,
      query: req.query
    });
  }

  // Create standardized error response
  const errorResponse = {
    success: false,
    message,
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV !== 'production' && {
      error: {
        name: error.name,
        stack: error.stack
      }
    })
  };

  // Add validation details if available
  if (error.name === 'ValidationError' && error.errors) {
    errorResponse.details = Object.values(error.errors).map(err => ({
      field: err.path,
      message: err.message,
      value: err.value
    }));
  }

  // Add request context in development
  if (process.env.NODE_ENV !== 'production') {
    errorResponse.context = {
      url: req.url,
      method: req.method,
      userAgent: req.get('User-Agent')
    };
  }

  res.status(statusCode).json(errorResponse);
}

/**
 * 404 Not Found handler
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
    timestamp: new Date().toISOString()
  });
}

/**
 * Success response helper
 * @param {Object} res - Express response object
 * @param {*} data - Response data
 * @param {string} message - Success message
 * @param {Object} meta - Additional metadata
 * @param {number} statusCode - HTTP status code
 */
function sendSuccess(res, data, message = 'Operation successful', meta = {}, statusCode = 200) {
  res.status(statusCode).json({
    success: true,
    message,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      ...meta
    }
  });
}

/**
 * Paginated response helper
 * @param {Object} res - Express response object
 * @param {Array} data - Response data array
 * @param {Object} pagination - Pagination info
 * @param {string} message - Success message
 */
function sendPaginatedSuccess(res, data, pagination, message = 'Data retrieved successfully') {
  res.json({
    success: true,
    message,
    data,
    pagination: {
      ...pagination,
      timestamp: new Date().toISOString()
    }
  });
}

/**
 * Async error wrapper to catch async function errors
 * @param {Function} fn - Async function to wrap
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = {
  errorHandler,
  notFoundHandler,
  sendSuccess,
  sendPaginatedSuccess,
  asyncHandler
};