export interface ComputedInfo {
  deps: Set<string | symbol>;
  compute: () => any;
  cached: any;
  dirty: boolean;
}

interface CollectContext {
  instance: any;
  deps: Set<string | symbol>;
}

const contextStack: CollectContext[] = [];

export function startTracking(instance: any): Set<string | symbol> {
  const deps = new Set<string | symbol>();
  contextStack.push({ instance, deps });
  return deps;
}

export function endTracking(): Set<string | symbol> {
  const ctx = contextStack.pop();
  return ctx ? ctx.deps : new Set();
}

export function recordDependency(instance: any, field: string | symbol): void {
  const ctx = contextStack[contextStack.length - 1];
  if (ctx && ctx.instance === instance) {
    ctx.deps.add(field);
  }
}
