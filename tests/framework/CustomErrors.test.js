/**
 * Custom Error Classes Tests
 * Tests for the comprehensive error handling system
 */

const {
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
} = require('../../src/errors/CustomErrors');

describe('Custom Error Classes', () => {
  describe('AppError Base Class', () => {
    test('should create basic app error with defaults', () => {
      const error = new AppError('Test error');
      
      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe('AppError');
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(500);
      expect(error.code).toBe(null);
      expect(error.details).toBe(null);
      expect(error.isOperational).toBe(true);
      expect(error.timestamp).toBeDefined();
    });

    test('should create app error with all parameters', () => {
      const details = { userId: 123, action: 'create' };
      const error = new AppError('Custom error', 422, 'CUSTOM_ERROR', details);
      
      expect(error.message).toBe('Custom error');
      expect(error.statusCode).toBe(422);
      expect(error.code).toBe('CUSTOM_ERROR');
      expect(error.details).toEqual(details);
    });

    test('should serialize to JSON correctly', () => {
      const error = new AppError('Test error', 400, 'TEST_ERROR', { field: 'email' });
      const json = error.toJSON();
      
      expect(json.name).toBe('AppError');
      expect(json.message).toBe('Test error');
      expect(json.code).toBe('TEST_ERROR');
      expect(json.statusCode).toBe(400);
      expect(json.details).toEqual({ field: 'email' });
      expect(json.timestamp).toBeDefined();
    });

    test('should include stack trace in development mode', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      const error = new AppError('Test error');
      const json = error.toJSON();
      
      expect(json.stack).toBeDefined();
      
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Specific Error Types', () => {
    test('ValidationError should set correct properties', () => {
      const error = new ValidationError('Invalid email', 'email', 'invalid@', { rule: 'email' });
      
      expect(error.name).toBe('ValidationError');
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.field).toBe('email');
      expect(error.value).toBe('invalid@');
      expect(error.details).toEqual({ rule: 'email' });
    });

    test('NotFoundError should create descriptive message', () => {
      const error = new NotFoundError('User', 'user123');
      
      expect(error.name).toBe('NotFoundError');
      expect(error.message).toBe("User with ID 'user123' not found");
      expect(error.statusCode).toBe(404);
      expect(error.code).toBe('NOT_FOUND');
      expect(error.resource).toBe('User');
      expect(error.id).toBe('user123');
    });

    test('UnauthorizedError should have correct status code', () => {
      const error = new UnauthorizedError('Please log in');
      
      expect(error.name).toBe('UnauthorizedError');
      expect(error.statusCode).toBe(401);
      expect(error.code).toBe('UNAUTHORIZED');
    });

    test('ForbiddenError should track resource and action', () => {
      const error = new ForbiddenError('Cannot delete user', 'User', 'delete');
      
      expect(error.name).toBe('ForbiddenError');
      expect(error.statusCode).toBe(403);
      expect(error.resource).toBe('User');
      expect(error.action).toBe('delete');
    });

    test('ConflictError should track conflicting field', () => {
      const error = new ConflictError('Email already exists', 'email');
      
      expect(error.name).toBe('ConflictError');
      expect(error.statusCode).toBe(409);
      expect(error.field).toBe('email');
    });

    test('DatabaseError should track operation', () => {
      const error = new DatabaseError('Connection failed', 'connect', { host: 'localhost' });
      
      expect(error.name).toBe('DatabaseError');
      expect(error.statusCode).toBe(500);
      expect(error.operation).toBe('connect');
      expect(error.details).toEqual({ host: 'localhost' });
    });

    test('TransactionError should track transaction ID', () => {
      const error = new TransactionError('Transaction failed', 'txn123', { reason: 'conflict' });
      
      expect(error.name).toBe('TransactionError');
      expect(error.transactionId).toBe('txn123');
      expect(error.details).toEqual({ reason: 'conflict' });
    });

    test('BusinessLogicError should track rule and context', () => {
      const error = new BusinessLogicError('Age restriction', 'minimum_age', { age: 16, minimum: 18 });
      
      expect(error.name).toBe('BusinessLogicError');
      expect(error.statusCode).toBe(422);
      expect(error.rule).toBe('minimum_age');
      expect(error.context).toEqual({ age: 16, minimum: 18 });
    });

    test('SimulationError should track simulation details', () => {
      const error = new SimulationError('Calculation failed', 'sim123', 'hazard_analysis', { step: 5 });
      
      expect(error.name).toBe('SimulationError');
      expect(error.simulationId).toBe('sim123');
      expect(error.stage).toBe('hazard_analysis');
      expect(error.details).toEqual({ step: 5 });
    });

    test('TimeoutError should track operation and timeout', () => {
      const error = new TimeoutError('Request timed out', 'api_call', 30000);
      
      expect(error.name).toBe('TimeoutError');
      expect(error.statusCode).toBe(408);
      expect(error.operation).toBe('api_call');
      expect(error.timeout).toBe(30000);
    });

    test('ModelValidationError should track model and validation errors', () => {
      const validationErrors = [
        { field: 'name', message: 'Required' },
        { field: 'email', message: 'Invalid format' }
      ];
      const error = new ModelValidationError('User', validationErrors);
      
      expect(error.name).toBe('ModelValidationError');
      expect(error.statusCode).toBe(422);
      expect(error.model).toBe('User');
      expect(error.validationErrors).toEqual(validationErrors);
      expect(error.details).toEqual(validationErrors);
    });
  });

  describe('Error Inheritance', () => {
    test('all custom errors should inherit from AppError', () => {
      const errors = [
        new ValidationError(),
        new NotFoundError(),
        new DatabaseError(),
        new TransactionError(),
        new SimulationError()
      ];

      errors.forEach(error => {
        expect(error).toBeInstanceOf(AppError);
        expect(error).toBeInstanceOf(Error);
        expect(error.isOperational).toBe(true);
        expect(error.timestamp).toBeDefined();
      });
    });

    test('should maintain error stack traces', () => {
      const error = new ValidationError('Test validation error');
      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('ValidationError');
    });
  });

  describe('Error Code Constants', () => {
    test('should have consistent error codes', () => {
      expect(new ValidationError().code).toBe('VALIDATION_ERROR');
      expect(new NotFoundError().code).toBe('NOT_FOUND');
      expect(new UnauthorizedError().code).toBe('UNAUTHORIZED');
      expect(new ForbiddenError().code).toBe('FORBIDDEN');
      expect(new ConflictError().code).toBe('CONFLICT');
      expect(new DatabaseError().code).toBe('DATABASE_ERROR');
      expect(new TransactionError().code).toBe('TRANSACTION_ERROR');
      expect(new BusinessLogicError().code).toBe('BUSINESS_LOGIC_ERROR');
    });
  });
});