import { getOrCreateComponentMeta } from './meta';

export function Component(tagName?: string) {
  return function <T extends { new (...args: any[]): object }>(constructor: T) {
    const meta = getOrCreateComponentMeta(constructor);
    meta.tagName = tagName;
  };
}
