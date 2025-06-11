export interface ComputedInfo {
  deps: Set<string | symbol>;
  compute: () => any;
  cached: any;
  dirty: boolean;
  computing: boolean; // Add flag to prevent infinite recursion
}

interface CollectContext {
  instance: any;
  deps: Set<string | symbol>;
  computingFields: Set<string | symbol>; // Track currently computing fields
}

const contextStack: CollectContext[] = [];
const MAX_COMPUTATION_DEPTH = 10;
const computationDepth = new Map<any, number>(); // Track computation depth per instance

export function startTracking(instance: any): Set<string | symbol> {
  const deps = new Set<string | symbol>();
  const computingFields = new Set<string | symbol>();
  contextStack.push({ instance, deps, computingFields });
  return deps;
}

export function endTracking(): Set<string | symbol> {
  const ctx = contextStack.pop();
  return ctx ? ctx.deps : new Set();
}

export function recordDependency(instance: any, field: string | symbol): void {
  const ctx = contextStack[contextStack.length - 1];
  if (ctx && ctx.instance === instance) {
    // Prevent self-dependency (circular reference)
    if (!ctx.computingFields.has(field)) {
      ctx.deps.add(field);
    }
  }
}

export function startComputing(instance: any, field: string | symbol): boolean {
  const ctx = contextStack[contextStack.length - 1];
  if (ctx && ctx.instance === instance) {
    // Check if we're already computing this field (infinite recursion)
    if (ctx.computingFields.has(field)) {
      console.warn(`Circular dependency detected for computed field: ${String(field)}`);
      return false;
    }
    
    // Check computation depth
    const currentDepth = computationDepth.get(instance) || 0;
    if (currentDepth >= MAX_COMPUTATION_DEPTH) {
      console.warn(`Maximum computation depth reached for instance, skipping: ${String(field)}`);
      return false;
    }
    
    ctx.computingFields.add(field);
    computationDepth.set(instance, currentDepth + 1);
    return true;
  }
  return false;
}

export function endComputing(instance: any, field: string | symbol): void {
  const ctx = contextStack[contextStack.length - 1];
  if (ctx && ctx.instance === instance) {
    ctx.computingFields.delete(field);
    const currentDepth = computationDepth.get(instance) || 0;
    computationDepth.set(instance, Math.max(0, currentDepth - 1));
  }
}

export function isCircularDependency(
  field: string | symbol, 
  deps: Set<string | symbol>, 
  computedDepsMap: Map<string | symbol, Set<string | symbol>>
): boolean {
  const visited = new Set<string | symbol>();
  const path = new Set<string | symbol>();
  
  function dfs(currentField: string | symbol): boolean {
    if (path.has(currentField)) return true; // Circular dependency found
    if (visited.has(currentField)) return false; // Already checked
    
    visited.add(currentField);
    path.add(currentField);
    
    const dependents = computedDepsMap.get(currentField);
    if (dependents) {
      for (const dependent of dependents) {
        if (dfs(dependent)) return true;
      }
    }
    
    path.delete(currentField);
    return false;
  }
  
  // Check if adding this dependency would create a cycle
  for (const dep of deps) {
    if (dep === field) return true; // Direct self-dependency
    const dependents = computedDepsMap.get(dep);
    if (dependents && dependents.has(field)) {
      return true; // Would create immediate cycle
    }
  }
  
  return dfs(field);
}

export function safelyComputeValue(
  instance: any,
  field: string | symbol,
  computeFn: () => any,
  info: ComputedInfo
): any {
  if (info.computing) {
    console.warn(`Avoiding recursive computation for field: ${String(field)}`);
    return info.cached;
  }
  
  info.computing = true;
  
  try {
    if (!startComputing(instance, field)) {
      return info.cached; // Return cached value if computation would be circular
    }
    
    startTracking(instance);
    try {
      const newValue = computeFn();
      return newValue;
    } finally {
      info.deps = endTracking();
      endComputing(instance, field);
    }
  } finally {
    info.computing = false;
  }
}

// Batched update system to prevent cascading updates
interface UpdateBatch {
  instance: any;
  updates: Map<string | symbol, { newValue: any; oldValue: any }>;
}

const pendingBatches = new Map<any, UpdateBatch>();
let batchProcessing = false;

export function batchUpdate(
  instance: any, 
  field: string | symbol, 
  newValue: any, 
  oldValue: any
): void {
  if (!pendingBatches.has(instance)) {
    pendingBatches.set(instance, {
      instance,
      updates: new Map()
    });
  }
  
  const batch = pendingBatches.get(instance)!;
  batch.updates.set(field, { newValue, oldValue });
  
  if (!batchProcessing) {
    setTimeout(processBatches, 0); // Process in next tick
  }
}

function processBatches(): void {
  if (batchProcessing) return;
  batchProcessing = true;
  
  try {
    for (const [instance, batch] of pendingBatches) {
      processBatch(batch);
    }
    pendingBatches.clear();
  } finally {
    batchProcessing = false;
  }
}

function processBatch(batch: UpdateBatch): void {
  const { instance, updates } = batch;
  const meta = (instance as any)._meta;
  
  if (!meta || !meta.watchHandlers) return;
  
  // Process watch handlers for all updates in batch
  for (const [field, { newValue, oldValue }] of updates) {
    if (newValue !== oldValue && meta.watchHandlers.has(field)) {
      const handlers = meta.watchHandlers.get(field)!;
      handlers.forEach((handlerName: string | symbol) => {
        const handler = (instance as any)[handlerName];
        if (typeof handler === 'function') {
          try {
            handler.call(instance, newValue, oldValue);
          } catch (err) {
            console.error(`Error in watch handler ${String(handlerName)}:`, err);
          }
        }
      });
    }
  }
}