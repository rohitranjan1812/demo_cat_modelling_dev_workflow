/**
 * Error Handler Utility
 * Centralized error handling with logging, recovery, and response formatting
 */

const { 
  AppError, 
  ValidationError, 
  NotFoundError, 
  DatabaseError, 
  TransactionError,
  SimulationError,
  ModelValidationError 
} = require('../errors/CustomErrors');

/**
 * Error Handler Class
 */
class ErrorHandler {
  constructor() {
    this.errorCounts = new Map();
    this.errorPatterns = new Map();
  }

  /**
   * Handle and classify errors
   * @param {Error} error - The error to handle
   * @param {Object} context - Additional context
   * @returns {Object} Processed error response
   */
  handle(error, context = {}) {
    try {
      // Track error for monitoring
      this.trackError(error, context);

      // If it's already an operational error, return it
      if (error.isOperational) {
        return this.formatErrorResponse(error, context);
      }

      // Transform known error types
      const transformedError = this.transformError(error, context);
      return this.formatErrorResponse(transformedError, context);

    } catch (handlerError) {
      console.error('Error in ErrorHandler:', handlerError);
      return this.formatErrorResponse(
        new AppError('Internal server error', 500, 'HANDLER_ERROR'),
        context
      );
    }
  }

  /**
   * Transform native errors to custom errors
   * @param {Error} error - Native error
   * @param {Object} context - Error context
   * @returns {AppError} Transformed error
   */
  transformError(error, context) {
    const { modelName, operation, transactionId, field } = context;

    // Mongoose Validation Error
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors || {}).map(err => ({
        field: err.path,
        message: err.message,
        value: err.value,
        kind: err.kind
      }));
      
