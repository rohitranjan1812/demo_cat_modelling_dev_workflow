/**
 * Base Service Class for CAT Modeling Platform
 * Provides common CRUD operations and database interactions
 */

class BaseService {
  constructor(model) {
    this.model = model;
  }

  /**
   * Create a new document
   * @param {Object} data - Document data
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Created document
   */
  async create(data, options = {}) {
    try {
      const document = new this.model(data);
      const savedDocument = await document.save();
      
      if (options.populate) {
        return await this.model.findById(savedDocument._id).populate(options.populate);
      }
      
      return savedDocument;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Find documents with filtering and pagination
   * @param {Object} filter - MongoDB filter
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Query result with pagination
   */
  async find(filter = {}, options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        sort = { createdAt: -1 },
        populate = [],
        select = null
      } = options;

      const skip = (page - 1) * limit;
      
      let query = this.model.find(filter);
      
      if (select) {
        query = query.select(select);
      }
      
      if (populate.length > 0) {
        populate.forEach(field => {
          query = query.populate(field);
        });
      }
      
      const [documents, total] = await Promise.all([
        query.sort(sort).skip(skip).limit(parseInt(limit)).exec(),
        this.model.countDocuments(filter)
      ]);

      return {
        data: documents,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
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
        populate = []
      } = options;

      const updateOptions = { new: returnNew, runValidators };
      
      let updatedDocument = await this.model.findByIdAndUpdate(id, data, updateOptions);
      
      if (!updatedDocument) {
        throw new Error('Document not found');
      }
      
      if (populate.length > 0) {
        let query = this.model.findById(updatedDocument._id);
        populate.forEach(field => {
          query = query.populate(field);
        });
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
      const { soft = false } = options;
      
      if (soft) {
        // Soft delete - update status to inactive
        return await this.updateById(id, { 
          status: 'Inactive',
          deletedAt: new Date()
        });
      } else {
        // Hard delete
        const deletedDocument = await this.model.findByIdAndDelete(id);
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
   * Find documents near a specific point using GeoJSON 2dsphere queries
   * @param {Object} point - Point coordinates (can be {lat, lng} or GeoJSON or {latitude, longitude})
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Nearby documents
   */
  async findNear(point, options = {}) {
    try {
      const {
        locationField = 'footprint.center', // Default to hazard center, can override for other models
        maxDistance = 10000, // meters
        ...queryOptions
      } = options;

      // Normalize point input to GeoJSON format
      let geoJsonPoint;
      
      if (point.type === 'Point' && point.coordinates) {
        // Already GeoJSON format
        geoJsonPoint = point;
      } else if (point.latitude !== undefined && point.longitude !== undefined) {
        // {latitude, longitude} format
        geoJsonPoint = {
          type: 'Point',
          coordinates: [point.longitude, point.latitude]
        };
      } else if (point.lat !== undefined && point.lng !== undefined) {
        // {lat, lng} format
        geoJsonPoint = {
          type: 'Point',
          coordinates: [point.lng, point.lat]
        };
      } else if (Array.isArray(point) && point.length === 2) {
        // [lng, lat] array format
        geoJsonPoint = {
          type: 'Point',
          coordinates: point
        };
      } else {
        throw new Error('Invalid point format. Expected GeoJSON Point, {latitude, longitude}, {lat, lng}, or [lng, lat]');
      }

      const filter = {
        [locationField]: {
          $near: {
            $geometry: geoJsonPoint,
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
   * Validate document data
   * @param {Object} data - Document data
   * @param {Object} options - Validation options
   * @returns {Promise<Object>} Validation result
   */
  async validate(data, options = {}) {
    try {
      const { skipRequired = false } = options;
      
      const document = new this.model(data);
      
      if (skipRequired) {
        // Skip required field validation
        return { isValid: true, errors: [] };
      }
      
      await document.validate();
      return { isValid: true, errors: [] };
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
   * Handle errors consistently
   * @param {Error} error - Error object
   * @returns {Error} Processed error
   */
  handleError(error) {
    console.error(`[${this.model.modelName}] Service Error:`, error);

    if (error.name === 'ValidationError') {
      const validationError = new Error('Validation failed');
      validationError.name = 'ValidationError';
      validationError.details = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message,
        value: err.value
      }));
      return validationError;
    }

    if (error.name === 'CastError') {
      const castError = new Error('Invalid ID format');
      castError.name = 'CastError';
      return castError;
    }

    if (error.code === 11000) {
      const duplicateError = new Error('Duplicate entry');
      duplicateError.name = 'DuplicateError';
      duplicateError.field = Object.keys(error.keyPattern)[0];
      return duplicateError;
    }

    return error;
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
