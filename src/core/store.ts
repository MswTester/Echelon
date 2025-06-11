export interface StoreEntry {
  value: any;
  listeners: Set<() => void>;
}

const globalStore = new Map<string, StoreEntry>();

export function hasStore(id: string): boolean {
  return globalStore.has(id);
}

function ensureEntry(id: string, initialValue: any): StoreEntry {
  if (!globalStore.has(id)) {
    globalStore.set(id, { value: initialValue, listeners: new Set() });
  }
  return globalStore.get(id)!;
}

export function getStoreValue(id: string): any {
  return ensureEntry(id, undefined).value;
}

export function setStoreValue(id: string, value: any): void {
  const entry = ensureEntry(id, value);
  if (entry.value !== value) {
    entry.value = value;
    entry.listeners.forEach(fn => fn());
  }
}

export function subscribeStore(id: string, listener: () => void): () => void {
  const entry = ensureEntry(id, undefined);
  entry.listeners.add(listener);
  return () => {
    entry.listeners.delete(listener);
  };
}
