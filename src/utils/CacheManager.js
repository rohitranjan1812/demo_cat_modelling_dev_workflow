/**
 * Cache Manager
 * Advanced caching system with multiple cache types and strategies
 */

class CacheManager {
  constructor() {
    this.caches = new Map();
    this.defaultTTL = 5 * 60 * 1000; // 5 minutes
    this.maxSize = 10000; // Maximum number of entries per cache
    this.statistics = new Map();
    this.cleanupInterval = null;
    this.compressionEnabled = process.env.CACHE_COMPRESSION === 'true';
    
    // Start cleanup interval
    this.startCleanupInterval();
  }

  /**
   * Create a new cache instance
   * @param {string} name - Cache name
   * @param {Object} options - Cache configuration
   * @returns {Cache} Cache instance
   */
  createCache(name, options = {}) {
    const cache = new Cache(name, {
      ttl: options.ttl || this.defaultTTL,
      maxSize: options.maxSize || this.maxSize,
      strategy: options.strategy || 'lru',
      onEviction: options.onEviction,
      serialize: options.serialize || false,
      compress: options.compress || this.compressionEnabled,
      ...options
    });

    this.caches.set(name, cache);
    this.statistics.set(name, {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      evictions: 0,
      size: 0,
      hitRate: 0,
      lastAccessed: Date.now()
    });

    return cache;
  }

  /**
   * Get cache instance
   * @param {string} name - Cache name
   * @returns {Cache|null} Cache instance or null
   */
  getCache(name) {
    return this.caches.get(name) || null;
  }

  /**
   * Get or create cache
   * @param {string} name - Cache name
   * @param {Object} options - Cache configuration
   * @returns {Cache} Cache instance
   */
  cache(name, options = {}) {
    return this.getCache(name) || this.createCache(name, options);
  }

  /**
   * Delete a cache
   * @param {string} name - Cache name
   * @returns {boolean} Success status
   */
  deleteCache(name) {
    const cache = this.caches.get(name);
    if (cache) {
      cache.clear();
      this.caches.delete(name);
      this.statistics.delete(name);
      return true;
    }
    return false;
  }

  /**
   * Update cache statistics
   * @param {string} cacheName - Cache name
   * @param {string} operation - Operation type
   */
  updateStatistics(cacheName, operation, additional = {}) {
    const stats = this.statistics.get(cacheName);
    if (stats) {
      stats[operation]++;
      stats.lastAccessed = Date.now();
      
      // Update hit rate
      const total = stats.hits + stats.misses;
      stats.hitRate = total > 0 ? (stats.hits / total * 100).toFixed(2) : 0;
      
      // Update additional stats
      Object.assign(stats, additional);
    }
  }

  /**
   * Get cache statistics
   * @param {string} cacheName - Cache name (optional)
   * @returns {Object} Cache statistics
   */
  getStatistics(cacheName = null) {
    if (cacheName) {
      const stats = this.statistics.get(cacheName);
      const cache = this.caches.get(cacheName);
      return stats ? {
        ...stats,
        size: cache ? cache.size : 0,
        memoryUsage: cache ? cache.getMemoryUsage() : 0
      } : null;
    }

    const allStats = {};
    for (const [name, stats] of this.statistics.entries()) {
      const cache = this.caches.get(name);
      allStats[name] = {
        ...stats,
        size: cache ? cache.size : 0,
        memoryUsage: cache ? cache.getMemoryUsage() : 0
      };
    }
    return allStats;
  }

  /**
   * Start cleanup interval
   */
  startCleanupInterval() {
    if (this.cleanupInterval) return;
    
    this.cleanupInterval = setInterval(() => {
      for (const cache of this.caches.values()) {
        cache.cleanup();
      }
    }, 60000); // Cleanup every minute
  }

  /**
   * Stop cleanup interval
   */
  stopCleanupInterval() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  /**
   * Clear all caches
   */
  clearAll() {
    for (const cache of this.caches.values()) {
      cache.clear();
    }
  }

