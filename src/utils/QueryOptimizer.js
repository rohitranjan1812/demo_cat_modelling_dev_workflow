/**
 * Query Optimizer
 * Database query optimization and performance enhancement utilities
 */

const { globalPerformanceMonitor } = require('./PerformanceMonitor');
const { queryCache } = require('./CacheManager');

class QueryOptimizer {
  constructor() {
    this.queryPatterns = new Map();
    this.indexRecommendations = new Map();
    this.slowQueries = new Map();
    this.queryStats = new Map();
    this.optimizationRules = new Map();
    this.isEnabled = process.env.QUERY_OPTIMIZATION !== 'false';
    
    this.initializeOptimizationRules();
  }

  /**
   * Initialize built-in optimization rules
   */
  initializeOptimizationRules() {
    // Rule: Use projection to reduce data transfer
    this.addOptimizationRule('projection', (query) => {
      if (!query.select && query.model) {
        return {
          optimized: true,
          suggestion: 'Consider using .select() to limit returned fields',
          impact: 'medium',
          example: `${query.model}.find(filter).select('field1 field2')`
        };
      }
      return { optimized: false };
    });

    // Rule: Use indexes for common filter fields
    this.addOptimizationRule('indexing', (query) => {
      const commonFilterFields = ['createdAt', 'updatedAt', 'status', 'userId', 'accountId'];
      const filterFields = Object.keys(query.filter || {});
      const needsIndex = filterFields.filter(field => commonFilterFields.includes(field));
      
      if (needsIndex.length > 0) {
        return {
          optimized: true,
          suggestion: `Consider adding indexes for fields: ${needsIndex.join(', ')}`,
          impact: 'high',
          fields: needsIndex
        };
      }
      return { optimized: false };
    });

    // Rule: Limit large result sets
    this.addOptimizationRule('pagination', (query) => {
      if (!query.limit || query.limit > 1000) {
        return {
          optimized: true,
          suggestion: 'Consider adding pagination for large result sets',
          impact: 'high',
          recommendation: 'Use .limit() and .skip() for pagination'
        };
      }
      return { optimized: false };
    });

    // Rule: Use lean queries for read-only operations
    this.addOptimizationRule('lean', (query) => {
      if (!query.lean && query.operation === 'find') {
        return {
          optimized: true,
          suggestion: 'Use .lean() for read-only queries to improve performance',
          impact: 'medium',
          example: `${query.model}.find(filter).lean()`
        };
      }
      return { optimized: false };
    });
  }

  /**
   * Add optimization rule
   * @param {string} name - Rule name
   * @param {Function} rule - Optimization rule function
   */
  addOptimizationRule(name, rule) {
    this.optimizationRules.set(name, rule);
  }

  /**
   * Analyze and optimize query
   * @param {Object} queryInfo - Query information
   * @returns {Object} Optimization result
   */
  optimizeQuery(queryInfo) {
    if (!this.isEnabled) return { optimized: false };

    const timerId = globalPerformanceMonitor.startTimer('query_optimization');
    
    try {
      const optimizations = [];
      const recommendations = [];
      
      // Apply all optimization rules
      for (const [ruleName, rule] of this.optimizationRules.entries()) {
        try {
          const result = rule(queryInfo);
          if (result.optimized) {
            optimizations.push({
              rule: ruleName,
              ...result
            });
          }
        } catch (error) {
          console.warn(`Optimization rule ${ruleName} failed:`, error);
        }
      }

      // Generate cache key if query is cacheable
      let cacheKey = null;
      if (this.isCacheable(queryInfo)) {
        cacheKey = this.generateCacheKey(queryInfo);
      }

      // Check for common patterns
      const pattern = this.identifyQueryPattern(queryInfo);
      
      const result = {
        originalQuery: queryInfo,
        optimizations,
        cacheKey,
        pattern,
        recommendations: optimizations.map(opt => opt.suggestion),
        estimatedImpact: this.calculateImpact(optimizations),
        timestamp: Date.now()
      };

      // Record query pattern
      this.recordQueryPattern(queryInfo, result);
      
      globalPerformanceMonitor.endTimer(timerId);
      return result;
      
    } catch (error) {
      globalPerformanceMonitor.endTimer(timerId);
      console.error('Query optimization failed:', error);
      return { optimized: false, error: error.message };
    }
  }

  /**
   * Check if query is cacheable
   * @param {Object} queryInfo - Query information
   * @returns {boolean} Cacheable status
   */
  isCacheable(queryInfo) {
    // Don't cache writes or aggregations
    if (queryInfo.operation !== 'find' && queryInfo.operation !== 'findOne') {
      return false;
    }
    
    // Don't cache queries with dynamic filters (like current date)
    const filter = queryInfo.filter || {};
    const filterStr = JSON.stringify(filter);
    
    if (filterStr.includes('$now') || filterStr.includes('Date.now')) {
      return false;
    }
    
    // Cache simple queries
    return Object.keys(filter).length > 0 && Object.keys(filter).length <= 5;
  }

