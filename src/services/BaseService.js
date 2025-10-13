/**
 * Base Service Class for CAT Modeling Platform
 * Provides common CRUD operations and database interactions with transaction support
 */

const mongoose = require('mongoose');
const { globalValidator } = require('../utils/ValidationFramework');
const { globalPerformanceMonitor } = require('../utils/PerformanceMonitor');
const { globalQueryOptimizer } = require('../utils/QueryOptimizer');
const { queryCache } = require('../utils/CacheManager');

class BaseService {
  constructor(model) {
    this.model = model;
    this.activeTransactions = new Map();
    this.transactionCallbacks = new Map();
    this.transactionSupported = null; // Will be determined at runtime
  }

  /**
   * Check if transactions are supported - STRICT MODE (NO FALLBACK)
   * @returns {Promise<boolean>} Whether transactions are supported
   */
  async checkTransactionSupport() {
    if (this.transactionSupported !== null) {
      return this.transactionSupported;
    }

    try {
      // STRICT CHECK: Must have replica set for transactions
      const admin = mongoose.connection.db.admin();
      const result = await admin.command({ replSetGetStatus: 1 });
      
      if (result.ok === 1 && result.set) {
        this.transactionSupported = true;
        console.log(`[${this.model.modelName}] ✅ MongoDB replica set detected - Transaction support: ENABLED`);
        console.log(`[${this.model.modelName}] Replica set: ${result.set}, Members: ${result.members.length}`);
        return true;
      }
      
      // Should not reach here if replica set is properly configured
      throw new Error('Replica set status check failed');
      
    } catch (error) {
      // STRICT MODE: No fallback - fail fast to prevent production issues
      const errorMessage = `❌ CRITICAL: MongoDB transactions required but not available!
      
🚨 CONFIGURATION ERROR: ${error.message}

💡 SOLUTIONS:
   1. Use MongoDB Atlas (recommended): https://cloud.mongodb.com/
   2. Configure local MongoDB with replica set
   3. Update MONGODB_URI to include replica set parameters
   
🎯 REQUIREMENT: This application requires ACID transactions
❌ FALLBACK DISABLED: To prevent masking production issues

Current MongoDB URI: ${process.env.MONGODB_URI || 'Not configured'}
Connection State: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'}
`;
      
      console.error(`[${this.model.modelName}] ${errorMessage}`);
      
      // FAIL FAST - Don't allow the application to run without proper transactions
      throw new Error(`CRITICAL: MongoDB transactions required but not available - ${error.message}`);
    }
  }