  /**
   * Get memory usage for all caches
   * @returns {Object} Memory usage statistics
   */
  getMemoryUsage() {
    let totalMemory = 0;
    const cacheMemory = {};
    
    for (const [name, cache] of this.caches.entries()) {
      const memory = cache.getMemoryUsage();
      cacheMemory[name] = memory;
      totalMemory += memory;
    }
    
    return {
      total: totalMemory,
      caches: cacheMemory,
      overhead: process.memoryUsage().heapUsed - totalMemory
    };
  }
}

/**
 * Individual Cache Implementation
 */
class Cache {
  constructor(name, options = {}) {
    this.name = name;
    this.data = new Map();
    this.ttl = options.ttl || 5 * 60 * 1000;
    this.maxSize = options.maxSize || 10000;
    this.strategy = options.strategy || 'lru';
    this.onEviction = options.onEviction;
    this.serialize = options.serialize || false;
    this.compress = options.compress || false;
    this.accessOrder = []; // For LRU strategy
    this.creationTime = Date.now();
  }

  /**
   * Get value from cache
   * @param {string} key - Cache key
   * @returns {any} Cached value or null
   */
  get(key) {
    const entry = this.data.get(key);
    
    if (!entry) {
      globalCacheManager.updateStatistics(this.name, 'misses');
      return null;
    }

    // Check TTL
    if (this.isExpired(entry)) {
      this.delete(key);
      globalCacheManager.updateStatistics(this.name, 'misses');
      return null;
    }

    // Update access time and order for LRU
    entry.lastAccessed = Date.now();
    entry.accessCount++;
    
    if (this.strategy === 'lru') {
      this.updateAccessOrder(key);
    }

    globalCacheManager.updateStatistics(this.name, 'hits');
    
    // Deserialize if needed
    let value = entry.value;
    if (this.serialize && typeof value === 'string') {
      try {
        value = JSON.parse(value);
      } catch (error) {
        console.warn(`Failed to deserialize cache entry for key ${key}:`, error);
        return null;
      }
    }

    return value;
  }

