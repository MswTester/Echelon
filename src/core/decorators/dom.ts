import { getOrCreateComponentMeta } from './meta';

export function Event(domEventName: string) {
  return function (
    target: any,
    classMethodName: string | symbol
  ): void {
    const meta = getOrCreateComponentMeta(target);
    meta.eventHandlers.set(classMethodName, domEventName);
  };
}

export function Property(domPropertyName: string) {
  return function (target: any, classFieldName: string | symbol): void {
    const meta = getOrCreateComponentMeta(target);
    meta.propertyBindings.set(classFieldName, domPropertyName);
  };
}

export function Method(domMethodName: string) {
  return function (target: any, classFieldName: string | symbol): void {
    const meta = getOrCreateComponentMeta(target);
    meta.methodBindings.set(classFieldName, domMethodName);
  };
}

export function Style(cssStyleName?: string) {
  return function (target: any, classFieldName: string | symbol): void {
    const meta = getOrCreateComponentMeta(target);
    const styleName =
      cssStyleName ||
      (typeof classFieldName === 'string'
        ? classFieldName.replace(/([A-Z])/g, '-$1').toLowerCase()
        : String(classFieldName));
    meta.styleBindings.set(classFieldName, styleName);
  };
}

export function StyleLayout() {
  return function (target: any, classFieldName: string | symbol): void {
    const meta = getOrCreateComponentMeta(target);
    meta.styleLayoutFields.add(classFieldName);
  };
}
