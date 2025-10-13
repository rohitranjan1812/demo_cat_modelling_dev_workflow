/**
 * Validation Framework Tests
 * Tests for the comprehensive validation system
 */

const { ValidationFramework, globalValidator, customValidationRules } = require('../../src/utils/ValidationFramework');
const { ValidationError, BusinessLogicError } = require('../../src/errors/CustomErrors');
const Joi = require('joi');

describe('ValidationFramework', () => {
  let validator;

  beforeEach(() => {
    validator = new ValidationFramework();
  });

  afterEach(() => {
    validator.clear();
  });

  describe('Schema Validation', () => {
    test('should validate data against Joi schema successfully', () => {
      const schema = Joi.object({
        name: Joi.string().min(2).max(50).required(),
        email: Joi.string().email().required(),
        age: Joi.number().min(18).max(120).optional()
      });

      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        age: 30
      };

      const result = validator.validate(validData, schema);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(validData);
      expect(result.warnings).toEqual([]);
      expect(result.validationTime).toBeGreaterThan(0);
    });

    test('should reject invalid data with detailed errors', () => {
      const schema = Joi.object({
        name: Joi.string().min(2).required(),
        email: Joi.string().email().required(),
        age: Joi.number().min(18).required()
      });

      const invalidData = {
        name: 'J', // Too short
        email: 'invalid-email',
        age: 16 // Too young
      };

      expect(() => {
        validator.validate(invalidData, schema);
      }).toThrow(ValidationError);
    });

    test('should handle schema caching for performance', () => {
      const schema = Joi.object({
        name: Joi.string().required()
      });

      const data = { name: 'Test' };

      // First call
      const result1 = validator.validate(data, schema);
      expect(result1.success).toBe(true);

      // Second call should use cached schema
      const result2 = validator.validate(data, schema);
      expect(result2.success).toBe(true);

      // Verify schema is cached
      expect(validator.schemaCache.size).toBe(1);
    });

    test('should handle validation options correctly', () => {
      const schema = Joi.object({
        name: Joi.string().required(),
        extra: Joi.string().optional()
      });

      const data = {
        name: 'Test',
        unknownField: 'should be stripped'
      };

      const result = validator.validate(data, schema, {
        stripUnknown: true,
        allowUnknown: false
      });

      expect(result.success).toBe(true);
      expect(result.data.unknownField).toBeUndefined();
    });
  });

  describe('Custom Rules', () => {
    test('should register and apply custom validation rules', () => {
      validator.registerRule(
        'evenNumber',
        (data) => data.number % 2 === 0,
        'Number must be even'
      );

      const validData = { number: 4 };
      const invalidData = { number: 3 };

      const result1 = validator.validateWithCustomRules(validData, ['evenNumber']);
      expect(result1.success).toBe(true);

      expect(() => {
        validator.validateWithCustomRules(invalidData, ['evenNumber']);
      }).toThrow(ValidationError);
    });

    test('should handle multiple custom rules', () => {
      validator.registerRule(
        'positiveNumber',
        (data) => data.number > 0,
        'Number must be positive'
      );

      validator.registerRule(
        'lessThanHundred',
        (data) => data.number < 100,
        'Number must be less than 100'
      );

      const validData = { number: 50 };
      const result = validator.validateWithCustomRules(validData, ['positiveNumber', 'lessThanHundred']);
      expect(result.success).toBe(true);

      const invalidData = { number: -5 };
      expect(() => {
        validator.validateWithCustomRules(invalidData, ['positiveNumber', 'lessThanHundred']);
      }).toThrow(ValidationError);
    });

    test('should handle custom rule execution errors', () => {
      validator.registerRule(
        'faultyRule',
        () => { throw new Error('Rule execution failed'); },
        'This rule will fail'
      );

      expect(() => {
        validator.validateWithCustomRules({ test: 'data' }, ['faultyRule']);
      }).toThrow(ValidationError);
    });
  });

  describe('Business Rules', () => {
    test('should register and apply business rules', () => {
      validator.registerBusinessRule(
        'ageRestriction',
        (data, context) => {
          const minAge = context.minAge || 18;
          if (data.age < minAge) {
            return {
              valid: false,
              message: `Age must be at least ${minAge}`,
              context: { age: data.age, minAge }
            };
          }
          return { valid: true };
        },
        'User must meet minimum age requirement'
      );

      const validData = { age: 25 };
      const context = { minAge: 18 };

      const result = validator.validateBusinessRules(validData, ['ageRestriction'], context);
      expect(result.success).toBe(true);

      const invalidData = { age: 16 };
      expect(() => {
        validator.validateBusinessRules(invalidData, ['ageRestriction'], context);
      }).toThrow(BusinessLogicError);
    });

    test('should handle business rule warnings', () => {
      validator.registerBusinessRule(
        'recommendedAge',
        (data) => {
          if (data.age < 21) {
            return {
              valid: true,
              message: 'Age below recommended minimum',
              severity: 'warning'
            };
          }
          return { valid: true };
        },
        'Recommended age guideline'
      );

      const data = { age: 19 };
      const result = validator.validateBusinessRules(data, ['recommendedAge']);

      expect(result.success).toBe(true);
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].severity).toBe('warning');
    });

    test('should handle business rule execution errors', () => {
      validator.registerBusinessRule(
        'faultyBusinessRule',
        () => { throw new Error('Business rule failed'); },
        'Faulty business rule'
      );

      expect(() => {
        validator.validateBusinessRules({ test: 'data' }, ['faultyBusinessRule']);
      }).toThrow(BusinessLogicError);
    });
  });

  describe('Common Schemas', () => {
    test('should provide location schema', () => {
      const schemas = validator.getCommonSchemas();
      const locationSchema = schemas.location;

      const validLocation = {
        latitude: 40.7128,
        longitude: -74.0060,
        city: 'New York'
      };

      const result = validator.validate(validLocation, locationSchema);
      expect(result.success).toBe(true);
    });

    test('should provide financial amount schema', () => {
      const schemas = validator.getCommonSchemas();
      const financialSchema = schemas.financialAmount;

      const validAmount = {
        amount: 1000.50,
        currency: 'USD'
      };

      const result = validator.validate(validAmount, financialSchema);
      expect(result.success).toBe(true);
    });

    test('should provide pagination schema', () => {
      const schemas = validator.getCommonSchemas();
      const paginationSchema = schemas.pagination;

      const validPagination = {
        page: 2,
        limit: 25,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      };

      const result = validator.validate(validPagination, paginationSchema);
      expect(result.success).toBe(true);
    });
  });

  describe('Validation Metrics', () => {
    test('should track validation metrics', () => {
      const schema = Joi.object({
        name: Joi.string().required()
      });

      // Successful validation
      validator.validate({ name: 'Test' }, schema);

      // Failed validation
      try {
        validator.validate({}, schema);
      } catch (error) {
        // Expected to fail
      }

      const metrics = validator.getMetrics();
      expect(metrics.validationCount).toBe(2);
      expect(metrics.successCount).toBe(1);
      expect(metrics.errorCount).toBe(1);
      expect(metrics.successRate).toBe('50.00');
      expect(metrics.averageValidationTime).toBeGreaterThan(0);
    });

    test('should clear metrics', () => {
      const schema = Joi.object({ name: Joi.string() });
      validator.validate({ name: 'Test' }, schema);

      let metrics = validator.getMetrics();
      expect(metrics.validationCount).toBe(1);

      validator.clear();
      metrics = validator.getMetrics();
      expect(metrics.validationCount).toBe(0);
    });
  });

  describe('Global Validator', () => {
    test('should use global validator instance', () => {
      expect(globalValidator).toBeInstanceOf(ValidationFramework);
    });

    test('should have pre-registered common rules', () => {
      const data = ['a', 'b', 'c'];
      const result = globalValidator.validateWithCustomRules(data, ['uniqueInArray']);
      expect(result.success).toBe(true);

      const duplicateData = ['a', 'b', 'a'];
      expect(() => {
        globalValidator.validateWithCustomRules(duplicateData, ['uniqueInArray']);
      }).toThrow(ValidationError);
    });

    test('should have pre-registered business rules', () => {
      const validData = { startYear: 2020, endYear: 2025 };
      const result = globalValidator.validateBusinessRules(validData, ['simulationParametersConsistency']);
      expect(result.success).toBe(true);

      const invalidData = { startYear: 2025, endYear: 2020 };
      expect(() => {
        globalValidator.validateBusinessRules(invalidData, ['simulationParametersConsistency']);
      }).toThrow(BusinessLogicError);
    });
  });

  describe('Custom Validation Rules Constants', () => {
    test('should provide coordinate validation', () => {
      const { coordinates } = customValidationRules;
      
      const schema = Joi.object(coordinates);
      const validCoords = { latitude: 40.7128, longitude: -74.0060 };
      
      const result = validator.validate(validCoords, schema);
      expect(result.success).toBe(true);
    });

    test('should provide hazard types validation', () => {
      const { hazardTypes } = customValidationRules;
      
      expect(hazardTypes).toContain('Earthquake');
      expect(hazardTypes).toContain('Hurricane');
      expect(hazardTypes).toContain('Flood');
    });

    test('should provide ID pattern validation', () => {
      const { idPatterns } = customValidationRules;
      
      const validHazardId = 'HAZ-12345678';
      const schema = Joi.object({
        id: idPatterns.hazardId.required()
      });
      
      const result = validator.validate({ id: validHazardId }, schema);
      expect(result.success).toBe(true);
    });
  });

  describe('Error Formatting', () => {
    test('should format validation errors with context', () => {
      const schema = Joi.object({
        name: Joi.string().min(2).required(),
        age: Joi.number().min(0).required()
      });

      const invalidData = { name: 'J', age: -5 };

      try {
        validator.validate(invalidData, schema, { context: 'User Registration' });
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect(error.message).toContain('User Registration');
        expect(error.details.allErrors).toHaveLength(2);
      }
    });

    test('should handle Joi validation error details', () => {
      const schema = Joi.object({
        email: Joi.string().email().required()
      });

      try {
        validator.validate({ email: 'invalid' }, schema);
      } catch (error) {
        expect(error.details.allErrors[0]).toMatchObject({
          field: 'email',
          message: expect.stringContaining('email'),
          value: 'invalid',
          type: expect.any(String)
        });
      }
    });
  });
});