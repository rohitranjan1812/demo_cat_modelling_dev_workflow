/**
 * Performance Monitor
 * Comprehensive performance monitoring and metrics collection system
 */

class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.timers = new Map();
    this.counters = new Map();
    this.histograms = new Map();
    this.alerts = new Map();
    this.thresholds = new Map();
    this.startTime = Date.now();
    this.isEnabled = process.env.PERFORMANCE_MONITORING !== 'false';
  }

  /**
   * Start timing an operation
   * @param {string} name - Operation name
   * @param {Object} metadata - Additional metadata
   * @returns {string} Timer ID
   */
  startTimer(name, metadata = {}) {
    if (!this.isEnabled) return null;

    const timerId = `${name}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.timers.set(timerId, {
      name,
      startTime: process.hrtime.bigint(),
      startTimestamp: Date.now(),
      metadata
    });

    return timerId;
  }

  /**
   * End timing an operation and record metrics
   * @param {string} timerId - Timer ID from startTimer
   * @param {Object} additionalData - Additional data to record
   * @returns {Object} Timing result
   */
  endTimer(timerId, additionalData = {}) {
    if (!this.isEnabled || !timerId) return null;

    const timer = this.timers.get(timerId);
    if (!timer) return null;

    const endTime = process.hrtime.bigint();
    const durationNs = endTime - timer.startTime;
    const durationMs = Number(durationNs) / 1000000;

    const result = {
      name: timer.name,
      duration: durationMs,
      startTime: timer.startTimestamp,
      endTime: Date.now(),
      metadata: timer.metadata,
      ...additionalData
    };

    // Record the measurement
    this.recordMetric(timer.name, durationMs, result);

    // Check against thresholds
    this.checkThreshold(timer.name, durationMs);

    // Cleanup
    this.timers.delete(timerId);

    return result;
  }

  /**
   * Record a metric value
   * @param {string} name - Metric name
   * @param {number} value - Metric value
   * @param {Object} metadata - Additional metadata
   */
  recordMetric(name, value, metadata = {}) {
    if (!this.isEnabled) return;

    if (!this.metrics.has(name)) {
      this.metrics.set(name, {
        name,
        count: 0,
        sum: 0,
        min: Infinity,
        max: -Infinity,
        avg: 0,
        recent: [],
        p50: 0,
        p95: 0,
        p99: 0,
        lastUpdated: Date.now()
      });
    }

    const metric = this.metrics.get(name);
    metric.count++;
    metric.sum += value;
    metric.min = Math.min(metric.min, value);
    metric.max = Math.max(metric.max, value);
    metric.avg = metric.sum / metric.count;
    metric.lastUpdated = Date.now();

    // Keep recent values for percentile calculations
    metric.recent.push({ value, timestamp: Date.now(), metadata });
    if (metric.recent.length > 1000) {
      metric.recent.shift();
    }

    // Calculate percentiles
    this.calculatePercentiles(metric);
  }

  /**
   * Calculate percentiles for a metric
   * @param {Object} metric - Metric object
   */
  calculatePercentiles(metric) {
    if (metric.recent.length === 0) return;

    const values = metric.recent.map(r => r.value).sort((a, b) => a - b);
    const len = values.length;

    metric.p50 = values[Math.floor(len * 0.5)];
    metric.p95 = values[Math.floor(len * 0.95)];
    metric.p99 = values[Math.floor(len * 0.99)];
  }

  /**
   * Increment a counter
   * @param {string} name - Counter name
   * @param {number} increment - Increment amount (default 1)
   * @param {Object} tags - Counter tags
   */
  incrementCounter(name, increment = 1, tags = {}) {
    if (!this.isEnabled) return;

    const key = `${name}:${JSON.stringify(tags)}`;
    const current = this.counters.get(key) || { name, count: 0, tags, lastUpdated: Date.now() };
    
    current.count += increment;
    current.lastUpdated = Date.now();
    
    this.counters.set(key, current);
  }

  /**
   * Record histogram value
   * @param {string} name - Histogram name
   * @param {number} value - Value to record
   * @param {Object} tags - Histogram tags
   */
  recordHistogram(name, value, tags = {}) {
    if (!this.isEnabled) return;

    const key = `${name}:${JSON.stringify(tags)}`;
    
    if (!this.histograms.has(key)) {
      this.histograms.set(key, {
        name,
        tags,
        buckets: new Map(),
        count: 0,
        sum: 0,
        min: Infinity,
        max: -Infinity
      });
    }

    const histogram = this.histograms.get(key);
    histogram.count++;
    histogram.sum += value;
    histogram.min = Math.min(histogram.min, value);
    histogram.max = Math.max(histogram.max, value);

    // Determine bucket
    const bucket = this.determineBucket(value);
    const bucketCount = histogram.buckets.get(bucket) || 0;
    histogram.buckets.set(bucket, bucketCount + 1);
  }

  /**
   * Determine histogram bucket for a value
   * @param {number} value - Value to bucket
   * @returns {string} Bucket name
   */
  determineBucket(value) {
    const buckets = [1, 5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000];
    
    for (const bucket of buckets) {
      if (value <= bucket) {
        return `<=${bucket}`;
      }
    }
    
    return '>10000';
  }

  /**
   * Set performance threshold
   * @param {string} metricName - Metric to monitor
   * @param {Object} threshold - Threshold configuration
   */
  setThreshold(metricName, threshold) {
    this.thresholds.set(metricName, {
      warning: threshold.warning || null,
      critical: threshold.critical || null,
      callback: threshold.callback || null,
      ...threshold
    });
  }

  /**
   * Check if metric exceeds threshold
   * @param {string} metricName - Metric name
   * @param {number} value - Current value
   */
  checkThreshold(metricName, value) {
    const threshold = this.thresholds.get(metricName);
    if (!threshold) return;

    let alertLevel = null;
    
    if (threshold.critical && value > threshold.critical) {
      alertLevel = 'critical';
    } else if (threshold.warning && value > threshold.warning) {
      alertLevel = 'warning';
    }

    if (alertLevel) {
      const alert = {
        metric: metricName,
        level: alertLevel,
        value,
        threshold: threshold[alertLevel],
        timestamp: Date.now()
      };

      this.alerts.set(`${metricName}_${Date.now()}`, alert);

      // Execute callback if provided
      if (threshold.callback) {
        try {
          threshold.callback(alert);
        } catch (error) {
          console.error('Performance threshold callback failed:', error);
        }
      }

      console.warn(`[PERFORMANCE ${alertLevel.toUpperCase()}] ${metricName}: ${value}ms exceeds ${alertLevel} threshold (${threshold[alertLevel]}ms)`);
    }
  }

  /**
   * Get system resource metrics
   * @returns {Object} System metrics
   */
  getSystemMetrics() {
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    return {
      memory: {
        rss: memUsage.rss / 1024 / 1024, // MB
        heapTotal: memUsage.heapTotal / 1024 / 1024, // MB
        heapUsed: memUsage.heapUsed / 1024 / 1024, // MB
        external: memUsage.external / 1024 / 1024, // MB
        arrayBuffers: memUsage.arrayBuffers / 1024 / 1024 // MB
      },
      cpu: {
        user: cpuUsage.user / 1000, // ms
        system: cpuUsage.system / 1000 // ms
      },
      uptime: process.uptime(),
      timestamp: Date.now()
    };
  }

  /**
   * Get all performance metrics
   * @returns {Object} Complete metrics snapshot
   */
  getMetrics() {
    const systemMetrics = this.getSystemMetrics();
    
    return {
      system: systemMetrics,
      metrics: Array.from(this.metrics.values()),
      counters: Array.from(this.counters.values()),
      histograms: Array.from(this.histograms.values()),
      alerts: Array.from(this.alerts.values()),
      activeTimers: this.timers.size,
      uptime: Date.now() - this.startTime,
      timestamp: Date.now()
    };
  }

  /**
   * Get performance summary
   * @returns {Object} Performance summary
   */
  getSummary() {
    const metrics = Array.from(this.metrics.values());
    const systemMetrics = this.getSystemMetrics();
    
    return {
      overview: {
        totalMetrics: this.metrics.size,
        totalCounters: this.counters.size,
        totalAlerts: this.alerts.size,
        uptime: Date.now() - this.startTime
      },
      system: systemMetrics,
      slowest: metrics
        .sort((a, b) => b.avg - a.avg)
        .slice(0, 5)
        .map(m => ({ name: m.name, avgTime: m.avg, count: m.count })),
      fastest: metrics
        .sort((a, b) => a.avg - b.avg)
        .slice(0, 5)
        .map(m => ({ name: m.name, avgTime: m.avg, count: m.count })),
      recentAlerts: Array.from(this.alerts.values())
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 10)
    };
  }

  /**
   * Clear old metrics and alerts
   * @param {number} maxAge - Maximum age in milliseconds
   */
  cleanup(maxAge = 24 * 60 * 60 * 1000) { // 24 hours default
    const cutoff = Date.now() - maxAge;
    
    // Clear old alerts
    for (const [key, alert] of this.alerts.entries()) {
      if (alert.timestamp < cutoff) {
        this.alerts.delete(key);
      }
    }

    // Clear old metric data
    for (const [name, metric] of this.metrics.entries()) {
      metric.recent = metric.recent.filter(r => r.timestamp > cutoff);
      if (metric.recent.length === 0 && metric.lastUpdated < cutoff) {
        this.metrics.delete(name);
      }
    }

    // Clear old counters
    for (const [key, counter] of this.counters.entries()) {
      if (counter.lastUpdated < cutoff) {
        this.counters.delete(key);
      }
    }
  }

  /**
   * Export metrics in Prometheus format
   * @returns {string} Prometheus metrics
   */
  exportPrometheusMetrics() {
    let output = '';
    
    // Export metrics
    for (const [name, metric] of this.metrics.entries()) {
      const sanitizedName = name.replace(/[^a-zA-Z0-9_]/g, '_');
      output += `# TYPE ${sanitizedName}_duration_ms gauge\n`;
      output += `${sanitizedName}_duration_ms{percentile="50"} ${metric.p50}\n`;
      output += `${sanitizedName}_duration_ms{percentile="95"} ${metric.p95}\n`;
      output += `${sanitizedName}_duration_ms{percentile="99"} ${metric.p99}\n`;
      output += `# TYPE ${sanitizedName}_count counter\n`;
      output += `${sanitizedName}_count ${metric.count}\n`;
    }
    
    // Export counters
    for (const [key, counter] of this.counters.entries()) {
      const sanitizedName = counter.name.replace(/[^a-zA-Z0-9_]/g, '_');
      const tags = Object.entries(counter.tags)
        .map(([k, v]) => `${k}="${v}"`)
        .join(',');
      output += `# TYPE ${sanitizedName}_total counter\n`;
      output += `${sanitizedName}_total{${tags}} ${counter.count}\n`;
    }
    
    return output;
  }

  /**
   * Enable/disable performance monitoring
   * @param {boolean} enabled - Whether to enable monitoring
   */
  setEnabled(enabled) {
    this.isEnabled = enabled;
  }

  /**
   * Clear all metrics and reset
   */
  reset() {
    this.metrics.clear();
    this.timers.clear();
    this.counters.clear();
    this.histograms.clear();
    this.alerts.clear();
    this.startTime = Date.now();
  }
}

// Global performance monitor instance
const globalPerformanceMonitor = new PerformanceMonitor();

// Set default thresholds
globalPerformanceMonitor.setThreshold('database_query', {
  warning: 1000, // 1 second
  critical: 5000  // 5 seconds
});

globalPerformanceMonitor.setThreshold('api_request', {
  warning: 2000, // 2 seconds
  critical: 10000 // 10 seconds
});

globalPerformanceMonitor.setThreshold('simulation_run', {
  warning: 30000, // 30 seconds
  critical: 120000 // 2 minutes
});

module.exports = {
  PerformanceMonitor,
  globalPerformanceMonitor
};