  /**
   * Set value in cache
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} ttl - Time to live override
   * @returns {boolean} Success status
   */
  set(key, value, ttl = null) {
    try {
      // Serialize if needed
      let serializedValue = value;
      if (this.serialize) {
        serializedValue = JSON.stringify(value);
      }

      // Check size limit and evict if necessary
      if (this.data.size >= this.maxSize && !this.data.has(key)) {
        this.evict();
      }

      const entry = {
        key,
        value: serializedValue,
        createdAt: Date.now(),
        lastAccessed: Date.now(),
        accessCount: 0,
        ttl: ttl || this.ttl,
        size: this.calculateSize(serializedValue)
      };

      this.data.set(key, entry);
      
      if (this.strategy === 'lru') {
        this.updateAccessOrder(key);
      }

      globalCacheManager.updateStatistics(this.name, 'sets', { size: this.data.size });
      return true;
      
    } catch (error) {
      console.error(`Failed to set cache entry for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Delete value from cache
   * @param {string} key - Cache key
   * @returns {boolean} Success status
   */
  delete(key) {
    const existed = this.data.has(key);
    
    if (existed) {
      this.data.delete(key);
      
      if (this.strategy === 'lru') {
        const index = this.accessOrder.indexOf(key);
        if (index > -1) {
          this.accessOrder.splice(index, 1);
        }
      }
      
      globalCacheManager.updateStatistics(this.name, 'deletes', { size: this.data.size });
    }
    
    return existed;
  }

  /**
   * Check if key exists in cache
   * @param {string} key - Cache key
   * @returns {boolean} Exists status
   */
  has(key) {
    const entry = this.data.get(key);
    return entry && !this.isExpired(entry);
  }

  /**
   * Clear all entries from cache
   */
  clear() {
    this.data.clear();
    this.accessOrder = [];
    globalCacheManager.updateStatistics(this.name, 'sets', { size: 0 });
  }

  /**
   * Get cache size
   * @returns {number} Number of entries
   */
  get size() {
    return this.data.size;
  }

  /**
   * Get all keys
   * @returns {Array} Array of keys
   */
  keys() {
    return Array.from(this.data.keys());
  }

  /**
   * Get all values
   * @returns {Array} Array of values
   */
  values() {
    const values = [];
    for (const [key, entry] of this.data.entries()) {
      if (!this.isExpired(entry)) {
        values.push(this.get(key)); // Use get to handle deserialization
      }
    }
    return values;
  }

  /**
   * Check if entry is expired
   * @param {Object} entry - Cache entry
   * @returns {boolean} Expired status
   */
  isExpired(entry) {
    return Date.now() - entry.createdAt > entry.ttl;
  }

  /**
   * Update access order for LRU
   * @param {string} key - Cache key
   */
  updateAccessOrder(key) {
    const index = this.accessOrder.indexOf(key);
    if (index > -1) {
      this.accessOrder.splice(index, 1);
    }
    this.accessOrder.push(key);
  }

  /**
   * Evict entries based on strategy
   */
  evict() {
    let keyToEvict = null;

    if (this.strategy === 'lru') {
      keyToEvict = this.accessOrder[0];
    } else if (this.strategy === 'lfu') {
      // Least Frequently Used
      let minAccessCount = Infinity;
      for (const [key, entry] of this.data.entries()) {
        if (entry.accessCount < minAccessCount) {
          minAccessCount = entry.accessCount;
          keyToEvict = key;
        }
      }
    } else if (this.strategy === 'fifo') {
      // First In, First Out
      let oldestTime = Date.now();
      for (const [key, entry] of this.data.entries()) {
        if (entry.createdAt < oldestTime) {
          oldestTime = entry.createdAt;
          keyToEvict = key;
        }
      }
    }

    if (keyToEvict) {
      const entry = this.data.get(keyToEvict);
      if (this.onEviction) {
        try {
          this.onEviction(keyToEvict, entry.value);
        } catch (error) {
          console.error('Cache eviction callback failed:', error);
        }
      }
      
      this.delete(keyToEvict);
      globalCacheManager.updateStatistics(this.name, 'evictions');
    }
  }

  /**
   * Clean up expired entries
   */
  cleanup() {
    const keysToDelete = [];
    
    for (const [key, entry] of this.data.entries()) {
      if (this.isExpired(entry)) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => this.delete(key));
  }

  /**
   * Calculate approximate size of value
   * @param {any} value - Value to measure
   * @returns {number} Approximate size in bytes
   */
  calculateSize(value) {
    if (typeof value === 'string') {
      return value.length * 2; // Rough estimate for UTF-16
    } else if (typeof value === 'number') {
      return 8;
    } else if (typeof value === 'boolean') {
      return 4;
    } else if (value === null || value === undefined) {
      return 0;
    } else {
      // For objects, use JSON string length as approximation
      try {
        return JSON.stringify(value).length * 2;
      } catch (error) {
        return 1000; // Default estimate
      }
    }
  }

  /**
   * Get memory usage of cache
   * @returns {number} Memory usage in bytes
   */
  getMemoryUsage() {
    let totalSize = 0;
    
    for (const entry of this.data.values()) {
      totalSize += entry.size || 0;
      totalSize += 200; // Overhead for entry object
    }
    
    return totalSize;
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache statistics
   */
  getStats() {
    return {
      name: this.name,
      size: this.data.size,
      maxSize: this.maxSize,
      ttl: this.ttl,
      strategy: this.strategy,
      memoryUsage: this.getMemoryUsage(),
      creationTime: this.creationTime,
      uptime: Date.now() - this.creationTime
    };
  }
}

// Create global cache manager instance
const globalCacheManager = new CacheManager();

// Create commonly used caches
const queryCache = globalCacheManager.createCache('database_queries', {
  ttl: 5 * 60 * 1000, // 5 minutes
  maxSize: 1000,
  strategy: 'lru'
});

const sessionCache = globalCacheManager.createCache('user_sessions', {
  ttl: 30 * 60 * 1000, // 30 minutes
  maxSize: 5000,
  strategy: 'lru'
});

const computationCache = globalCacheManager.createCache('computations', {
  ttl: 60 * 60 * 1000, // 1 hour
  maxSize: 500,
  strategy: 'lfu',
  serialize: true
});

module.exports = {
  CacheManager,
  Cache,
  globalCacheManager,
  queryCache,
  sessionCache,
  computationCache
};