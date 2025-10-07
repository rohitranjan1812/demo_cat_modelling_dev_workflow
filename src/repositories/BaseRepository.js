/**
 * Base Repository Class
 * 
 * Provides standardized database operations and query patterns
 * Abstracts MongoDB operations from service layer
 * Enables better testing and maintainability
 * 
 * @abstract
 */
class BaseRepository {
  constructor(model) {
    if (new.target === BaseRepository) {
      throw new Error('BaseRepository is an abstract class and cannot be instantiated directly');
    }
    
    if (!model) {
      throw new Error('Model is required for repository initialization');
    }
    
    this.model = model;
    this.modelName = model.modelName || 'Unknown';
  }

  /**
   * Create a new document
   * @param {Object} data - Document data
   * @param {Object} options - Create options
   * @returns {Promise<Object>} Created document
   */
  async create(data, options = {}) {
    try {
      const document = new this.model(data);
      return await document.save(options);
    } catch (error) {
      throw this.handleError(error, 'create');
    }
  }

  /**
   * Create multiple documents
   * @param {Array} dataArray - Array of document data
   * @param {Object} options - Create options
   * @returns {Promise<Array>} Created documents
   */
  async createMany(dataArray, options = {}) {
    try {
      return await this.model.insertMany(dataArray, options);
    } catch (error) {
      throw this.handleError(error, 'createMany');
    }
  }

  /**
   * Find document by ID
   * @param {string} id - Document ID
   * @param {Object} options - Query options
   * @returns {Promise<Object|null>} Found document or null
   */
  async findById(id, options = {}) {
    try {
      let query = this.model.findById(id);
      
      if (options.select) query = query.select(options.select);
      if (options.populate) query = query.populate(options.populate);
      if (options.lean) query = query.lean();
      
      return await query.exec();
    } catch (error) {
      throw this.handleError(error, 'findById');
    }
  }

  /**
   * Find one document by filter
   * @param {Object} filter - Query filter
   * @param {Object} options - Query options
   * @returns {Promise<Object|null>} Found document or null
   */
  async findOne(filter = {}, options = {}) {
    try {
      let query = this.model.findOne(filter);
      
      if (options.select) query = query.select(options.select);
      if (options.populate) query = query.populate(options.populate);
      if (options.sort) query = query.sort(options.sort);
      if (options.lean) query = query.lean();
      
      return await query.exec();
    } catch (error) {
      throw this.handleError(error, 'findOne');
    }
  }

  /**
   * Find multiple documents
   * @param {Object} filter - Query filter
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Found documents
   */
  async find(filter = {}, options = {}) {
    try {
      let query = this.model.find(filter);
      
      if (options.select) query = query.select(options.select);
      if (options.populate) query = query.populate(options.populate);
      if (options.sort) query = query.sort(options.sort);
      if (options.limit) query = query.limit(options.limit);
      if (options.skip) query = query.skip(options.skip);
      if (options.lean) query = query.lean();
      
      return await query.exec();
    } catch (error) {
      throw this.handleError(error, 'find');
    }
  }

  /**
   * Find documents with pagination
   * @param {Object} filter - Query filter
   * @param {Object} options - Query options including page, limit
   * @returns {Promise<Object>} Paginated results
   */
  async findPaginated(filter = {}, options = {}) {
    try {
      const { page = 1, limit = 10, sort = { createdAt: -1 }, ...queryOptions } = options;
      const skip = (page - 1) * limit;

      const [documents, total] = await Promise.all([
        this.find(filter, { ...queryOptions, sort, limit, skip }),
        this.count(filter)
      ]);

      return {
        documents,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      };
    } catch (error) {
      throw this.handleError(error, 'findPaginated');
    }
  }

  /**
   * Update document by ID
   * @param {string} id - Document ID
   * @param {Object} update - Update data
   * @param {Object} options - Update options
   * @returns {Promise<Object|null>} Updated document
   */
  async updateById(id, update, options = {}) {
    try {
      const defaultOptions = { new: true, runValidators: true };
      return await this.model.findByIdAndUpdate(id, update, { ...defaultOptions, ...options });
    } catch (error) {
      throw this.handleError(error, 'updateById');
    }
  }

  /**
   * Update one document by filter
   * @param {Object} filter - Query filter
   * @param {Object} update - Update data
   * @param {Object} options - Update options
   * @returns {Promise<Object|null>} Updated document
   */
  async updateOne(filter, update, options = {}) {
    try {
      const defaultOptions = { new: true, runValidators: true };
      return await this.model.findOneAndUpdate(filter, update, { ...defaultOptions, ...options });
    } catch (error) {
      throw this.handleError(error, 'updateOne');
    }
  }

  /**
   * Update multiple documents
   * @param {Object} filter - Query filter
   * @param {Object} update - Update data
   * @param {Object} options - Update options
   * @returns {Promise<Object>} Update result
   */
  async updateMany(filter, update, options = {}) {
    try {
      return await this.model.updateMany(filter, update, options);
    } catch (error) {
      throw this.handleError(error, 'updateMany');
    }
  }

  /**
   * Delete document by ID
   * @param {string} id - Document ID
   * @param {Object} options - Delete options
   * @returns {Promise<Object|null>} Deleted document
   */
  async deleteById(id, options = {}) {
    try {
      return await this.model.findByIdAndDelete(id, options);
    } catch (error) {
      throw this.handleError(error, 'deleteById');
    }
  }