  /**
   * Start a new database transaction - STRICT MODE
   * @param {Object} options - Transaction options
   * @returns {Promise<Object>} Transaction session and ID
   */
  async startTransaction(options = {}) {
    try {
      const {
        transactionId = this.generateTransactionId(),
        readConcern = 'majority',
        writeConcern = { w: 'majority', j: true },
        maxCommitTimeMS = 30000
      } = options;

      // STRICT: Ensure transactions are supported (will throw if not)
      await this.checkTransactionSupport();
      
      // Start real MongoDB transaction session
      const session = await mongoose.startSession();
      
      session.startTransaction({
        readConcern: { level: readConcern },
        writeConcern,
        maxCommitTimeMS
      });

      this.activeTransactions.set(transactionId, {
        session,
        operations: [],
        startTime: new Date(),
        status: 'active',
        transactionSupported: true // Always true in strict mode
      });

      console.log(`[${this.model.modelName}] ✅ Real transaction ${transactionId} started`);
      
      return {
        transactionId,
        session
      };
    } catch (error) {
      console.error(`[${this.model.modelName}] ❌ Failed to start transaction:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Commit a transaction
   * @param {string} transactionId - Transaction ID
   * @returns {Promise<void>}
   */
  async commitTransaction(transactionId) {
    try {
      const transaction = this.activeTransactions.get(transactionId);
      
      if (!transaction) {
        throw new Error(`Transaction ${transactionId} not found`);
      }

      if (transaction.status !== 'active') {
        throw new Error(`Transaction ${transactionId} is not active (status: ${transaction.status})`);
      }

      if (!transaction.session) {
        throw new Error(`Transaction ${transactionId} has no valid session - MongoDB transaction support required`);
      }
      
      await transaction.session.commitTransaction();
      
      transaction.status = 'committed';
      
      console.log(`[${this.model.modelName}] ✅ Transaction ${transactionId} committed successfully`);
      
      // Execute post-commit callbacks
      const callbacks = this.transactionCallbacks.get(transactionId);
      if (callbacks && callbacks.onCommit) {
        await Promise.all(callbacks.onCommit.map(cb => cb()));
      }
      
      // Cleanup
      if (transaction.session) {
        await transaction.session.endSession();
      }
      this.activeTransactions.delete(transactionId);
      this.transactionCallbacks.delete(transactionId);
      
    } catch (error) {
      console.error(`[${this.model.modelName}] Failed to commit transaction ${transactionId}:`, error);
      await this.rollbackTransaction(transactionId);
      throw this.handleError(error);
    }
  }

  /**
   * Rollback a transaction
   * @param {string} transactionId - Transaction ID
   * @returns {Promise<void>}
   */
  async rollbackTransaction(transactionId) {
    try {
      const transaction = this.activeTransactions.get(transactionId);
      
      if (!transaction) {
        console.warn(`[${this.model.modelName}] Transaction ${transactionId} not found for rollback`);
        return;
      }

      if (transaction.status === 'active' && transaction.session) {
        try {
          await transaction.session.abortTransaction();
        } catch (abortError) {
          // Ignore errors if transaction was already aborted
          if (!abortError.message.includes('Cannot call abortTransaction twice')) {
            throw abortError;
          }
        }
      }
      
      transaction.status = 'rolled_back';
      
      console.log(`[${this.model.modelName}] ✅ Transaction ${transactionId} rolled back`);
      
      // Execute post-rollback callbacks
      const callbacks = this.transactionCallbacks.get(transactionId);
      if (callbacks && callbacks.onRollback) {
        await Promise.all(callbacks.onRollback.map(cb => cb()));
      }
      
      // Cleanup
      if (transaction.session) {
        await transaction.session.endSession();
      }
      this.activeTransactions.delete(transactionId);
      this.transactionCallbacks.delete(transactionId);
      
    } catch (error) {
      console.error(`[${this.model.modelName}] Failed to rollback transaction ${transactionId}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Execute operations within a transaction context
   * @param {Function} operations - Function containing operations to execute
   * @param {Object} options - Transaction options
   * @returns {Promise<any>} Result of operations
   */
  async withTransaction(operations, options = {}) {
    const { transactionId } = await this.startTransaction(options);
    
    try {
      const result = await operations(transactionId);
      await this.commitTransaction(transactionId);
      return result;
    } catch (error) {
      await this.rollbackTransaction(transactionId);
      throw error;
    }
  }

  /**
   * Add callback functions for transaction lifecycle events
   * @param {string} transactionId - Transaction ID
   * @param {Object} callbacks - Callback functions
   */
  addTransactionCallbacks(transactionId, callbacks = {}) {
    const existingCallbacks = this.transactionCallbacks.get(transactionId) || {
      onCommit: [],
      onRollback: []
    };

    if (callbacks.onCommit) {
      existingCallbacks.onCommit.push(callbacks.onCommit);
    }
    
    if (callbacks.onRollback) {
      existingCallbacks.onRollback.push(callbacks.onRollback);
    }

    this.transactionCallbacks.set(transactionId, existingCallbacks);
  }

  /**
   * Get transaction session for manual operations
   * @param {string} transactionId - Transaction ID
   * @returns {Object|null} Session object
   */
  getTransactionSession(transactionId) {
    const transaction = this.activeTransactions.get(transactionId);
    return transaction ? transaction.session : null;
  }

  /**
   * Generate unique transaction ID
   * @returns {string} Transaction ID
   */
  generateTransactionId() {
    return `TXN-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
  }

  /**
   * Log transaction operation for audit trail
   * @param {string} transactionId - Transaction ID
   * @param {string} operation - Operation type
   * @param {Object} details - Operation details
   */
  logTransactionOperation(transactionId, operation, details = {}) {
    const transaction = this.activeTransactions.get(transactionId);
    if (transaction) {
      transaction.operations.push({
        operation,
        details,
        timestamp: new Date(),
        service: this.model.modelName
      });
    }
  }

  /**
   * Get transaction status and details
   * @param {string} transactionId - Transaction ID
   * @returns {Object|null} Transaction details
   */
  getTransactionStatus(transactionId) {
    const transaction = this.activeTransactions.get(transactionId);
    if (!transaction) {
      return null;
    }

    return {
      transactionId,
      status: transaction.status,
      startTime: transaction.startTime,
      duration: Date.now() - transaction.startTime.getTime(),
      operationCount: transaction.operations.length,
      operations: transaction.operations
    };
  }

  /**
   * Execute distributed transaction across multiple services
   * @param {Array} services - Array of service instances
   * @param {Function} operations - Function containing distributed operations
   * @param {Object} options - Transaction options
   * @returns {Promise<any>} Result of operations
   */
  static async withDistributedTransaction(services, operations, options = {}) {
    const coordinator = services[0]; // First service acts as coordinator
    const { transactionId } = await coordinator.startTransaction(options);
    
    const distributedTransaction = {
      transactionId,
      coordinator,
      participants: services.slice(1),
      status: 'active',
      results: {}
    };

    try {
      console.log(`[DistributedTx] Starting distributed transaction ${transactionId} with ${services.length} services`);
      
      // Share transaction session with all services
      for (const service of services.slice(1)) {
        const session = coordinator.getTransactionSession(transactionId);
        service.activeTransactions.set(transactionId, {
          session,
          operations: [],
          startTime: new Date(),
          status: 'active',
          isParticipant: true
        });
      }

      // Execute operations
      const result = await operations(transactionId, services);
      distributedTransaction.results = result;

      // Prepare phase - validate all participants can commit
      console.log(`[DistributedTx] Preparing distributed transaction ${transactionId}`);
      await coordinator.commitTransaction(transactionId);

      console.log(`[DistributedTx] Distributed transaction ${transactionId} completed successfully`);
      return result;

    } catch (error) {
      console.error(`[DistributedTx] Distributed transaction ${transactionId} failed:`, error);
      
      // Rollback all participants
      for (const service of services) {
        try {
          await service.rollbackTransaction(transactionId);
        } catch (rollbackError) {
          console.error(`[DistributedTx] Failed to rollback service ${service.model.modelName}:`, rollbackError);
        }
      }
      
      throw error;
    }
  }

  /**
   * Create multiple documents atomically
   * @param {Array} documentsData - Array of document data objects
   * @param {Object} options - Create options
   * @returns {Promise<Array>} Created documents
   */
  async createMany(documentsData, options = {}) {
    const { transactionId } = options;
    
    if (!transactionId) {
      // If no transaction provided, create one for atomic operation
      return await this.withTransaction(async (txnId) => {
        return await this.createMany(documentsData, { ...options, transactionId: txnId });
      });
    }

    try {
      // Get transaction context
      const transaction = this.activeTransactions.get(transactionId);
      if (!transaction?.session) {
        throw new Error(`Transaction ${transactionId} has no valid session - MongoDB transaction support required`);
      }
      const session = transaction.session;
      
      this.logTransactionOperation(transactionId, 'createMany', { 
        model: this.model.modelName,
        count: documentsData.length
      });

      const createdDocuments = [];
      for (const data of documentsData) {
        const document = new this.model(data);
        // Use session only if not in fallback mode
        const saveOptions = session ? { session } : {};
        const savedDocument = await document.save(saveOptions);
        createdDocuments.push(savedDocument);
      }

      return createdDocuments;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Update multiple documents atomically
   * @param {Object} filter - Filter criteria
   * @param {Object} updateData - Update data
   * @param {Object} options - Update options
   * @returns {Promise<Object>} Update result
   */
  async updateMany(filter, updateData, options = {}) {
    try {
      const { transactionId } = options;
      
      // Get transaction context
      const transaction = transactionId ? this.activeTransactions.get(transactionId) : null;
      let session = null;
      
      if (transaction) {
        if (!transaction.session) {
          throw new Error(`Transaction ${transactionId} has no valid session - MongoDB transaction support required`);
        }
        session = transaction.session;
      }
      
      if (transactionId) {
        this.logTransactionOperation(transactionId, 'updateMany', { 
          model: this.model.modelName,
          filter: Object.keys(filter),
          updateFields: Object.keys(updateData)
        });
      }

      const updateOptions = { ...options };
      delete updateOptions.transactionId; // Remove custom option
      
      // Use session only if not in fallback mode
      if (session) {
        updateOptions.session = session;
      }
      
      return await this.model.updateMany(filter, updateData, updateOptions);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete multiple documents atomically
   * @param {Object} filter - Filter criteria
   * @param {Object} options - Delete options
   * @returns {Promise<Object>} Delete result
   */
  async deleteMany(filter, options = {}) {
    try {
      const { transactionId, soft = false } = options;
      
      // Get transaction context
      const transaction = transactionId ? this.activeTransactions.get(transactionId) : null;
      let session = null;
      
      if (transaction) {
        if (!transaction.session) {
          throw new Error(`Transaction ${transactionId} has no valid session - MongoDB transaction support required`);
        }
        session = transaction.session;
      }
      
      if (transactionId) {
        this.logTransactionOperation(transactionId, 'deleteMany', { 
          model: this.model.modelName,
          filter: Object.keys(filter),
          soft
        });
      }

      if (soft) {
        return await this.updateMany(filter, { 
          status: 'Inactive',
          deletedAt: new Date()
        }, { transactionId });
      } else {
        // Use session only if not in fallback mode
        const deleteOptions = session ? { session } : {};
        return await this.model.deleteMany(filter, deleteOptions);
      }
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Execute operations with automatic retry on transaction conflicts
   * @param {Function} operations - Operations to execute
   * @param {Object} options - Retry options
   * @returns {Promise<any>} Result of operations
   */
  async withRetry(operations, options = {}) {
    const { 
      maxRetries = 3,
      retryDelay = 100,
      exponentialBackoff = true
    } = options;

    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operations();
      } catch (error) {
        lastError = error;
        
        // Check if error is retryable (transaction conflict, write conflict, etc.)
        const isRetryable = this.isRetryableError(error);
        
        if (!isRetryable || attempt === maxRetries) {
          throw error;
        }

        const delay = exponentialBackoff ? retryDelay * Math.pow(2, attempt - 1) : retryDelay;
        console.log(`[${this.model.modelName}] Retry attempt ${attempt} after ${delay}ms due to:`, error.message);
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError;
  }

  /**
   * Check if an error is retryable
   * @param {Error} error - Error to check
   * @returns {boolean} Whether error is retryable
   */
  isRetryableError(error) {
    // MongoDB error codes that indicate retryable conditions
    const retryableCodes = [
      112, // WriteConflict
      11000, // DuplicateKey (in some cases)
      16500, // TransactionExceededLifetimeLimitSeconds
      251, // NoSuchTransaction
      13435, // NotMaster
      91 // ShutdownInProgress
    ];

    return retryableCodes.includes(error.code) ||
           error.message.includes('WriteConflict') ||
           error.message.includes('TransientTransactionError');
  }

  /**
   * Enhanced create with validation and performance monitoring
   * @param {Object} data - Document data
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Created document
   */
  async create(data, options = {}) {
    const timerId = globalPerformanceMonitor.startTimer('database_create');
    
    try {
      const { transactionId, populate, validate: shouldValidate = true } = options;
      
      // Enhanced validation if requested
      if (shouldValidate && options.schema) {
        const validationResult = await this.validate(data, {
          schema: options.schema,
          customRules: options.customRules || [],
          businessRules: options.businessRules || [],
          context: options.validationContext || {}
        });
        
        if (!validationResult.isValid) {
          globalPerformanceMonitor.endTimer(timerId, { validation_failed: true });
          throw new Error('Validation failed');
        }
        
        // Use validated data
        data = validationResult.data || data;
      }
      
      // Get transaction context
      const transaction = transactionId ? this.activeTransactions.get(transactionId) : null;
      let session = null;
      
      if (transaction) {
        if (!transaction.session) {
          throw new Error(`Transaction ${transactionId} has no valid session - MongoDB transaction support required`);
        }
        session = transaction.session;
      }
      
      // Log transaction operation if within transaction
      if (transactionId) {
        this.logTransactionOperation(transactionId, 'create', { 
          model: this.model.modelName,
          data: Object.keys(data)
        });
      }
      
      const document = new this.model(data);
      
      // Use session only if not in fallback mode
      const saveOptions = session ? { session } : {};
      const savedDocument = await document.save(saveOptions);
      
      // Increment counter for monitoring
      globalPerformanceMonitor.incrementCounter('documents_created', 1, { 
        model: this.model.modelName 
      });

      // Clear related cache entries
      this.invalidateRelatedCache('create', savedDocument);
      
      if (populate) {
        const query = this.model.findById(savedDocument._id).populate(populate);
        if (session) query.session(session);
        const populatedDoc = await query.exec();
        globalPerformanceMonitor.endTimer(timerId, { populated: true });
        return populatedDoc;
      }
      
      globalPerformanceMonitor.endTimer(timerId, { success: true });
      return savedDocument;
    } catch (error) {
      globalPerformanceMonitor.endTimer(timerId, { error: true });
      throw this.handleError(error);
    }
  }

  /**
   * Enhanced find with caching and performance monitoring
   * @param {Object} filter - MongoDB filter
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Query result with pagination
   */
  async find(filter = {}, options = {}) {
    const timerId = globalPerformanceMonitor.startTimer('database_query');
    
    try {
      const {
        page = 1,
        limit = 10,
        sort = { createdAt: -1 },
        populate = [],
        select = null,
        transactionId,
        useCache = true,
        cacheTTL = 5 * 60 * 1000 // 5 minutes default
      } = options;

      // Build query info for optimization
      const queryInfo = {
        model: this.model.modelName,
        operation: 'find',
        filter,
        select,
        sort,
        limit: parseInt(limit),
        populate,
        skip: (page - 1) * limit
      };

      // Optimize query
      const optimization = globalQueryOptimizer.optimizeQuery(queryInfo);
      
      // Check cache first (if not in transaction and cache enabled)
      let cacheKey = null;
      if (useCache && !transactionId && optimization.cacheKey) {
        cacheKey = optimization.cacheKey;
        const cachedResult = queryCache.get(cacheKey);
        if (cachedResult) {
          globalPerformanceMonitor.incrementCounter('cache_hit', 1, { model: this.model.modelName });
          globalPerformanceMonitor.endTimer(timerId, { cached: true });
          return cachedResult;
        }
      }

      const session = transactionId ? this.getTransactionSession(transactionId) : null;
      const skip = (page - 1) * limit;
      
      let query = this.model.find(filter);
      let countQuery = this.model.countDocuments(filter);
      
      if (session) {
        query = query.session(session);
        countQuery = countQuery.session(session);
      }
      
      if (select) {
        query = query.select(select);
      }
      
      if (populate.length > 0) {
        populate.forEach(field => {
          query = query.populate(field);
        });
      }

      // Apply lean for better performance if no session
      if (!session) {
        query = query.lean();
      }
      
      const startTime = Date.now();
      const [documents, total] = await Promise.all([
        query.sort(sort).skip(skip).limit(parseInt(limit)).exec(),
        countQuery.exec()
      ]);
      const duration = Date.now() - startTime;

      const result = {
        data: documents,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        },
        performance: {
          queryTime: duration,
          cached: false,
          optimizations: optimization.optimizations?.length || 0
        }
      };

      // Cache result if appropriate
      if (useCache && cacheKey && !transactionId) {
        queryCache.set(cacheKey, result, cacheTTL);
        globalPerformanceMonitor.incrementCounter('cache_miss', 1, { model: this.model.modelName });
      }

      // Record query performance
      globalQueryOptimizer.recordSlowQuery(queryInfo, duration);
      globalPerformanceMonitor.endTimer(timerId, { 
        duration, 
        resultCount: documents.length,
        optimized: optimization.optimizations?.length > 0
      });

      return result;
    } catch (error) {
      globalPerformanceMonitor.endTimer(timerId, { error: true });
      throw this.handleError(error);
    }
  }

  /**
   * Find a single document by ID
   * @param {string} id - Document ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Document or null
   */
  async findById(id, options = {}) {
    try {
      const { populate = [], select = null } = options;
      
      let query = this.model.findById(id);
      
      if (select) {
        query = query.select(select);
      }
      
      if (populate.length > 0) {
        populate.forEach(field => {
          query = query.populate(field);
        });
      }
      
      return await query.exec();
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Find a single document by custom field
   * @param {Object} filter - MongoDB filter
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Document or null
   */
  async findOne(filter, options = {}) {
    try {
      const { populate = [], select = null } = options;
      
      let query = this.model.findOne(filter);
      
      if (select) {
        query = query.select(select);
      }
      
      if (populate.length > 0) {
        populate.forEach(field => {
          query = query.populate(field);
        });
      }
      
      return await query.exec();
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Update a document by ID
   * @param {string} id - Document ID
   * @param {Object} data - Update data
   * @param {Object} options - Update options
   * @returns {Promise<Object>} Updated document
   */
  async updateById(id, data, options = {}) {
    try {
      const { 
        new: returnNew = true, 
        runValidators = true,
        populate = [],
        transactionId
      } = options;

      // Get transaction context
      const transaction = transactionId ? this.activeTransactions.get(transactionId) : null;
      let session = null;
      
      if (transaction) {
        if (!transaction.session) {
          throw new Error(`Transaction ${transactionId} has no valid session - MongoDB transaction support required`);
        }
        session = transaction.session;
      }
      
      const updateOptions = { new: returnNew, runValidators };
      if (session) {
        updateOptions.session = session;
      }
      
      // Log transaction operation if within transaction
      if (transactionId) {
        this.logTransactionOperation(transactionId, 'updateById', { 
          model: this.model.modelName,
          id,
          fields: Object.keys(data)
        });
      }
      
      let updatedDocument = await this.model.findByIdAndUpdate(id, data, updateOptions);
      
      if (!updatedDocument) {
        throw new Error('Document not found');
      }
      
      if (populate.length > 0) {
        let query = this.model.findById(updatedDocument._id);
        populate.forEach(field => {
          query = query.populate(field);
        });
        if (session) query.session(session);
        updatedDocument = await query.exec();
      }
      
      return updatedDocument;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete a document by ID
   * @param {string} id - Document ID
   * @param {Object} options - Delete options
   * @returns {Promise<Object>} Deleted document
   */
  async deleteById(id, options = {}) {
    try {
      const { soft = false, transactionId } = options;
      
      // Get transaction context
      const transaction = transactionId ? this.activeTransactions.get(transactionId) : null;
      let session = null;
      
      if (transaction) {
        if (!transaction.session) {
          throw new Error(`Transaction ${transactionId} has no valid session - MongoDB transaction support required`);
        }
        session = transaction.session;
      }
      
      // Log transaction operation if within transaction
      if (transactionId) {
        this.logTransactionOperation(transactionId, 'deleteById', { 
          model: this.model.modelName,
          id,
          soft
        });
      }
      
      if (soft) {
        // Soft delete - update status to inactive
        return await this.updateById(id, { 
          status: 'Inactive',
          deletedAt: new Date()
        }, { transactionId });
      } else {
        // Hard delete - use session only if not in fallback mode
        const deleteOptions = session ? { session } : {};
        const deletedDocument = await this.model.findByIdAndDelete(id, deleteOptions);
        if (!deletedDocument) {
          throw new Error('Document not found');
        }
        return deletedDocument;
      }
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Count documents matching filter
   * @param {Object} filter - MongoDB filter
   * @returns {Promise<number>} Document count
   */
  async count(filter = {}) {
    try {
      return await this.model.countDocuments(filter);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Check if document exists
   * @param {Object} filter - MongoDB filter
   * @returns {Promise<boolean>} Exists or not
   */
  async exists(filter) {
    try {
      const count = await this.model.countDocuments(filter);
      return count > 0;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Aggregate documents
   * @param {Array} pipeline - Aggregation pipeline
   * @returns {Promise<Array>} Aggregation results
   */
  async aggregate(pipeline) {
    try {
      return await this.model.aggregate(pipeline);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Bulk operations
   * @param {Array} operations - Bulk operations
   * @returns {Promise<Object>} Bulk operation result
   */
  async bulkWrite(operations) {
    try {
      return await this.model.bulkWrite(operations);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Find documents within geographic bounds
   * @param {Object} bounds - Geographic bounds
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Documents within bounds
   */
  async findWithinBounds(bounds, options = {}) {
    try {
      const {
        latitudeField = 'footprint.centerLatitude',
        longitudeField = 'footprint.centerLongitude',
        ...queryOptions
      } = options;

      const filter = {
        [latitudeField]: {
          $gte: bounds.minLat,
          $lte: bounds.maxLat
        },
        [longitudeField]: {
          $gte: bounds.minLng,
          $lte: bounds.maxLng
        }
      };

      return await this.find(filter, queryOptions);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Find documents near a point
   * @param {Object} point - Geographic point
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Nearby documents
   */
  async findNear(point, options = {}) {
    try {
      const {
        latitudeField = 'footprint.centerLatitude',
        longitudeField = 'footprint.centerLongitude',
        maxDistance = 10000, // meters
        ...queryOptions
      } = options;

      const filter = {
        [latitudeField]: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [point.longitude, point.latitude]
            },
            $maxDistance: maxDistance
          }
        }
      };

      return await this.find(filter, queryOptions);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Search documents by text
   * @param {string} searchTerm - Search term
   * @param {Array} fields - Fields to search
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Search results
   */
  async search(searchTerm, fields = [], options = {}) {
    try {
      if (!searchTerm || fields.length === 0) {
        return await this.find({}, options);
      }

      const searchConditions = fields.map(field => ({
        [field]: { $regex: searchTerm, $options: 'i' }
      }));

      const filter = {
        $or: searchConditions
      };

      return await this.find(filter, options);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get statistics for documents
   * @param {Object} filter - MongoDB filter
   * @param {Array} groupBy - Fields to group by
   * @returns {Promise<Array>} Statistics
   */
  async getStatistics(filter = {}, groupBy = []) {
    try {
      const pipeline = [
        { $match: filter }
      ];

      if (groupBy.length > 0) {
        const groupStage = {
          $group: {
            _id: groupBy.reduce((acc, field) => {
              acc[field] = `$${field}`;
              return acc;
            }, {}),
            count: { $sum: 1 }
          }
        };
        pipeline.push(groupStage);
      } else {
        pipeline.push({
          $group: {
            _id: null,
            count: { $sum: 1 }
          }
        });
      }

      return await this.aggregate(pipeline);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Enhanced validation using the validation framework
   * @param {Object} data - Document data
   * @param {Object} options - Validation options
   * @returns {Promise<Object>} Validation result
   */
  async validate(data, options = {}) {
    try {
      const { 
        skipRequired = false, 
        schema = null, 
        customRules = [], 
        businessRules = [],
        context = {}
      } = options;
      
      // If a custom schema is provided, use the validation framework
      if (schema) {
        const validationOptions = {
          allowUnknown: options.allowUnknown || false,
          stripUnknown: options.stripUnknown || false,
          context: this.model.modelName
        };
        
        const result = globalValidator.validate(data, schema, validationOptions);
        
        // Apply custom rules if specified
        if (customRules.length > 0) {
          await globalValidator.validateWithCustomRules(result.data, customRules);
        }
        
        // Apply business rules if specified
        if (businessRules.length > 0) {
          const businessResult = await globalValidator.validateBusinessRules(
            result.data, 
            businessRules, 
            { ...context, modelName: this.model.modelName }
          );
          result.warnings = businessResult.warnings || [];
        }
        
        return {
          isValid: true,
          data: result.data,
          warnings: result.warnings || [],
          validationTime: result.validationTime
        };
      }
      
      // Default Mongoose validation
      const document = new this.model(data);
      
      if (skipRequired) {
        return { isValid: true, errors: [] };
      }
      
      await document.validate();
      return { isValid: true, errors: [], data };
      
    } catch (error) {
      if (error.name === 'ValidationError') {
        const errors = Object.values(error.errors).map(err => ({
          field: err.path,
          message: err.message,
          value: err.value
        }));
        return { isValid: false, errors };
      }
      throw this.handleError(error);
    }
  }

  /**
   * Get validation metrics for this service
   * @returns {Object} Validation metrics
   */
  getValidationMetrics() {
    return globalValidator.getMetrics();
  }

  /**
   * Invalidate related cache entries
   * @param {string} operation - Operation type
   * @param {Object} document - Document that was modified
   */
  invalidateRelatedCache(operation, document) {
    try {
      // Clear all query cache entries for this model
      const modelPrefix = `query:${this.model.modelName}`;
      const cacheKeys = queryCache.keys();
      
      for (const key of cacheKeys) {
        if (key.includes(modelPrefix)) {
          queryCache.delete(key);
        }
      }
      
      globalPerformanceMonitor.incrementCounter('cache_invalidations', 1, { 
        model: this.model.modelName,
        operation 
      });
      
    } catch (error) {
      console.warn('Cache invalidation failed:', error);
    }
  }

  /**
   * Get performance metrics for this service
   * @returns {Object} Service performance metrics
   */
  getPerformanceMetrics() {
    return {
      service: this.model.modelName,
      performance: globalPerformanceMonitor.getMetrics(),
      queryOptimization: globalQueryOptimizer.getStatistics(),
      cache: queryCache.getStats(),
      timestamp: Date.now()
    };
  }

  /**
   * Get service health status
   * @returns {Object} Health status
   */
  async getHealthStatus() {
    const timerId = globalPerformanceMonitor.startTimer('health_check');
    
    try {
      // Test database connectivity
      const testQuery = await this.model.findOne({}).limit(1).lean();
      const queryTime = globalPerformanceMonitor.endTimer(timerId);
      
      const health = {
        service: this.model.modelName,
        status: 'healthy',
        database: {
          connected: true,
          queryTime: queryTime.duration
        },
        performance: globalPerformanceMonitor.getSummary(),
        cache: {
          size: queryCache.size,
          hitRate: queryCache.getStats().hitRate || 0
        },
        lastCheck: Date.now()
      };
      
      // Check for performance issues
      if (queryTime.duration > 1000) {
        health.status = 'degraded';
        health.warnings = ['Slow database response time'];
      }
      
      return health;
      
    } catch (error) {
      globalPerformanceMonitor.endTimer(timerId, { error: true });
      
      return {
        service: this.model.modelName,
        status: 'unhealthy',
        error: error.message,
        lastCheck: Date.now()
      };
    }
  }

  /**
   * Handle errors consistently using the global error handler
   * @param {Error} error - Error object
   * @returns {Error} Processed error
   */
  handleError(error) {
    const { globalErrorHandler } = require('../utils/ErrorHandler');
    
    const context = {
      modelName: this.model.modelName,
      operation: 'service_operation'
    };

    const errorResponse = globalErrorHandler.handle(error, context);
    
    // Extract the transformed error from the response
    const transformedError = new Error(errorResponse.error.message);
    transformedError.name = errorResponse.error.code;
    transformedError.statusCode = errorResponse.error.statusCode;
    transformedError.details = errorResponse.error.details;
    transformedError.isOperational = true;

    return transformedError;
  }

  /**
   * Create success response
   * @param {Object} data - Response data
   * @param {string} message - Success message
   * @returns {Object} Success response
   */
  createSuccessResponse(data, message = 'Operation successful') {
    return {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Create error response
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code
   * @param {Object} details - Error details
   * @returns {Object} Error response
   */
  createErrorResponse(message, statusCode = 500, details = null) {
    return {
      success: false,
      message,
      statusCode,
      details,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = BaseService;
