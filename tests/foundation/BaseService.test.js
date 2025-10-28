const BaseService = require('../../src/services/BaseService');

/**
 * Test suite for BaseService - Foundation Layer
 * Tests the foundational patterns used by all services
 * Priority: P0 (Foundation)
 */
describe('BaseService - Foundation Tests', () => {
  let baseService;

  beforeEach(() => {
    baseService = new BaseService();
  });

  describe('Constructor', () => {
    test('should initialize with default configuration', () => {
      expect(baseService).toBeInstanceOf(BaseService);
      expect(baseService.options).toBeDefined();
    });

    test('should accept custom configuration', () => {
      const customOptions = { debug: true, timeout: 5000 };
      const service = new BaseService(customOptions);
      expect(service.options).toMatchObject(customOptions);
    });
  });

  describe('CRUD Operations Foundation', () => {
    describe('validateId()', () => {
      test('should validate MongoDB ObjectId format', () => {
        const validId = '507f1f77bcf86cd799439011';
        expect(() => baseService.validateId(validId)).not.toThrow();
      });

      test('should reject invalid ObjectId formats', () => {
        const invalidIds = [
          null,
          undefined,
          '',
          'invalid',
          '123',
          'too-short',
          'way-too-long-to-be-a-valid-objectid'
        ];

        invalidIds.forEach(id => {
          expect(() => baseService.validateId(id)).toThrow('Invalid ID format');
        });
      });

      test('should handle custom ID validation', () => {
        const customValidator = (id) => id && id.startsWith('CUSTOM_');
        baseService.setIdValidator(customValidator);
        
        expect(() => baseService.validateId('CUSTOM_123')).not.toThrow();
        expect(() => baseService.validateId('INVALID_123')).toThrow();
      });
    });

    describe('validateData()', () => {
      test('should validate data against schema', () => {
        const schema = {
          name: { type: 'string', required: true },
          age: { type: 'number', min: 0, max: 150 }
        };
        
        const validData = { name: 'John Doe', age: 30 };
        expect(() => baseService.validateData(validData, schema)).not.toThrow();
      });

      test('should reject invalid data', () => {
        const schema = {
          name: { type: 'string', required: true },
          age: { type: 'number', min: 0, max: 150 }
        };
        
        const invalidData = { age: 30 }; // Missing required name
        expect(() => baseService.validateData(invalidData, schema)).toThrow('Validation failed');
      });

      test('should handle nested schema validation', () => {
        const schema = {
          user: {
            type: 'object',
            properties: {
              name: { type: 'string', required: true },
              email: { type: 'string', format: 'email' }
            }
          }
        };
        
        const validData = {
          user: {
            name: 'John Doe',
            email: 'john@example.com'
          }
        };
        
        expect(() => baseService.validateData(validData, schema)).not.toThrow();
      });
    });

    describe('sanitizeData()', () => {
      test('should sanitize input data', () => {
        const input = {
          name: '  John Doe  ',
          email: 'JOHN@EXAMPLE.COM',
          description: '<script>alert("xss")</script>Safe content'
        };
        
        const sanitized = baseService.sanitizeData(input);
        
        expect(sanitized.name).toBe('John Doe'); // Trimmed
        expect(sanitized.email).toBe('john@example.com'); // Lowercase
        expect(sanitized.description).not.toContain('<script>'); // XSS removed
      });

      test('should handle deep object sanitization', () => {
        const input = {
          user: {
            profile: {
              name: '  Test User  ',
              bio: '<b>Safe HTML</b><script>evil</script>'
            }
          }
        };
        
        const sanitized = baseService.sanitizeData(input);
        
        expect(sanitized.user.profile.name).toBe('Test User');
        expect(sanitized.user.profile.bio).toContain('<b>Safe HTML</b>');
        expect(sanitized.user.profile.bio).not.toContain('<script>');
      });

      test('should preserve null and undefined values appropriately', () => {
        const input = {
          name: 'Test',
          optionalField: null,
          undefinedField: undefined
        };
        
        const sanitized = baseService.sanitizeData(input);
        
        expect(sanitized.name).toBe('Test');
        expect(sanitized.optionalField).toBeNull();
        expect('undefinedField' in sanitized).toBe(false);
      });
    });

    describe('buildQuery()', () => {
      test('should build basic query from parameters', () => {
        const params = {
          name: 'John',
          age: 30,
          status: 'active'
        };
        
        const query = baseService.buildQuery(params);
        
        expect(query).toEqual({
          name: 'John',
          age: 30,
          status: 'active'
        });
      });

      test('should handle range queries', () => {
        const params = {
          minAge: 18,
          maxAge: 65,
          minSalary: 30000
        };
        
        const query = baseService.buildQuery(params);
        
        expect(query.age).toEqual({ $gte: 18, $lte: 65 });
        expect(query.salary).toEqual({ $gte: 30000 });
      });

      test('should handle array queries', () => {
        const params = {
          tags: ['javascript', 'node.js'],
          categories: 'development,testing'
        };
        
        const query = baseService.buildQuery(params);
        
        expect(query.tags).toEqual({ $in: ['javascript', 'node.js'] });
        expect(query.categories).toEqual({ $in: ['development', 'testing'] });
      });

      test('should handle text search queries', () => {
        const params = {
          search: 'javascript developer',
          title: 'senior'
        };
        
        const query = baseService.buildQuery(params);
        
        expect(query.$text).toEqual({ $search: 'javascript developer' });
        expect(query.title).toEqual({ $regex: 'senior', $options: 'i' });
      });

      test('should ignore invalid query parameters', () => {
        const params = {
          validParam: 'value',
          _internal: 'should be ignored',
          $operator: 'should be ignored',
          '': 'empty key should be ignored',
          nullValue: null,
          undefinedValue: undefined
        };
        
        const query = baseService.buildQuery(params);
        
        expect(query).toEqual({ validParam: 'value' });
      });
    });

    describe('buildPagination()', () => {
      test('should build pagination with default values', () => {
        const pagination = baseService.buildPagination({});
        
        expect(pagination).toEqual({
          skip: 0,
          limit: 10,
          page: 1,
          sort: { _id: 1 }
        });
      });

      test('should handle custom pagination parameters', () => {
        const params = {
          page: 3,
          limit: 25,
          sortBy: 'name',
          sortOrder: 'desc'
        };
        
        const pagination = baseService.buildPagination(params);
        
        expect(pagination).toEqual({
          skip: 50, // (3-1) * 25
          limit: 25,
          page: 3,
          sort: { name: -1 }
        });
      });

      test('should enforce pagination limits', () => {
        const params = {
          page: -1,
          limit: 1000,
          sortOrder: 'invalid'
        };
        
        const pagination = baseService.buildPagination(params);
        
        expect(pagination.page).toBe(1); // Minimum page
        expect(pagination.limit).toBe(100); // Maximum limit
        expect(pagination.sort).toEqual({ _id: 1 }); // Default sort
      });

      test('should handle multiple sort fields', () => {
        const params = {
          sortBy: 'priority,createdAt',
          sortOrder: 'desc,asc'
        };
        
        const pagination = baseService.buildPagination(params);
        
        expect(pagination.sort).toEqual({
          priority: -1,
          createdAt: 1
        });
      });
    });
  });

  describe('Error Handling Foundation', () => {
    describe('createError()', () => {
      test('should create standardized error objects', () => {
        const error = baseService.createError('VALIDATION_ERROR', 'Invalid input data', { field: 'email' });
        
        expect(error).toBeInstanceOf(Error);
        expect(error.code).toBe('VALIDATION_ERROR');
        expect(error.message).toBe('Invalid input data');
        expect(error.details).toEqual({ field: 'email' });
        expect(error.timestamp).toBeDefined();
      });

      test('should create different error types', () => {
        const validationError = baseService.createError('VALIDATION_ERROR', 'Validation failed');
        const notFoundError = baseService.createError('NOT_FOUND', 'Resource not found');
        const permissionError = baseService.createError('PERMISSION_DENIED', 'Access denied');
        
        expect(validationError.code).toBe('VALIDATION_ERROR');
        expect(notFoundError.code).toBe('NOT_FOUND');
        expect(permissionError.code).toBe('PERMISSION_DENIED');
      });

      test('should include stack trace in development mode', () => {
        const originalEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = 'development';
        
        const error = baseService.createError('TEST_ERROR', 'Test error');
        
        expect(error.stack).toBeDefined();
        
        process.env.NODE_ENV = originalEnv;
      });
    });

    describe('handleError()', () => {
      test('should handle known error types', () => {
        const validationError = baseService.createError('VALIDATION_ERROR', 'Invalid data');
        const handled = baseService.handleError(validationError);
        
        expect(handled.success).toBe(false);
        expect(handled.error.code).toBe('VALIDATION_ERROR');
        expect(handled.error.message).toBe('Invalid data');
        expect(handled.statusCode).toBe(400);
      });

      test('should handle unknown errors', () => {
        const unknownError = new Error('Unknown error');
        const handled = baseService.handleError(unknownError);
        
        expect(handled.success).toBe(false);
        expect(handled.error.code).toBe('INTERNAL_ERROR');
        expect(handled.statusCode).toBe(500);
      });

      test('should log errors in production mode', () => {
        const originalEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = 'production';
        
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
        
        const error = new Error('Test error');
        baseService.handleError(error);
        
        expect(consoleSpy).toHaveBeenCalled();
        
        consoleSpy.mockRestore();
        process.env.NODE_ENV = originalEnv;
      });
    });

    describe('wrapAsync()', () => {
      test('should wrap async functions for error handling', async () => {
        const asyncFunc = async (data) => {
          if (!data) throw new Error('Data required');
          return { success: true, data };
        };
        
        const wrapped = baseService.wrapAsync(asyncFunc);
        
        const successResult = await wrapped('test data');
        expect(successResult.success).toBe(true);
        expect(successResult.data).toBe('test data');
        
        const errorResult = await wrapped(null);
        expect(errorResult.success).toBe(false);
        expect(errorResult.error).toBeDefined();
      });

      test('should preserve async function context', async () => {
        const contextData = { value: 42 };
        const asyncFunc = async function(multiplier) {
          return this.value * multiplier;
        };
        
        const wrapped = baseService.wrapAsync(asyncFunc.bind(contextData));
        const result = await wrapped(2);
        
        expect(result.success).toBe(true);
        expect(result.data).toBe(84);
      });
    });
  });

  describe('Utility Methods', () => {
    describe('formatResponse()', () => {
      test('should format success responses', () => {
        const data = { id: 1, name: 'Test' };
        const response = baseService.formatResponse(data, { total: 10, page: 1 });
        
        expect(response).toEqual({
          success: true,
          data: { id: 1, name: 'Test' },
          pagination: { total: 10, page: 1 },
          timestamp: expect.any(String)
        });
      });

      test('should format error responses', () => {
        const error = baseService.createError('NOT_FOUND', 'Resource not found');
        const response = baseService.formatResponse(null, null, error);
        
        expect(response).toEqual({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Resource not found'
          },
          timestamp: expect.any(String)
        });
      });

      test('should handle array data with automatic pagination info', () => {
        const data = [1, 2, 3, 4, 5];
        const response = baseService.formatResponse(data);
        
        expect(response.success).toBe(true);
        expect(response.data).toEqual(data);
        expect(response.pagination.total).toBe(5);
      });
    });

    describe('deepClone()', () => {
      test('should create deep clone of objects', () => {
        const original = {
          name: 'Test',
          nested: {
            value: 42,
            array: [1, 2, { deep: true }]
          }
        };
        
        const cloned = baseService.deepClone(original);
        
        // Modify original
        original.nested.value = 100;
        original.nested.array[2].deep = false;
        
        // Clone should be unchanged
        expect(cloned.nested.value).toBe(42);
        expect(cloned.nested.array[2].deep).toBe(true);
      });

      test('should handle null and undefined values', () => {
        expect(baseService.deepClone(null)).toBeNull();
        expect(baseService.deepClone(undefined)).toBeUndefined();
      });

      test('should handle primitive values', () => {
        expect(baseService.deepClone('string')).toBe('string');
        expect(baseService.deepClone(42)).toBe(42);
        expect(baseService.deepClone(true)).toBe(true);
      });

      test('should handle Date objects', () => {
        const date = new Date('2023-01-01');
        const cloned = baseService.deepClone(date);
        
        expect(cloned).toBeInstanceOf(Date);
        expect(cloned.getTime()).toBe(date.getTime());
        expect(cloned).not.toBe(date); // Different instances
      });
    });

    describe('mergeOptions()', () => {
      test('should merge options with defaults', () => {
        const defaults = {
          timeout: 5000,
          retries: 3,
          debug: false,
          nested: { option1: true, option2: false }
        };
        
        const custom = {
          timeout: 10000,
          debug: true,
          nested: { option1: false }
        };
        
        const merged = baseService.mergeOptions(defaults, custom);
        
        expect(merged).toEqual({
          timeout: 10000,
          retries: 3,
          debug: true,
          nested: { option1: false, option2: false }
        });
      });

      test('should handle null and undefined options', () => {
        const defaults = { option: 'default' };
        
        expect(baseService.mergeOptions(defaults, null)).toEqual(defaults);
        expect(baseService.mergeOptions(defaults, undefined)).toEqual(defaults);
      });
    });

    describe('generateId()', () => {
      test('should generate unique IDs', () => {
        const id1 = baseService.generateId();
        const id2 = baseService.generateId();
        
        expect(typeof id1).toBe('string');
        expect(typeof id2).toBe('string');
        expect(id1).not.toBe(id2);
        expect(id1.length).toBeGreaterThan(0);
      });

      test('should generate IDs with custom prefix', () => {
        const id = baseService.generateId('TEST');
        expect(id).toMatch(/^TEST/);
      });

      test('should generate IDs with custom length', () => {
        const id = baseService.generateId('', 20);
        expect(id.length).toBe(20);
      });
    });

    describe('parseFilters()', () => {
      test('should parse filter strings', () => {
        const filterString = 'status:active,type:user,age:>18';
        const filters = baseService.parseFilters(filterString);
        
        expect(filters).toEqual({
          status: 'active',
          type: 'user',
          age: { $gt: 18 }
        });
      });

      test('should handle complex filter operators', () => {
        const filterString = 'price:>=100,rating:<=4.5,category:in:electronics,books';
        const filters = baseService.parseFilters(filterString);
        
        expect(filters).toEqual({
          price: { $gte: 100 },
          rating: { $lte: 4.5 },
          category: { $in: ['electronics', 'books'] }
        });
      });

      test('should handle invalid filter strings gracefully', () => {
        const invalidFilters = [
          'invalid-format',
          'field:',
          ':value',
          '',
          null,
          undefined
        ];
        
        invalidFilters.forEach(filter => {
          const result = baseService.parseFilters(filter);
          expect(typeof result).toBe('object');
        });
      });
    });
  });

  describe('Logging and Monitoring', () => {
    describe('log()', () => {
      test('should log messages with different levels', () => {
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
        
        baseService.log('info', 'Test message', { extra: 'data' });
        
        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining('INFO'),
          expect.stringContaining('Test message'),
          expect.objectContaining({ extra: 'data' })
        );
        
        consoleSpy.mockRestore();
      });

      test('should respect log level configuration', () => {
        const service = new BaseService({ logLevel: 'error' });
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
        
        service.log('info', 'This should not be logged');
        service.log('error', 'This should be logged');
        
        expect(consoleSpy).toHaveBeenCalledTimes(1);
        
        consoleSpy.mockRestore();
      });
    });

    describe('startTimer() / endTimer()', () => {
      test('should measure execution time', async () => {
        baseService.startTimer('test-operation');
        
        await new Promise(resolve => setTimeout(resolve, 10));
        
        const duration = baseService.endTimer('test-operation');
        
        expect(duration).toBeGreaterThan(0);
        expect(duration).toBeLessThan(100);
      });

      test('should handle multiple timers', () => {
        baseService.startTimer('timer1');
        baseService.startTimer('timer2');
        
        const duration1 = baseService.endTimer('timer1');
        const duration2 = baseService.endTimer('timer2');
        
        expect(typeof duration1).toBe('number');
        expect(typeof duration2).toBe('number');
      });
    });

    describe('collectMetrics()', () => {
      test('should collect service metrics', () => {
        baseService.startTimer('operation1');
        baseService.endTimer('operation1');
        
        baseService.startTimer('operation2');
        baseService.endTimer('operation2');
        
        const metrics = baseService.collectMetrics();
        
        expect(metrics).toHaveProperty('operationCounts');
        expect(metrics).toHaveProperty('averageResponseTimes');
        expect(metrics).toHaveProperty('totalOperations');
        expect(metrics.operationCounts.operation1).toBe(1);
        expect(metrics.operationCounts.operation2).toBe(1);
      });
    });
  });

  describe('Integration Patterns', () => {
    describe('Service Inheritance', () => {
      class TestService extends BaseService {
        constructor(options) {
          super(options);
          this.serviceName = 'TestService';
        }
        
        async testMethod(data) {
          this.validateData(data, { name: { type: 'string', required: true } });
          return this.formatResponse({ processed: data.name.toUpperCase() });
        }
      }
      
      test('should properly extend base service', async () => {
        const testService = new TestService();
        
        expect(testService).toBeInstanceOf(BaseService);
        expect(testService.serviceName).toBe('TestService');
        
        const result = await testService.testMethod({ name: 'test' });
        
        expect(result.success).toBe(true);
        expect(result.data.processed).toBe('TEST');
      });
    });

    describe('Middleware Integration', () => {
      test('should support middleware chain', async () => {
        const middleware1 = jest.fn((data, next) => {
          data.middleware1 = true;
          return next(data);
        });
        
        const middleware2 = jest.fn((data, next) => {
          data.middleware2 = true;
          return next(data);
        });
        
        baseService.use(middleware1);
        baseService.use(middleware2);
        
        const result = await baseService.executeWithMiddleware({ test: true });
        
        expect(middleware1).toHaveBeenCalled();
        expect(middleware2).toHaveBeenCalled();
        expect(result.middleware1).toBe(true);
        expect(result.middleware2).toBe(true);
      });
    });
  });

  describe('Performance Tests', () => {
    test('should handle large datasets efficiently', () => {
      const largeData = Array.from({ length: 10000 }, (_, i) => ({ id: i, name: `Item ${i}` }));
      
      const startTime = Date.now();
      const cloned = baseService.deepClone(largeData);
      const endTime = Date.now();
      
      expect(cloned).toHaveLength(10000);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete in less than 1 second
    });

    test('should efficiently build complex queries', () => {
      const complexParams = {
        name: 'test',
        minAge: 18,
        maxAge: 65,
        tags: ['tag1', 'tag2', 'tag3', 'tag4', 'tag5'],
        categories: 'cat1,cat2,cat3,cat4,cat5',
        search: 'complex search query with multiple terms',
        status: 'active',
        type: 'premium',
        region: 'north-america'
      };
      
      const startTime = Date.now();
      for (let i = 0; i < 1000; i++) {
        baseService.buildQuery(complexParams);
      }
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeLessThan(100); // Should complete in less than 100ms
    });
  });
});