  /**
   * Delete one document by filter
   * @param {Object} filter - Query filter
   * @param {Object} options - Delete options
   * @returns {Promise<Object|null>} Deleted document
   */
  async deleteOne(filter, options = {}) {
    try {
      return await this.model.findOneAndDelete(filter, options);
    } catch (error) {
      throw this.handleError(error, 'deleteOne');
    }
  }

  /**
   * Delete multiple documents
   * @param {Object} filter - Query filter
   * @param {Object} options - Delete options
   * @returns {Promise<Object>} Delete result
   */
  async deleteMany(filter, options = {}) {
    try {
      return await this.model.deleteMany(filter, options);
    } catch (error) {
      throw this.handleError(error, 'deleteMany');
    }
  }

  /**
   * Count documents
   * @param {Object} filter - Query filter
   * @returns {Promise<number>} Document count
   */
  async count(filter = {}) {
    try {
      return await this.model.countDocuments(filter);
    } catch (error) {
      throw this.handleError(error, 'count');
    }
  }

  /**
   * Check if document exists
   * @param {Object} filter - Query filter
   * @returns {Promise<boolean>} Existence status
   */
  async exists(filter) {
    try {
      const doc = await this.model.findOne(filter, { _id: 1 }).lean();
      return !!doc;
    } catch (error) {
      throw this.handleError(error, 'exists');
    }
  }

  /**
   * Get distinct values for a field
   * @param {string} field - Field name
   * @param {Object} filter - Query filter
   * @returns {Promise<Array>} Distinct values
   */
  async distinct(field, filter = {}) {
    try {
      return await this.model.distinct(field, filter);
    } catch (error) {
      throw this.handleError(error, 'distinct');
    }
  }

  /**
   * Aggregate query
   * @param {Array} pipeline - Aggregation pipeline
   * @param {Object} options - Aggregation options
   * @returns {Promise<Array>} Aggregation results
   */
  async aggregate(pipeline, options = {}) {
    try {
      return await this.model.aggregate(pipeline, options);
    } catch (error) {
      throw this.handleError(error, 'aggregate');
    }
  }

  /**
   * Find documents near a geographic point (requires 2dsphere index)
   * @param {Object} point - GeoJSON Point or {latitude, longitude}
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Nearby documents
   */
  async findNear(point, options = {}) {
    try {
      const {
        locationField = 'location', // Default field name
        maxDistance = 10000, // meters
        minDistance = 0,
        ...queryOptions
      } = options;

      // Normalize point to GeoJSON format
      let geoJsonPoint;
      if (point.type === 'Point' && point.coordinates) {
        geoJsonPoint = point;
      } else if (point.latitude !== undefined && point.longitude !== undefined) {
        geoJsonPoint = {
          type: 'Point',
          coordinates: [point.longitude, point.latitude]
        };
      } else if (point.lat !== undefined && point.lng !== undefined) {
        geoJsonPoint = {
          type: 'Point',
          coordinates: [point.lng, point.lat]
        };
      } else {
        throw new Error('Invalid point format. Expected GeoJSON Point, {latitude, longitude}, or {lat, lng}');
      }

      const filter = {
        [locationField]: {
          $near: {
            $geometry: geoJsonPoint,
            $maxDistance: maxDistance,
            ...(minDistance > 0 && { $minDistance: minDistance })
          }
        }
      };

      return await this.find(filter, queryOptions);
    } catch (error) {
      throw this.handleError(error, 'findNear');
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
      const { locationField = 'location', ...queryOptions } = options;
      const { minLat, maxLat, minLng, maxLng } = bounds;

      const filter = {
        [locationField]: {
          $geoWithin: {
            $box: [[minLng, minLat], [maxLng, maxLat]]
          }
        }
      };

      return await this.find(filter, queryOptions);
    } catch (error) {
      throw this.handleError(error, 'findWithinBounds');
    }
  }

  /**
   * Bulk write operations
   * @param {Array} operations - Array of bulk operations
   * @param {Object} options - Bulk write options
   * @returns {Promise<Object>} Bulk write result
   */
  async bulkWrite(operations, options = {}) {
    try {
      return await this.model.bulkWrite(operations, options);
    } catch (error) {
      throw this.handleError(error, 'bulkWrite');
    }
  }

  /**
   * Handle database errors with context
   * @param {Error} error - Original error
   * @param {string} operation - Operation that failed
   * @returns {Error} Enhanced error
   */
  handleError(error, operation) {
    const message = `${this.modelName} repository ${operation} failed: ${error.message}`;
    const enhancedError = new Error(message);
    enhancedError.originalError = error;
    enhancedError.operation = operation;
    enhancedError.model = this.modelName;
    enhancedError.stack = error.stack;
    return enhancedError;
  }

  /**
   * Start a database transaction
   * @returns {Promise<Object>} Transaction session
   */
  async startTransaction() {
    try {
      const session = await this.model.db.startSession();
      session.startTransaction();
      return session;
    } catch (error) {
      throw this.handleError(error, 'startTransaction');
    }
  }

  /**
   * Execute operations within a transaction
   * @param {Function} operations - Function containing operations
   * @returns {Promise<any>} Transaction result
   */
  async withTransaction(operations) {
    const session = await this.startTransaction();
    try {
      const result = await operations(session);
      await session.commitTransaction();
      return result;
    } catch (error) {
      await session.abortTransaction();
      throw this.handleError(error, 'withTransaction');
    } finally {
      session.endSession();
    }
  }
}

module.exports = BaseRepository;