      return new ModelValidationError(
        modelName || 'Document',
        validationErrors
      );
    }

    // Mongoose CastError
    if (error.name === 'CastError') {
      return new ValidationError(
        `Invalid ${error.path}: ${error.value}`,
        error.path,
        error.value
      );
    }

    // MongoDB Duplicate Key Error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0];
      return new ConflictError(
        `Duplicate value for field: ${field}`,
        field
      );
    }

    // MongoDB Connection Errors
    if (error.name === 'MongoNetworkError' || 
        error.name === 'MongoTimeoutError' ||
        error.name === 'MongoServerSelectionError') {
      return new DatabaseError(
        'Database connection failed',
        operation,
        { originalError: error.message }
      );
    }

    // Transaction Errors
    if (error.message && error.message.includes('transaction')) {
      return new TransactionError(
        error.message,
        transactionId,
        { originalError: error.message }
      );
    }

    // Simulation specific errors
    if (context.isSimulation) {
      return new SimulationError(
        error.message,
        context.simulationId,
        context.stage,
        { originalError: error.message }
      );
    }

    // Default to generic error
    return new AppError(
      error.message || 'An unexpected error occurred',
      500,
      'UNKNOWN_ERROR',
      { originalError: error.message, stack: error.stack }
    );
  }

  /**
   * Format error response
   * @param {AppError} error - Processed error
   * @param {Object} context - Additional context
   * @returns {Object} Formatted response
   */
  formatErrorResponse(error, context = {}) {
    const response = {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        statusCode: error.statusCode,
        timestamp: error.timestamp
      }
    };

    // Add error-specific fields
    if (error instanceof ValidationError && error.field) {
      response.error.field = error.field;
      response.error.value = error.value;
    }

    if (error instanceof NotFoundError) {
      response.error.resource = error.resource;
      response.error.id = error.id;
    }

    if (error instanceof ModelValidationError) {
      response.error.model = error.model;
      response.error.validationErrors = error.validationErrors;
    }

    if (error instanceof TransactionError) {
      response.error.transactionId = error.transactionId;
    }

    if (error instanceof SimulationError) {
      response.error.simulationId = error.simulationId;
      response.error.stage = error.stage;
    }

    // Add details if available
    if (error.details) {
      response.error.details = error.details;
    }

    // Add stack trace in development
    if (process.env.NODE_ENV === 'development' && error.stack) {
      response.error.stack = error.stack;
    }

    // Add context information
    if (context.requestId) {
      response.error.requestId = context.requestId;
    }

    return response;
  }

  /**
   * Track error for monitoring and analytics
   * @param {Error} error - Error to track
   * @param {Object} context - Error context
   */
  trackError(error, context) {
    const errorKey = `${error.name}:${error.code || 'UNKNOWN'}`;
    
    // Count occurrences
    const count = this.errorCounts.get(errorKey) || 0;
    this.errorCounts.set(errorKey, count + 1);

    // Track patterns
    const pattern = {
      type: error.name,
      code: error.code,
      message: error.message,
      context: context.operation || context.modelName,
      timestamp: new Date().toISOString(),
      count: count + 1
    };

    this.errorPatterns.set(errorKey, pattern);

    // Log critical errors
    if (error.statusCode >= 500 || count > 10) {
      console.error(`[CRITICAL ERROR] ${errorKey}:`, {
        error: error.message,
        count: count + 1,
        context,
        stack: error.stack
      });
    }
  }

  /**
   * Check if error is retryable
   * @param {Error} error - Error to check
   * @returns {boolean} Whether error is retryable
   */
  isRetryable(error) {
    const retryableCodes = [
      'NETWORK_ERROR',
      'TIMEOUT_ERROR',
      'DATABASE_CONNECTION_ERROR',
      'EXTERNAL_SERVICE_ERROR'
    ];

    const retryableMessages = [
      'ECONNRESET',
      'ETIMEDOUT',
      'ENOTFOUND',
      'WriteConflict'
    ];

    if (error.code && retryableCodes.includes(error.code)) {
      return true;
    }

    if (error.message && retryableMessages.some(msg => 
      error.message.includes(msg))) {
      return true;
    }

    return false;
  }

  /**
   * Get error recovery suggestions
   * @param {Error} error - Error to analyze
   * @returns {Array} Recovery suggestions
   */
  getRecoverySuggestions(error) {
    const suggestions = [];

    if (error instanceof ValidationError) {
      suggestions.push('Check input data format and constraints');
      suggestions.push('Validate required fields are provided');
    }

    if (error instanceof NotFoundError) {
      suggestions.push('Verify the resource ID is correct');
      suggestions.push('Check if the resource has been deleted');
    }

    if (error instanceof DatabaseError) {
      suggestions.push('Check database connectivity');
      suggestions.push('Verify database credentials');
      suggestions.push('Check if database server is running');
    }

    if (error instanceof TransactionError) {
      suggestions.push('Retry the operation');
      suggestions.push('Check for conflicting transactions');
      suggestions.push('Verify transaction isolation level');
    }

    if (error.code === 'RATE_LIMIT_EXCEEDED') {
      suggestions.push('Reduce request frequency');
      suggestions.push('Implement exponential backoff');
    }

    return suggestions;
  }

  /**
   * Get error statistics
   * @returns {Object} Error statistics
   */
  getStatistics() {
    return {
      totalErrors: Array.from(this.errorCounts.values()).reduce((a, b) => a + b, 0),
      errorTypes: this.errorCounts.size,
      topErrors: Array.from(this.errorPatterns.entries())
        .sort(([,a], [,b]) => b.count - a.count)
        .slice(0, 10)
        .map(([key, pattern]) => ({ key, ...pattern })),
      patterns: Array.from(this.errorPatterns.values())
    };
  }

  /**
   * Clear error statistics
   */
  clearStatistics() {
    this.errorCounts.clear();
    this.errorPatterns.clear();
  }
}

// Global error handler instance
const globalErrorHandler = new ErrorHandler();

module.exports = {
  ErrorHandler,
  globalErrorHandler
};