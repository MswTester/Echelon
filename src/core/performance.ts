// Production-level performance optimizations for Echelon framework

export interface PerformanceConfig {
  enableDebugMode: boolean;
  maxComputedDepth: number;
  batchUpdateDelay: number;
  enableAsyncUpdates: boolean;
  enableMemoization: boolean;
  maxCacheSize: number;
}

export const defaultPerformanceConfig: PerformanceConfig = {
  enableDebugMode: process.env.NODE_ENV !== 'production',
  maxComputedDepth: 10,
  batchUpdateDelay: 0,
  enableAsyncUpdates: true,
  enableMemoization: true,
  maxCacheSize: 1000,
};

let performanceConfig = { ...defaultPerformanceConfig };

export function setPerformanceConfig(config: Partial<PerformanceConfig>): void {
  performanceConfig = { ...performanceConfig, ...config };
}

export function getPerformanceConfig(): PerformanceConfig {
  return { ...performanceConfig };
}

// Performance monitoring utilities
export class PerformanceMonitor {
  private static metrics = new Map<string, number[]>();
  private static isEnabled = performanceConfig.enableDebugMode;

  static enable(): void {
    this.isEnabled = true;
  }

  static disable(): void {
    this.isEnabled = false;
  }

  static startMeasure(name: string): number {
    if (!this.isEnabled) return 0;
    return performance.now();
  }

  static endMeasure(name: string, startTime: number): void {
    if (!this.isEnabled) return;
    
    const duration = performance.now() - startTime;
    
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    
    const measurements = this.metrics.get(name)!;
    measurements.push(duration);
    
    // Keep only last 100 measurements
    if (measurements.length > 100) {
      measurements.shift();
    }
  }

  static getAverageTime(name: string): number {
    const measurements = this.metrics.get(name);
    if (!measurements || measurements.length === 0) return 0;
    
    const sum = measurements.reduce((a, b) => a + b, 0);
    return sum / measurements.length;
  }

  static getMetrics(): Record<string, { avg: number; count: number; total: number }> {
    const result: Record<string, { avg: number; count: number; total: number }> = {};
    
    for (const [name, measurements] of this.metrics) {
      const total = measurements.reduce((a, b) => a + b, 0);
      result[name] = {
        avg: total / measurements.length,
        count: measurements.length,
        total,
      };
    }
    
    return result;
  }

  static clearMetrics(): void {
    this.metrics.clear();
  }
}

// Component instance pool for reuse
export class ComponentPool {
  private static pools = new Map<string, any[]>();
  private static maxPoolSize = 50;

  static setMaxPoolSize(size: number): void {
    this.maxPoolSize = size;
  }

  static acquire<T>(type: string, factory: () => T): T {
    const pool = this.pools.get(type);
    if (pool && pool.length > 0) {
      return pool.pop() as T;
    }
    return factory();
  }

  static release(type: string, instance: any): void {
    if (!this.pools.has(type)) {
      this.pools.set(type, []);
    }
    
    const pool = this.pools.get(type)!;
    if (pool.length < this.maxPoolSize) {
      // Reset instance state if possible
      if (typeof instance.reset === 'function') {
        instance.reset();
      }
      pool.push(instance);
    }
  }

  static clearPool(type?: string): void {
    if (type) {
      this.pools.delete(type);
    } else {
      this.pools.clear();
    }
  }
}

// Optimized event delegation system
export class EventDelegator {
  private static delegatedEvents = new Set<string>();
  private static eventHandlers = new Map<HTMLElement, Map<string, Function>>();
  
  static setup(rootElement: HTMLElement = document.body): void {
    const commonEvents = ['click', 'input', 'change', 'submit', 'keydown', 'keyup'];
    
    for (const eventType of commonEvents) {
      if (!this.delegatedEvents.has(eventType)) {
        rootElement.addEventListener(eventType, this.handleDelegatedEvent.bind(this), {
          capture: false,
          passive: eventType !== 'submit',
        });
        this.delegatedEvents.add(eventType);
      }
    }
  }

  private static handleDelegatedEvent(event: Event): void {
    let target = event.target as HTMLElement;
    
    while (target && target !== document.body) {
      const handlers = this.eventHandlers.get(target);
      if (handlers && handlers.has(event.type)) {
        const handler = handlers.get(event.type)!;
        try {
          handler(event);
        } catch (error) {
          console.error('Error in delegated event handler:', error);
        }
        break;
      }
      target = target.parentElement!;
    }
  }

  static registerHandler(element: HTMLElement, eventType: string, handler: Function): void {
    if (!this.eventHandlers.has(element)) {
      this.eventHandlers.set(element, new Map());
    }
    this.eventHandlers.get(element)!.set(eventType, handler);
  }

  static unregisterHandler(element: HTMLElement, eventType: string): void {
    const handlers = this.eventHandlers.get(element);
    if (handlers) {
      handlers.delete(eventType);
      if (handlers.size === 0) {
        this.eventHandlers.delete(element);
      }
    }
  }
}

// Memoization utilities
export class MemoizationCache {
  private cache = new Map<string, { value: any; timestamp: number; hits: number }>();
  private maxSize: number;
  private ttl: number; // Time to live in milliseconds

  constructor(maxSize: number = 1000, ttl: number = 5 * 60 * 1000) {
    this.maxSize = maxSize;
    this.ttl = ttl;
  }

  get<T>(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;
    
    const now = Date.now();
    if (now - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return undefined;
    }
    
    entry.hits++;
    return entry.value as T;
  }