  /**
   * Generate cache key for query
   * @param {Object} queryInfo - Query information
   * @returns {string} Cache key
   */
  generateCacheKey(queryInfo) {
    const keyData = {
      model: queryInfo.model,
      operation: queryInfo.operation,
      filter: queryInfo.filter,
      select: queryInfo.select,
      sort: queryInfo.sort,
      limit: queryInfo.limit,
      populate: queryInfo.populate
    };
    
    return `query:${Buffer.from(JSON.stringify(keyData)).toString('base64')}`;
  }

  /**
   * Identify query pattern
   * @param {Object} queryInfo - Query information
   * @returns {string} Pattern name
   */
  identifyQueryPattern(queryInfo) {
    const { filter = {}, operation, sort, limit } = queryInfo;
    const filterKeys = Object.keys(filter).sort();
    
    // Common patterns
    if (filterKeys.includes('_id') && filterKeys.length === 1) {
      return 'single_document_by_id';
    }
    
    if (filterKeys.includes('userId') || filterKeys.includes('accountId')) {
      return 'user_scoped_query';
    }
    
    if (filterKeys.includes('createdAt') || filterKeys.includes('updatedAt')) {
      return 'time_range_query';
    }
    
    if (operation === 'find' && sort && limit) {
      return 'paginated_list';
    }
    
    if (filterKeys.length > 3) {
      return 'complex_filter';
    }
    
    return 'generic_query';
  }

  /**
   * Calculate impact of optimizations
   * @param {Array} optimizations - Array of optimizations
   * @returns {string} Impact level
   */
  calculateImpact(optimizations) {
    const impacts = optimizations.map(opt => opt.impact);
    
    if (impacts.includes('high')) return 'high';
    if (impacts.includes('medium')) return 'medium';
    if (impacts.includes('low')) return 'low';
    
    return 'none';
  }

  /**
   * Record query pattern for analysis
   * @param {Object} queryInfo - Query information
   * @param {Object} optimizationResult - Optimization result
   */
  recordQueryPattern(queryInfo, optimizationResult) {
    const pattern = optimizationResult.pattern;
    
    if (!this.queryPatterns.has(pattern)) {
      this.queryPatterns.set(pattern, {
        pattern,
        count: 0,
        avgOptimizations: 0,
        examples: [],
        lastSeen: Date.now()
      });
    }
    
    const patternData = this.queryPatterns.get(pattern);
    patternData.count++;
    patternData.lastSeen = Date.now();
    
    // Keep recent examples
    if (patternData.examples.length < 5) {
      patternData.examples.push({
        query: queryInfo,
        optimizations: optimizationResult.optimizations.length,
        timestamp: Date.now()
      });
    }
    
    // Update average optimizations
    patternData.avgOptimizations = (patternData.avgOptimizations + optimizationResult.optimizations.length) / 2;
  }

  /**
   * Record slow query for analysis
   * @param {Object} queryInfo - Query information
   * @param {number} duration - Query duration in ms
   */
  recordSlowQuery(queryInfo, duration) {
    const threshold = 1000; // 1 second
    
    if (duration > threshold) {
      const key = this.generateCacheKey(queryInfo);
      
      if (!this.slowQueries.has(key)) {
        this.slowQueries.set(key, {
          query: queryInfo,
          count: 0,
          totalDuration: 0,
          avgDuration: 0,
          maxDuration: 0,
          firstSeen: Date.now(),
          lastSeen: Date.now()
        });
      }
      
      const slowQuery = this.slowQueries.get(key);
      slowQuery.count++;
      slowQuery.totalDuration += duration;
      slowQuery.avgDuration = slowQuery.totalDuration / slowQuery.count;
      slowQuery.maxDuration = Math.max(slowQuery.maxDuration, duration);
      slowQuery.lastSeen = Date.now();
      
      // Log critical slow queries
      if (duration > 5000) { // 5 seconds
        console.warn(`[CRITICAL SLOW QUERY] ${duration}ms:`, queryInfo);
      }
    }
  }

  /**
   * Get index recommendations
   * @param {string} model - Model name
   * @returns {Array} Index recommendations
   */
  getIndexRecommendations(model = null) {
    if (model) {
      return this.indexRecommendations.get(model) || [];
    }
    
    const allRecommendations = {};
    for (const [modelName, recommendations] of this.indexRecommendations.entries()) {
      allRecommendations[modelName] = recommendations;
    }
    return allRecommendations;
  }

