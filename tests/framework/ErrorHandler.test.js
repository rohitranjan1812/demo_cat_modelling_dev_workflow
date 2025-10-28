/**
 * Error Handler Tests
 * Tests for the centralized error handling utility
 */

const { ErrorHandler, globalErrorHandler } = require('../../src/utils/ErrorHandler');
const { 
  AppError, 
  ValidationError, 
  NotFoundError, 
  DatabaseError, 
  TransactionError,
  ModelValidationError 
} = require('../../src/errors/CustomErrors');

describe('ErrorHandler', () => {
  let errorHandler;

  beforeEach(() => {
    errorHandler = new ErrorHandler();
  });

  afterEach(() => {
    errorHandler.clearStatistics();
  });

  describe('Error Transformation', () => {
    test('should handle operational errors without transformation', () => {
      const operationalError = new ValidationError('Test validation error', 'email');
      const result = errorHandler.handle(operationalError);

      expect(result.success).toBe(false);
      expect(result.error.code).toBe('VALIDATION_ERROR');
      expect(result.error.field).toBe('email');
    });

    test('should transform Mongoose ValidationError', () => {
      const mongooseError = {
        name: 'ValidationError',
        errors: {
          name: { path: 'name', message: 'Required', value: undefined, kind: 'required' },
          email: { path: 'email', message: 'Invalid email', value: 'invalid', kind: 'invalid' }
        }
      };

      const context = { modelName: 'User' };
      const result = errorHandler.handle(mongooseError, context);

      expect(result.success).toBe(false);
      expect(result.error.code).toBe('MODEL_VALIDATION_ERROR');
      expect(result.error.model).toBe('User');
      expect(result.error.validationErrors).toHaveLength(2);
    });

    test('should transform Mongoose CastError', () => {
      const castError = {
        name: 'CastError',
        path: 'userId',
        value: 'invalid-id',
        message: 'Cast to ObjectId failed'
      };

      const result = errorHandler.handle(castError);

      expect(result.success).toBe(false);
      expect(result.error.code).toBe('VALIDATION_ERROR');
      expect(result.error.field).toBe('userId');
      expect(result.error.value).toBe('invalid-id');
    });

    test('should transform MongoDB duplicate key error', () => {
      const duplicateError = {
        code: 11000,
        keyPattern: { email: 1 },
        message: 'E11000 duplicate key error'
      };

      const result = errorHandler.handle(duplicateError);

      expect(result.success).toBe(false);
      expect(result.error.code).toBe('CONFLICT');
      expect(result.error.field).toBe('email');
    });

    test('should transform MongoDB connection errors', () => {
      const connectionError = {
        name: 'MongoNetworkError',
        message: 'Connection failed'
      };

      const context = { operation: 'connect' };
      const result = errorHandler.handle(connectionError, context);

      expect(result.success).toBe(false);
      expect(result.error.code).toBe('DATABASE_ERROR');
      expect(result.error.details.originalError).toBe('Connection failed');
    });

    test('should handle transaction errors', () => {
      const transactionError = {
        message: 'Transaction failed due to write conflict'
      };

      const context = { transactionId: 'txn123' };
      const result = errorHandler.handle(transactionError, context);

      expect(result.success).toBe(false);
      expect(result.error.code).toBe('TRANSACTION_ERROR');
      expect(result.error.transactionId).toBe('txn123');
    });

    test('should handle simulation errors', () => {
      const simulationError = {
        message: 'Simulation calculation failed'
      };

      const context = { isSimulation: true, simulationId: 'sim123', stage: 'hazard' };
      const result = errorHandler.handle(simulationError, context);

      expect(result.success).toBe(false);
      expect(result.error.code).toBe('SIMULATION_ERROR');
      expect(result.error.simulationId).toBe('sim123');
      expect(result.error.stage).toBe('hazard');
    });
  });

  describe('Error Response Formatting', () => {
    test('should format basic error response', () => {
      const error = new AppError('Test error', 400, 'TEST_ERROR');
      const result = errorHandler.handle(error);

      expect(result).toMatchObject({
        success: false,
        error: {
          code: 'TEST_ERROR',
          message: 'Test error',
          statusCode: 400,
          timestamp: expect.any(String)
        }
      });
    });

    test('should include request context in response', () => {
      const error = new AppError('Test error');
      const context = { requestId: 'req123' };
      const result = errorHandler.handle(error, context);

      expect(result.error.requestId).toBe('req123');
    });

    test('should include stack trace in development', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      const error = new AppError('Test error');
      const result = errorHandler.handle(error);

      expect(result.error.stack).toBeDefined();
      
      process.env.NODE_ENV = originalEnv;
    });

    test('should not include stack trace in production', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      
      const error = new AppError('Test error');
      const result = errorHandler.handle(error);

      expect(result.error.stack).toBeUndefined();
      
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Error Tracking and Statistics', () => {
    test('should track error occurrences', () => {
      const error1 = new ValidationError('Validation failed');
      const error2 = new ValidationError('Another validation error');
      const error3 = new NotFoundError('User not found');

      errorHandler.handle(error1);
      errorHandler.handle(error2);
      errorHandler.handle(error3);

      const stats = errorHandler.getStatistics();
      expect(stats.totalErrors).toBe(3);
      expect(stats.errorTypes).toBe(2); // ValidationError and NotFoundError
    });

    test('should track error patterns', () => {
      const error = new ValidationError('Validation failed');
      errorHandler.handle(error);
      errorHandler.handle(error);

      const stats = errorHandler.getStatistics();
      const validationPattern = stats.topErrors.find(e => e.key.includes('ValidationError'));
      
      expect(validationPattern).toBeDefined();
      expect(validationPattern.count).toBe(2);
    });

    test('should clear statistics', () => {
      const error = new ValidationError('Test error');
      errorHandler.handle(error);

      let stats = errorHandler.getStatistics();
      expect(stats.totalErrors).toBe(1);

      errorHandler.clearStatistics();
      stats = errorHandler.getStatistics();
      expect(stats.totalErrors).toBe(0);
    });
  });

  describe('Retry Logic', () => {
    test('should identify retryable errors', () => {
      const retryableErrors = [
        { code: 'NETWORK_ERROR' },
        { code: 'TIMEOUT_ERROR' },
        { message: 'ECONNRESET' },
        { message: 'WriteConflict' }
      ];

      retryableErrors.forEach(error => {
        expect(errorHandler.isRetryable(error)).toBe(true);
      });
    });

    test('should identify non-retryable errors', () => {
      const nonRetryableErrors = [
        new ValidationError('Invalid input'),
        new NotFoundError('Resource not found'),
        new ForbiddenError('Access denied')
      ];

      nonRetryableErrors.forEach(error => {
        expect(errorHandler.isRetryable(error)).toBe(false);
      });
    });
  });

  describe('Recovery Suggestions', () => {
    test('should provide recovery suggestions for ValidationError', () => {
      const error = new ValidationError('Invalid email');
      const suggestions = errorHandler.getRecoverySuggestions(error);

      expect(suggestions).toContain('Check input data format and constraints');
      expect(suggestions).toContain('Validate required fields are provided');
    });

    test('should provide recovery suggestions for NotFoundError', () => {
      const error = new NotFoundError('User not found');
      const suggestions = errorHandler.getRecoverySuggestions(error);

      expect(suggestions).toContain('Verify the resource ID is correct');
      expect(suggestions).toContain('Check if the resource has been deleted');
    });

    test('should provide recovery suggestions for DatabaseError', () => {
      const error = new DatabaseError('Connection failed');
      const suggestions = errorHandler.getRecoverySuggestions(error);

      expect(suggestions).toContain('Check database connectivity');
      expect(suggestions).toContain('Verify database credentials');
    });

    test('should provide recovery suggestions for rate limiting', () => {
      const error = { code: 'RATE_LIMIT_EXCEEDED' };
      const suggestions = errorHandler.getRecoverySuggestions(error);

      expect(suggestions).toContain('Reduce request frequency');
      expect(suggestions).toContain('Implement exponential backoff');
    });
  });

  describe('Global Error Handler', () => {
    test('should use global error handler instance', () => {
      expect(globalErrorHandler).toBeInstanceOf(ErrorHandler);
    });

    test('should maintain state across calls', () => {
      const error = new ValidationError('Test error');
      globalErrorHandler.handle(error);

      const stats = globalErrorHandler.getStatistics();
      expect(stats.totalErrors).toBeGreaterThan(0);
    });
  });

  describe('Error Handler Edge Cases', () => {
    test('should handle errors during error handling', () => {
      // Simulate an error in the error handler itself
      const malformedError = { 
        toString: () => { throw new Error('toString failed'); }
      };

      const result = errorHandler.handle(malformedError);

      expect(result.success).toBe(false);
      expect(result.error.code).toBe('HANDLER_ERROR');
    });

    test('should handle null/undefined errors', () => {
      const result1 = errorHandler.handle(null);
      const result2 = errorHandler.handle(undefined);

      expect(result1.success).toBe(false);
      expect(result2.success).toBe(false);
    });

    test('should handle errors without message', () => {
      const error = { name: 'CustomError' };
      const result = errorHandler.handle(error);

      expect(result.success).toBe(false);
      expect(result.error.message).toContain('An unexpected error occurred');
    });
  });
});