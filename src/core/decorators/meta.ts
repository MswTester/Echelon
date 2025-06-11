import 'reflect-metadata';
import { COMPONENT_META_KEY, ComponentMeta } from 'echelon/core/types';

export function getOrCreateComponentMeta(targetOrConstructor: any): ComponentMeta {
  const constructor =
    typeof targetOrConstructor === 'function'
      ? targetOrConstructor
      : targetOrConstructor.constructor;

  if (!Reflect.hasOwnMetadata(COMPONENT_META_KEY, constructor)) {
    const componentName = constructor.name || 'AnonymousComponent';
    const newMeta: ComponentMeta = {
      componentName,
      eventHandlers: new Map(),
      propertyBindings: new Map(),
      methodBindings: new Map(),
      styleBindings: new Map(),
      styleLayoutFields: new Set(),
      propMappings: new Map(),
      stateFields: new Set(),
      storeFields: new Map(),
      routeParamFields: new Map(),
      queryParamFields: new Map(),
    };
    Reflect.defineMetadata(COMPONENT_META_KEY, newMeta, constructor);
    return newMeta;
  }

  const meta = Reflect.getOwnMetadata(
    COMPONENT_META_KEY,
    constructor
  ) as ComponentMeta;
  if (!meta.eventHandlers) meta.eventHandlers = new Map();
  if (!meta.propertyBindings) meta.propertyBindings = new Map();
  if (!meta.methodBindings) meta.methodBindings = new Map();
  if (!meta.styleBindings) meta.styleBindings = new Map();
  if (!meta.styleLayoutFields) meta.styleLayoutFields = new Set();
  if (!meta.propMappings) meta.propMappings = new Map();
  if (!meta.stateFields) meta.stateFields = new Set();
  if (!meta.storeFields) meta.storeFields = new Map();
  if (!meta.routeParamFields) meta.routeParamFields = new Map();
  if (!meta.queryParamFields) meta.queryParamFields = new Map();

  return meta;
}
