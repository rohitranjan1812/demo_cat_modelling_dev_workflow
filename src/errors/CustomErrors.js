/**
 * Custom Error Classes for CAT Modeling Application
 * Provides comprehensive error handling with proper inheritance and context
 */

/**
 * Base Application Error
 */
class AppError extends Error {
  constructor(message, statusCode = 500, code = null, details = null) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.timestamp = new Date().toISOString();
    this.isOperational = true;

    // Capture stack trace
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      details: this.details,
      timestamp: this.timestamp,
      ...(process.env.NODE_ENV === 'development' && { stack: this.stack })
    };
  }
}

/**
 * Validation Error - 400
 */
class ValidationError extends AppError {
  constructor(message = 'Validation failed', field = null, value = null, details = null) {
    super(message, 400, 'VALIDATION_ERROR', details);
    this.field = field;
    this.value = value;
  }
}

/**
 * Not Found Error - 404
 */
class NotFoundError extends AppError {
  constructor(resource = 'Resource', id = null) {
    const message = id ? `${resource} with ID '${id}' not found` : `${resource} not found`;
    super(message, 404, 'NOT_FOUND');
    this.resource = resource;
    this.id = id;
  }
}

/**
 * Unauthorized Error - 401
 */
class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

/**
 * Forbidden Error - 403
 */
class ForbiddenError extends AppError {
  constructor(message = 'Access denied', resource = null, action = null) {
    super(message, 403, 'FORBIDDEN');
    this.resource = resource;
    this.action = action;
  }
}

/**
 * Conflict Error - 409
 */
class ConflictError extends AppError {
  constructor(message = 'Resource conflict', field = null) {
    super(message, 409, 'CONFLICT');
    this.field = field;
  }
}

/**
 * Database Error - 500
 */
class DatabaseError extends AppError {
  constructor(message = 'Database operation failed', operation = null, details = null) {
    super(message, 500, 'DATABASE_ERROR', details);
    this.operation = operation;
  }
}

/**
 * Transaction Error - 500
 */
class TransactionError extends AppError {
  constructor(message = 'Transaction failed', transactionId = null, details = null) {
    super(message, 500, 'TRANSACTION_ERROR', details);
    this.transactionId = transactionId;
  }
}

/**
 * External Service Error - 502
 */
class ExternalServiceError extends AppError {
  constructor(service, message = 'External service unavailable', details = null) {
    super(message, 502, 'EXTERNAL_SERVICE_ERROR', details);
    this.service = service;
  }
}

/**
 * Rate Limit Error - 429
 */
class RateLimitError extends AppError {
  constructor(message = 'Rate limit exceeded', retryAfter = null) {
    super(message, 429, 'RATE_LIMIT_EXCEEDED');
    this.retryAfter = retryAfter;
  }
}

/**
 * Business Logic Error - 422
 */
class BusinessLogicError extends AppError {
  constructor(message, rule = null, context = null) {
    super(message, 422, 'BUSINESS_LOGIC_ERROR');
    this.rule = rule;
    this.context = context;
  }
}

/**
 * Configuration Error - 500
 */
class ConfigurationError extends AppError {
  constructor(message = 'Configuration error', component = null) {
    super(message, 500, 'CONFIGURATION_ERROR');
    this.component = component;
  }
}

/**
 * Timeout Error - 408
 */
class TimeoutError extends AppError {
  constructor(message = 'Operation timed out', operation = null, timeout = null) {
    super(message, 408, 'TIMEOUT_ERROR');
    this.operation = operation;
    this.timeout = timeout;
  }
}

/**
 * Model Validation Error - 422
 */
class ModelValidationError extends AppError {
  constructor(model, validationErrors = []) {
    const message = `${model} validation failed`;
    super(message, 422, 'MODEL_VALIDATION_ERROR', validationErrors);
    this.model = model;
    this.validationErrors = validationErrors;
  }
}

/**
 * Simulation Error - 500
 */
class SimulationError extends AppError {
  constructor(message = 'Simulation failed', simulationId = null, stage = null, details = null) {
    super(message, 500, 'SIMULATION_ERROR', details);
    this.simulationId = simulationId;
    this.stage = stage;
  }
}

/**
 * File Processing Error - 500
 */
class FileProcessingError extends AppError {
  constructor(message = 'File processing failed', fileName = null, operation = null) {
    super(message, 500, 'FILE_PROCESSING_ERROR');
    this.fileName = fileName;
    this.operation = operation;
  }
}

/**
 * Network Error - 503
 */
class NetworkError extends AppError {
  constructor(message = 'Network error', url = null, method = null) {
    super(message, 503, 'NETWORK_ERROR');
    this.url = url;
    this.method = method;
  }
}

module.exports = {
  AppError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  DatabaseError,
  TransactionError,
  ExternalServiceError,
  RateLimitError,
  BusinessLogicError,
  ConfigurationError,
  TimeoutError,
  ModelValidationError,
  SimulationError,
  FileProcessingError,
  NetworkError
};