/**
 * Performance Optimization Framework Tests
 * Tests for performance monitoring, caching, and query optimization
 */

const { PerformanceMonitor, globalPerformanceMonitor } = require('../../src/utils/PerformanceMonitor');
const { CacheManager, Cache, queryCache } = require('../../src/utils/CacheManager');
const { QueryOptimizer, globalQueryOptimizer } = require('../../src/utils/QueryOptimizer');

describe('Performance Optimization Framework', () => {
  describe('PerformanceMonitor', () => {
    let monitor;

    beforeEach(() => {
      monitor = new PerformanceMonitor();
    });

    afterEach(() => {
      monitor.reset();
    });

    describe('Timer Operations', () => {
      test('should start and end timers correctly', async () => {
        const timerId = monitor.startTimer('test_operation', { context: 'test' });
        expect(timerId).toBeDefined();
        expect(monitor.timers.size).toBe(1);

        // Simulate some work
        await new Promise(resolve => setTimeout(resolve, 10));

        const result = monitor.endTimer(timerId);
        expect(result).toMatchObject({
          name: 'test_operation',
          duration: expect.any(Number),
          startTime: expect.any(Number),
          endTime: expect.any(Number),
          metadata: { context: 'test' }
        });

        expect(result.duration).toBeGreaterThan(0);
        expect(monitor.timers.size).toBe(0);
      });

      test('should record metrics from timer operations', () => {
        const timerId = monitor.startTimer('metric_test');
        monitor.endTimer(timerId);

        const metrics = monitor.getMetrics();
        expect(metrics.metrics).toHaveLength(1);
        
        const metric = metrics.metrics[0];
        expect(metric.name).toBe('metric_test');
        expect(metric.count).toBe(1);
        expect(metric.avg).toBeGreaterThan(0);
      });

      test('should handle invalid timer IDs gracefully', () => {
        const result = monitor.endTimer('invalid-timer-id');
        expect(result).toBeNull();
      });
    });

    describe('Metric Recording', () => {
      test('should record and calculate metrics correctly', () => {
        monitor.recordMetric('test_metric', 100);
        monitor.recordMetric('test_metric', 200);
        monitor.recordMetric('test_metric', 150);

        const metrics = monitor.getMetrics();
        const metric = metrics.metrics[0];

        expect(metric.name).toBe('test_metric');
        expect(metric.count).toBe(3);
        expect(metric.sum).toBe(450);
        expect(metric.avg).toBe(150);
        expect(metric.min).toBe(100);
        expect(metric.max).toBe(200);
      });

      test('should calculate percentiles correctly', () => {
        const values = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
        values.forEach(value => monitor.recordMetric('percentile_test', value));

        const metrics = monitor.getMetrics();
        const metric = metrics.metrics[0];

        expect(metric.p50).toBeGreaterThanOrEqual(50);
        expect(metric.p95).toBeGreaterThanOrEqual(90);
        expect(metric.p99).toBeGreaterThanOrEqual(95);
      });
    });

    describe('Counters and Histograms', () => {
      test('should increment counters correctly', () => {
        monitor.incrementCounter('requests', 1, { endpoint: '/api/users' });
        monitor.incrementCounter('requests', 5, { endpoint: '/api/users' });
        monitor.incrementCounter('requests', 2, { endpoint: '/api/posts' });

        const metrics = monitor.getMetrics();
        expect(metrics.counters).toHaveLength(2);
        
        const userCounter = metrics.counters.find(c => 
          c.tags.endpoint === '/api/users'
        );
        expect(userCounter.count).toBe(6);
      });

      test('should record histogram values', () => {
        monitor.recordHistogram('response_time', 150);
        monitor.recordHistogram('response_time', 75);
        monitor.recordHistogram('response_time', 300);

        const metrics = monitor.getMetrics();
        expect(metrics.histograms).toHaveLength(1);
        
        const histogram = metrics.histograms[0];
        expect(histogram.count).toBe(3);
        expect(histogram.sum).toBe(525);
      });
    });

    describe('Threshold Monitoring', () => {
      test('should trigger alerts when thresholds are exceeded', () => {
        const alerts = [];
        monitor.setThreshold('slow_operation', {
          warning: 100,
          critical: 200,
          callback: (alert) => alerts.push(alert)
        });

        monitor.recordMetric('slow_operation', 250); // Exceeds critical
        monitor.recordMetric('slow_operation', 150); // Exceeds warning

        expect(alerts).toHaveLength(2);
        expect(alerts[0].level).toBe('critical');
        expect(alerts[1].level).toBe('warning');
      });

      test('should not trigger alerts below thresholds', () => {
        const alerts = [];
        monitor.setThreshold('fast_operation', {
          warning: 100,
          callback: (alert) => alerts.push(alert)
        });

        monitor.recordMetric('fast_operation', 50);
        expect(alerts).toHaveLength(0);
      });
    });

    describe('System Metrics', () => {
      test('should collect system metrics', () => {
        const systemMetrics = monitor.getSystemMetrics();
        
        expect(systemMetrics).toMatchObject({
          memory: {
            rss: expect.any(Number),
            heapTotal: expect.any(Number),
            heapUsed: expect.any(Number)
          },
          cpu: {
            user: expect.any(Number),
            system: expect.any(Number)
          },
          uptime: expect.any(Number)
        });
      });
    });
  });

  describe('CacheManager', () => {
    let cacheManager;

    beforeEach(() => {
      cacheManager = new CacheManager();
    });

    afterEach(() => {
      cacheManager.clearAll();
    });

    describe('Cache Creation and Management', () => {
      test('should create and retrieve caches', () => {
        const cache = cacheManager.createCache('test_cache', {
          ttl: 1000,
          maxSize: 100
        });

        expect(cache).toBeInstanceOf(Cache);
        expect(cache.name).toBe('test_cache');
        
        const retrievedCache = cacheManager.getCache('test_cache');
        expect(retrievedCache).toBe(cache);
      });

      test('should get or create cache', () => {
        const cache1 = cacheManager.cache('auto_cache');
        const cache2 = cacheManager.cache('auto_cache');
        
        expect(cache1).toBe(cache2);
        expect(cache1.name).toBe('auto_cache');
      });

      test('should delete caches', () => {
        cacheManager.createCache('temp_cache');
        expect(cacheManager.getCache('temp_cache')).toBeDefined();
        
        const deleted = cacheManager.deleteCache('temp_cache');
        expect(deleted).toBe(true);
        expect(cacheManager.getCache('temp_cache')).toBeNull();
      });
    });

    describe('Cache Operations', () => {
      let cache;

      beforeEach(() => {
        cache = cacheManager.createCache('ops_test', { ttl: 1000 });
      });

      test('should set and get values', () => {
        const success = cache.set('key1', 'value1');
        expect(success).toBe(true);
        
        const value = cache.get('key1');
        expect(value).toBe('value1');
      });

      test('should handle TTL expiration', async () => {
        cache.set('expiring_key', 'value', 100); // 100ms TTL
        
        expect(cache.get('expiring_key')).toBe('value');
        
        await new Promise(resolve => setTimeout(resolve, 150));
        expect(cache.get('expiring_key')).toBeNull();
      });

      test('should evict entries when max size is reached', () => {
        const smallCache = cacheManager.createCache('small', { 
          maxSize: 3, 
          strategy: 'lru' 
        });

        smallCache.set('key1', 'value1');
        smallCache.set('key2', 'value2');
        smallCache.set('key3', 'value3');
        smallCache.set('key4', 'value4'); // Should evict key1

        expect(smallCache.get('key1')).toBeNull();
        expect(smallCache.get('key4')).toBe('value4');
      });

      test('should serialize and deserialize complex objects', () => {
        const serializedCache = cacheManager.createCache('serialized', {
          serialize: true
        });

        const complexObject = {
          id: 123,
          name: 'Test',
          nested: { value: true }
        };

        serializedCache.set('complex', complexObject);
        const retrieved = serializedCache.get('complex');
        
        expect(retrieved).toEqual(complexObject);
      });
    });

    describe('Statistics and Monitoring', () => {
      test('should track cache statistics', () => {
        const cache = cacheManager.createCache('stats_test');
        
        cache.set('key1', 'value1');
        cache.get('key1'); // Hit
        cache.get('key2'); // Miss
        
        const stats = cacheManager.getStatistics('stats_test');
        expect(stats.sets).toBe(1);
        expect(stats.hits).toBe(1);
        expect(stats.misses).toBe(1);
        expect(stats.hitRate).toBe('50.00');
      });

      test('should calculate memory usage', () => {
        const cache = cacheManager.createCache('memory_test');
        cache.set('key1', 'a'.repeat(1000));
        
        const usage = cacheManager.getMemoryUsage();
        expect(usage.total).toBeGreaterThan(0);
        expect(usage.caches.memory_test).toBeGreaterThan(0);
      });
    });
  });

  describe('QueryOptimizer', () => {
    let optimizer;

    beforeEach(() => {
      optimizer = new QueryOptimizer();
    });

    describe('Query Analysis and Optimization', () => {
      test('should identify optimization opportunities', () => {
        const queryInfo = {
          model: 'User',
          operation: 'find',
          filter: { status: 'active', createdAt: { $gte: new Date() } },
          limit: null // Missing pagination
        };

        const result = optimizer.optimizeQuery(queryInfo);
        
        expect(result.optimized).toBeDefined();
        expect(result.optimizations).toBeInstanceOf(Array);
        expect(result.pattern).toBeDefined();
        
        // Should suggest pagination
        const paginationOpt = result.optimizations.find(opt => 
          opt.rule === 'pagination'
        );
        expect(paginationOpt).toBeDefined();
      });

      test('should generate cache keys for cacheable queries', () => {
        const queryInfo = {
          model: 'Product',
          operation: 'find',
          filter: { category: 'electronics', price: { $lt: 100 } },
          select: 'name price',
          sort: { price: 1 },
          limit: 20
        };

        const result = optimizer.optimizeQuery(queryInfo);
        expect(result.cacheKey).toBeDefined();
        expect(typeof result.cacheKey).toBe('string');
      });

      test('should not cache dynamic queries', () => {
        const queryInfo = {
          model: 'Event',
          operation: 'find',
          filter: { 
            timestamp: { $gte: new Date() }, // Dynamic filter
            status: 'active'
          }
        };

        const result = optimizer.optimizeQuery(queryInfo);
        expect(result.cacheKey).toBeNull();
      });
    });

    describe('Query Pattern Recognition', () => {
      test('should identify common query patterns', () => {
        const patterns = [
          {
            query: { _id: '123' },
            expected: 'single_document_by_id'
          },
          {
            query: { userId: '456', status: 'active' },
            expected: 'user_scoped_query'
          },
          {
            query: { createdAt: { $gte: new Date() } },
            expected: 'time_range_query'
          }
        ];

        patterns.forEach(({ query, expected }) => {
          const queryInfo = { filter: query, operation: 'find' };
          const result = optimizer.optimizeQuery(queryInfo);
          expect(result.pattern).toBe(expected);
        });
      });
    });

    describe('Slow Query Detection', () => {
      test('should record slow queries', () => {
        const queryInfo = {
          model: 'LargeCollection',
          operation: 'find',
          filter: { complexField: { $regex: /.*pattern.*/ } }
        };

        optimizer.recordSlowQuery(queryInfo, 2500); // 2.5 seconds
        
        const stats = optimizer.getStatistics();
        expect(stats.slowQueries).toHaveLength(1);
        expect(stats.slowQueries[0].avgDuration).toBe(2500);
      });

      test('should aggregate multiple slow query instances', () => {
        const queryInfo = {
          model: 'TestModel',
          operation: 'find',
          filter: { field: 'value' }
        };

        optimizer.recordSlowQuery(queryInfo, 1500);
        optimizer.recordSlowQuery(queryInfo, 2000);
        
        const stats = optimizer.getStatistics();
        expect(stats.slowQueries).toHaveLength(1);
        expect(stats.slowQueries[0].count).toBe(2);
        expect(stats.slowQueries[0].avgDuration).toBe(1750);
      });
    });

    describe('Index Recommendations', () => {
      test('should generate index recommendations', () => {
        optimizer.addIndexRecommendation(
          'User',
          { email: 1, status: 1 },
          'Frequent queries on email and status fields'
        );

        const recommendations = optimizer.getIndexRecommendations('User');
        expect(recommendations).toHaveLength(1);
        expect(recommendations[0]).toMatchObject({
          model: 'User',
          indexSpec: { email: 1, status: 1 },
          reason: expect.stringContaining('Frequent queries'),
          priority: expect.any(Number)
        });
      });

      test('should prioritize index recommendations correctly', () => {
        optimizer.addIndexRecommendation(
          'Order',
          { userId: 1 },
          'slow query performance issue'
        );

        optimizer.addIndexRecommendation(
          'Order',
          { createdAt: 1 },
          'frequent access pattern'
        );

        const recommendations = optimizer.getIndexRecommendations('Order');
        expect(recommendations).toHaveLength(2);
        
        // Slow query recommendations should have higher priority
        const slowQueryRec = recommendations.find(r => 
          r.reason.includes('slow query')
        );
        const frequentRec = recommendations.find(r => 
          r.reason.includes('frequent')
        );
        
        expect(slowQueryRec.priority).toBeGreaterThan(frequentRec.priority);
      });
    });

    describe('Optimization Report Generation', () => {
      test('should generate comprehensive optimization report', () => {
        // Add some test data
        optimizer.recordSlowQuery(
          { model: 'Report', operation: 'find', filter: { type: 'large' } },
          3000
        );

        optimizer.addIndexRecommendation(
          'Report',
          { type: 1, createdAt: -1 },
          'Optimize report queries'
        );

        const report = optimizer.generateReport();
        
        expect(report).toMatchObject({
          summary: {
            totalPatterns: expect.any(Number),
            totalSlowQueries: expect.any(Number),
            criticalSlowQueries: expect.any(Number)
          },
          recommendations: {
            indexes: expect.any(Array),
            queryOptimizations: expect.any(Array)
          },
          performance: {
            patterns: expect.any(Array),
            slowQueries: expect.any(Array)
          }
        });
      });
    });
  });

  describe('Integration Tests', () => {
    beforeEach(() => {
      globalPerformanceMonitor.reset();
      queryCache.clear();
    });

    test('should work together for comprehensive performance monitoring', () => {
      // Simulate a query operation
      const timerId = globalPerformanceMonitor.startTimer('integrated_query');
      
      // Simulate query optimization
      const queryInfo = {
        model: 'IntegratedTest',
        operation: 'find',
        filter: { status: 'active' }
      };
      
      const optimization = globalQueryOptimizer.optimizeQuery(queryInfo);
      
      // Simulate caching
      if (optimization.cacheKey) {
        queryCache.set(optimization.cacheKey, { data: [] }, 60000);
      }
      
      // End timing
      globalPerformanceMonitor.endTimer(timerId);
      
      // Verify integration
      const metrics = globalPerformanceMonitor.getMetrics();
      expect(metrics.metrics).toHaveLength(1);
      
      const cached = queryCache.get(optimization.cacheKey);
      expect(cached).toBeDefined();
      
      const stats = globalQueryOptimizer.getStatistics();
      expect(stats.patterns).toHaveLength(1);
    });
  });
});