  set<T>(key: string, value: T): void {
    // Evict expired entries
    this.evictExpired();
    
    // Evict least used entries if cache is full
    if (this.cache.size >= this.maxSize) {
      this.evictLeastUsed();
    }
    
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      hits: 0,
    });
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    const now = Date.now();
    if (now - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  private evictExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache) {
      if (now - entry.timestamp > this.ttl) {
        this.cache.delete(key);
      }
    }
  }

  private evictLeastUsed(): void {
    let leastUsedKey = '';
    let leastHits = Infinity;
    
    for (const [key, entry] of this.cache) {
      if (entry.hits < leastHits) {
        leastHits = entry.hits;
        leastUsedKey = key;
      }
    }
    
    if (leastUsedKey) {
      this.cache.delete(leastUsedKey);
    }
  }

  getStats(): { size: number; hitRate: number; avgHits: number } {
    const totalHits = Array.from(this.cache.values()).reduce((sum, entry) => sum + entry.hits, 0);
    const avgHits = this.cache.size > 0 ? totalHits / this.cache.size : 0;
    
    return {
      size: this.cache.size,
      hitRate: totalHits > 0 ? (totalHits / (totalHits + this.cache.size)) : 0,
      avgHits,
    };
  }
}

// Global memoization cache instance
export const globalMemoCache = new MemoizationCache(
  performanceConfig.maxCacheSize,
  5 * 60 * 1000 // 5 minutes TTL
);

// Update batching system for better performance
export class UpdateBatcher {
  private static pendingUpdates = new Set<() => void>();
  private static isScheduled = false;
  private static batchDelay = performanceConfig.batchUpdateDelay;

  static setBatchDelay(delay: number): void {
    this.batchDelay = delay;
  }

  static schedule(updateFn: () => void): void {
    this.pendingUpdates.add(updateFn);
    
    if (!this.isScheduled) {
      this.isScheduled = true;
      
      if (this.batchDelay === 0) {
        // Use requestAnimationFrame for next frame updates
        if (typeof requestAnimationFrame !== 'undefined') {
          requestAnimationFrame(this.flush.bind(this));
        } else {
          // Fallback for non-browser environments
          setTimeout(this.flush.bind(this), 0);
        }
      } else {
        setTimeout(this.flush.bind(this), this.batchDelay);
      }
    }
  }

  private static flush(): void {
    const updates = Array.from(this.pendingUpdates);
    this.pendingUpdates.clear();
    this.isScheduled = false;
    
    const startTime = PerformanceMonitor.startMeasure('batch-update');
    
    try {
      for (const update of updates) {
        update();
      }
    } catch (error) {
      console.error('Error during batch update:', error);
    } finally {
      PerformanceMonitor.endMeasure('batch-update', startTime);
    }
  }

  static flush(): void {
    this.flush();
  }

  static getPendingCount(): number {
    return this.pendingUpdates.size;
  }
}

// Development mode helpers
export class DevTools {
  private static components = new WeakMap<object, string>();
  private static updateCounts = new Map<string, number>();

  static registerComponent(instance: object, name: string): void {
    if (!performanceConfig.enableDebugMode) return;
    
    this.components.set(instance, name);
    this.updateCounts.set(name, 0);
  }

  static trackUpdate(instance: object): void {
    if (!performanceConfig.enableDebugMode) return;
    
    const name = this.components.get(instance);
    if (name) {
      const count = this.updateCounts.get(name) || 0;
      this.updateCounts.set(name, count + 1);
    }
  }

  static getUpdateCounts(): Record<string, number> {
    return Object.fromEntries(this.updateCounts);
  }

  static logPerformanceReport(): void {
    if (!performanceConfig.enableDebugMode) return;
    
    console.group('🚀 Echelon Performance Report');
    
    console.log('📊 Timing Metrics:', PerformanceMonitor.getMetrics());
    console.log('🔄 Update Counts:', this.getUpdateCounts());
    console.log('💾 Cache Stats:', globalMemoCache.getStats());
    console.log('⏱️ Pending Updates:', UpdateBatcher.getPendingCount());
    
    console.groupEnd();
  }

  static enablePerformanceWarnings(): void {
    if (!performanceConfig.enableDebugMode) return;
    
    // Warn about excessive updates
    setInterval(() => {
      for (const [component, count] of this.updateCounts) {
        if (count > 100) {
          console.warn(`⚠️ Component "${component}" has updated ${count} times. Consider optimization.`);
        }
      }
    }, 10000); // Check every 10 seconds
  }
}

// Initialize performance optimizations
export function initializePerformanceOptimizations(): void {
  if (typeof window !== 'undefined') {
    EventDelegator.setup();
    
    if (performanceConfig.enableDebugMode) {
      DevTools.enablePerformanceWarnings();
      
      // Global performance report function
      (window as any).__echelonPerf = () => DevTools.logPerformanceReport();
    }
  }
}

// Production build optimizations
export function optimizeForProduction(): void {
  performanceConfig.enableDebugMode = false;
  performanceConfig.enableAsyncUpdates = true;
  performanceConfig.batchUpdateDelay = 0;
  
  PerformanceMonitor.disable();
  
  // Clear development-only data
  DevTools.getUpdateCounts();
  globalMemoCache.clear();
}

// Export performance utilities
export {
  PerformanceMonitor,
  ComponentPool,
  EventDelegator,
  MemoizationCache,
  UpdateBatcher,
  DevTools,
};