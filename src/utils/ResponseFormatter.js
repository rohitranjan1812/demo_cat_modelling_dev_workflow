/**
 * Unified API Response Formatter
 * Provides consistent response structure across all endpoints
 */

class ResponseFormatter {
  /**
   * Format successful response
   * @param {Object} data - Response data
   * @param {string} message - Success message
   * @param {Object} pagination - Pagination info (optional)
   * @param {Object} metadata - Additional metadata (optional)
   * @returns {Object} Formatted response
   */
  static success(data, message = 'Success', pagination = null, metadata = {}) {
    const response = {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
      ...metadata
    };

    if (pagination) {
      response.pagination = {
        page: pagination.page || 1,
        limit: pagination.limit || 10,
        total: pagination.total || 0,
        pages: pagination.pages || Math.ceil((pagination.total || 0) / (pagination.limit || 10)),
        hasNext: pagination.hasNext || false,
        hasPrev: pagination.hasPrev || false
      };
    }

    return response;
  }

  /**
   * Format error response
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code
   * @param {string} code - Error code
   * @param {Object} details - Error details (optional)
   * @param {Object} metadata - Additional metadata (optional)
   * @returns {Object} Formatted error response
   */
  static error(message, statusCode = 500, code = 'INTERNAL_ERROR', details = null, metadata = {}) {
    const response = {
      success: false,
      message,
      error: {
        code,
        statusCode,
        timestamp: new Date().toISOString()
      },
      ...metadata
    };

    if (details) {
      response.error.details = details;
    }

    // Include stack trace in development
    if (process.env.NODE_ENV === 'development' && metadata.stack) {
      response.error.stack = metadata.stack;
    }

    return response;
  }

  /**
   * Format paginated response
   * @param {Array} items - Array of items
   * @param {number} page - Current page
   * @param {number} limit - Items per page
   * @param {number} total - Total items
   * @param {string} message - Success message
   * @returns {Object} Formatted paginated response
   */
  static paginated(items, page, limit, total, message = 'Success') {
    const pages = Math.ceil(total / limit);
    
    return this.success(
      items,
      message,
      {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages,
        hasNext: page < pages,
        hasPrev: page > 1
      }
    );
  }

  /**
   * Format validation error response
   * @param {Array|Object} errors - Validation errors
   * @param {string} message - Error message
   * @returns {Object} Formatted validation error response
   */
  static validationError(errors, message = 'Validation failed') {
    const errorArray = Array.isArray(errors) ? errors : [errors];
    
    return this.error(
      message,
      400,
      'VALIDATION_ERROR',
      {
        fields: errorArray.map(err => ({
          field: err.field || err.path || 'unknown',
          message: err.message || err.msg || 'Invalid value',
          value: err.value
        }))
      }
    );
  }

  /**
   * Format not found error response
   * @param {string} resource - Resource name
   * @param {string} id - Resource ID (optional)
   * @returns {Object} Formatted not found error response
   */
  static notFound(resource = 'Resource', id = null) {
    const message = id 
      ? `${resource} with ID '${id}' not found`
      : `${resource} not found`;
    
    return this.error(message, 404, 'NOT_FOUND', { resource, id });
  }

  /**
   * Format unauthorized error response
   * @param {string} message - Error message
   * @returns {Object} Formatted unauthorized error response
   */
  static unauthorized(message = 'Unauthorized access') {
    return this.error(message, 401, 'UNAUTHORIZED');
  }

  /**
   * Format forbidden error response
   * @param {string} message - Error message
   * @returns {Object} Formatted forbidden error response
   */
  static forbidden(message = 'Access forbidden') {
    return this.error(message, 403, 'FORBIDDEN');
  }

  /**
   * Format conflict error response
   * @param {string} message - Error message
   * @param {Object} details - Conflict details
   * @returns {Object} Formatted conflict error response
   */
  static conflict(message = 'Resource conflict', details = null) {
    return this.error(message, 409, 'CONFLICT', details);
  }

  /**
   * Format server error response
   * @param {Error} error - Error object
   * @param {string} message - Custom error message
   * @returns {Object} Formatted server error response
   */
  static serverError(error, message = 'Internal server error') {
    return this.error(
      message,
      500,
      'INTERNAL_ERROR',
      {
        error: error.message,
        name: error.name
      },
      process.env.NODE_ENV === 'development' ? { stack: error.stack } : {}
    );
  }

  /**
   * Format bulk operation response
   * @param {Object} results - Bulk operation results
   * @param {string} message - Success message
   * @returns {Object} Formatted bulk operation response
   */
  static bulkOperation(results, message = 'Bulk operation completed') {
    return this.success(
      {
        created: results.created || 0,
        updated: results.updated || 0,
        deleted: results.deleted || 0,
        failed: results.failed || 0,
        errors: results.errors || []
      },
      message,
      null,
      {
        totalProcessed: (results.created || 0) + (results.updated || 0) + (results.deleted || 0) + (results.failed || 0)
      }
    );
  }
}

module.exports = ResponseFormatter;