  /**
   * Add index recommendation
   * @param {string} model - Model name
   * @param {Object} indexSpec - Index specification
   * @param {string} reason - Reason for recommendation
   */
  addIndexRecommendation(model, indexSpec, reason) {
    if (!this.indexRecommendations.has(model)) {
      this.indexRecommendations.set(model, []);
    }
    
    const recommendations = this.indexRecommendations.get(model);
    recommendations.push({
      model,
      indexSpec,
      reason,
      priority: this.calculateIndexPriority(indexSpec, reason),
      timestamp: Date.now()
    });
    
    // Keep only top 10 recommendations per model
    recommendations.sort((a, b) => b.priority - a.priority);
    if (recommendations.length > 10) {
      recommendations.splice(10);
    }
  }

  /**
   * Calculate index priority
   * @param {Object} indexSpec - Index specification
   * @param {string} reason - Reason for index
   * @returns {number} Priority score
   */
  calculateIndexPriority(indexSpec, reason) {
    let priority = 50; // Base priority
    
    const fields = Object.keys(indexSpec);
    
    // Higher priority for single field indexes
    if (fields.length === 1) priority += 20;
    
    // Higher priority for common fields
    const highPriorityFields = ['_id', 'userId', 'accountId', 'createdAt', 'status'];
    if (fields.some(field => highPriorityFields.includes(field))) {
      priority += 30;
    }
    
    // Higher priority based on reason
    if (reason.includes('slow query')) priority += 40;
    if (reason.includes('frequent access')) priority += 25;
    
    return priority;
  }

  /**
   * Get query statistics
   * @returns {Object} Query statistics
   */
  getStatistics() {
    return {
      patterns: Array.from(this.queryPatterns.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
      slowQueries: Array.from(this.slowQueries.values())
        .sort((a, b) => b.avgDuration - a.avgDuration)
        .slice(0, 10),
      indexRecommendations: this.getIndexRecommendations(),
      totalPatterns: this.queryPatterns.size,
      totalSlowQueries: this.slowQueries.size,
      optimizationRules: this.optimizationRules.size
    };
  }

  /**
   * Clear old query data
   * @param {number} maxAge - Maximum age in milliseconds
   */
  cleanup(maxAge = 24 * 60 * 60 * 1000) { // 24 hours
    const cutoff = Date.now() - maxAge;
    
    // Clean old patterns
    for (const [pattern, data] of this.queryPatterns.entries()) {
      if (data.lastSeen < cutoff) {
        this.queryPatterns.delete(pattern);
      }
    }
    
    // Clean old slow queries
    for (const [key, data] of this.slowQueries.entries()) {
      if (data.lastSeen < cutoff) {
        this.slowQueries.delete(key);
      }
    }
  }

  /**
   * Generate optimization report
   * @returns {Object} Optimization report
   */
  generateReport() {
    const stats = this.getStatistics();
    
    return {
      summary: {
        totalPatterns: stats.totalPatterns,
        totalSlowQueries: stats.totalSlowQueries,
        topPatterns: stats.patterns.slice(0, 5).map(p => ({
          pattern: p.pattern,
          count: p.count,
          avgOptimizations: p.avgOptimizations.toFixed(2)
        })),
        criticalSlowQueries: stats.slowQueries.filter(q => q.avgDuration > 5000).length
      },
      recommendations: {
        indexes: Object.values(stats.indexRecommendations).flat()
          .sort((a, b) => b.priority - a.priority)
          .slice(0, 10),
        queryOptimizations: this.generateQueryOptimizations(stats)
      },
      performance: {
        patterns: stats.patterns,
        slowQueries: stats.slowQueries.map(q => ({
          duration: q.avgDuration,
          count: q.count,
          query: q.query
        }))
      },
      timestamp: Date.now()
    };
  }

  /**
   * Generate query optimization recommendations
   * @param {Object} stats - Query statistics
   * @returns {Array} Optimization recommendations
   */
  generateQueryOptimizations(stats) {
    const recommendations = [];
    
    // Frequent patterns without optimization
    for (const pattern of stats.patterns) {
      if (pattern.count > 100 && pattern.avgOptimizations > 2) {
        recommendations.push({
          type: 'frequent_unoptimized',
          pattern: pattern.pattern,
          count: pattern.count,
          suggestion: `Pattern '${pattern.pattern}' appears frequently but has optimization opportunities`,
          priority: 'high'
        });
      }
    }
    
    // Slow queries
    for (const slowQuery of stats.slowQueries) {
      if (slowQuery.avgDuration > 2000) {
        recommendations.push({
          type: 'slow_query',
          duration: slowQuery.avgDuration,
          count: slowQuery.count,
          suggestion: 'Consider adding indexes or optimizing query structure',
          priority: slowQuery.avgDuration > 5000 ? 'critical' : 'high'
        });
      }
    }
    
    return recommendations.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }
}

// Global query optimizer instance
const globalQueryOptimizer = new QueryOptimizer();

module.exports = {
  QueryOptimizer,
  globalQueryOptimizer
};