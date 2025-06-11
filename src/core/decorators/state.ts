import { getOrCreateComponentMeta } from './meta';

export function State() {
  return function (target: any, classFieldName: string | symbol): void {
    const meta = getOrCreateComponentMeta(target);
    meta.stateFields.add(classFieldName);
  };
}

export function Computed() {
  return function (
    target: any,
    propertyKey: string | symbol
  ): void {
    const meta = getOrCreateComponentMeta(target);
    if (!meta.computedFields) meta.computedFields = new Set();
    meta.computedFields.add(propertyKey);
  };
}

export function Store(id?: string) {
  return function (target: any, classFieldName: string | symbol): void {
    const meta = getOrCreateComponentMeta(target);
    const storeId = id || String(classFieldName);
    if (!meta.storeFields) meta.storeFields = new Map();
    meta.storeFields.set(classFieldName, storeId);
    meta.stateFields.add(classFieldName);
  };
}

export function Use(storeId: string) {
  return function (target: any, classFieldName: string | symbol): void {
    const meta = getOrCreateComponentMeta(target);
    if (!meta.storeFields) meta.storeFields = new Map();
    meta.storeFields.set(classFieldName, storeId);
    meta.stateFields.add(classFieldName);
  };
}

export function Watch(stateField: string | symbol) {
  return function (target: any, methodName: string | symbol): void {
    const meta = getOrCreateComponentMeta(target);
    if (!meta.watchHandlers) meta.watchHandlers = new Map();
    const arr = meta.watchHandlers.get(stateField) || [];
    arr.push(methodName);
    meta.watchHandlers.set(stateField, arr);
  };
}
