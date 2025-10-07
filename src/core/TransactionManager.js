/**
 * Transaction Manager
 * Provides transaction support for MongoDB operations
 */

const mongoose = require('mongoose');

class TransactionManager {
  /**
   * Execute operations within a transaction
   * @param {Function} callback - Async function that receives session parameter
   * @param {Object} options - Transaction options
   * @returns {Promise<*>} Result from callback
   */
  async executeInTransaction(callback, options = {}) {
    const session = await mongoose.startSession();
    
    try {
      session.startTransaction(options);
      
      const result = await callback(session);
      
      await session.commitTransaction();
      return result;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Execute bulk operations in batches with transaction support
   * @param {Array<Function>} operations - Array of async functions
   * @param {Object} options - Configuration options
   * @param {number} options.batchSize - Number of operations per batch
   * @param {Function} options.onProgress - Progress callback
   * @param {boolean} options.continueOnError - Continue if one operation fails
   * @returns {Promise<Object>} Results object
   */
  async executeBulkOperation(operations, options = {}) {
    const {
      batchSize = 100,
      onProgress = null,
      continueOnError = false
    } = options;

    const results = {
      successful: 0,
      failed: 0,
      errors: [],
      results: []
    };

    const session = await mongoose.startSession();
    
    try {
      session.startTransaction();

      for (let i = 0; i < operations.length; i += batchSize) {
        const batch = operations.slice(i, i + batchSize);
        
        for (const operation of batch) {
          try {
            const result = await operation(session);
            results.results.push(result);
            results.successful++;
          } catch (error) {
            results.failed++;
            results.errors.push({
              index: i + batch.indexOf(operation),
              error: error.message
            });
            
            if (!continueOnError) {
              throw error;
            }
          }
        }

        // Report progress
        if (onProgress) {
          const processed = Math.min(i + batchSize, operations.length);
          onProgress({
            processed,
            total: operations.length,
            percentage: (processed / operations.length) * 100,
            successful: results.successful,
            failed: results.failed
          });
        }
      }

      await session.commitTransaction();
      return results;
    } catch (error) {
      await session.abortTransaction();
      throw new Error(`Bulk operation failed: ${error.message}`);
    } finally {
      session.endSession();
    }
  }

  /**
   * Execute multiple operations in parallel with transaction
   * @param {Array<Function>} operations - Array of async functions
   * @param {Object} options - Options
   * @returns {Promise<Array>} Array of results
   */
  async executeParallel(operations, options = {}) {
    const session = await mongoose.startSession();
    
    try {
      session.startTransaction(options);
      
      const results = await Promise.all(
        operations.map(op => op(session))
      );
      
      await session.commitTransaction();
      return results;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Retry a transactional operation with exponential backoff
   * @param {Function} callback - Operation to execute
   * @param {Object} options - Retry options
   * @param {number} options.maxRetries - Maximum number of retries
   * @param {number} options.initialDelay - Initial delay in ms
   * @returns {Promise<*>} Result from callback
   */
  async executeWithRetry(callback, options = {}) {
    const {
      maxRetries = 3,
      initialDelay = 100
    } = options;

    let lastError;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await this.executeInTransaction(callback);
      } catch (error) {
        lastError = error;
        
        // Check if error is retryable (e.g., write conflict)
        if (this.isRetryableError(error) && attempt < maxRetries) {
          const delay = initialDelay * Math.pow(2, attempt);
          console.log(`Transaction failed, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          throw error;
        }
      }
    }
    
    throw lastError;
  }

  /**
   * Check if an error is retryable
   * @param {Error} error - Error to check
   * @returns {boolean} True if retryable
   */
  isRetryableError(error) {
    const retryableErrors = [
      'WriteConflict',
      'TransactionTooLarge',
      'SnapshotUnavailable',
      'NoSuchTransaction'
    ];
    
    return retryableErrors.some(errName => 
      error.message.includes(errName) || error.code === errName
    );
  }

  /**
   * Get active transaction session (for manual transaction management)
   * @returns {Promise<ClientSession>} MongoDB session
   */
  async startSession() {
    return await mongoose.startSession();
  }
}

// Export singleton instance
module.exports = new TransactionManager();
