import { getOrCreateComponentMeta } from './meta';

export function Prop(propNameFromParent: string) {
  return function (
    target: any,
    renderMethodName: string | symbol,
    parameterIndex: number
  ): void {
    const meta = getOrCreateComponentMeta(target);
    if (meta.renderMethodName && meta.renderMethodName !== renderMethodName) {
      console.warn(
        `@Prop used on parameter of method "${String(renderMethodName)}" but @Render is on "${String(meta.renderMethodName)}".`
      );
    }
    meta.propMappings.set(parameterIndex, propNameFromParent);
  };
}

export function Children() {
  return function (
    target: any,
    renderMethodName: string | symbol,
    parameterIndex: number
  ): void {
    const meta = getOrCreateComponentMeta(target);
    if (meta.renderMethodName && meta.renderMethodName !== renderMethodName) {
      console.warn(
        `@Children used on parameter of method "${String(renderMethodName)}" but @Render is on "${String(meta.renderMethodName)}".`
      );
    }
    meta.childrenParamIndex = parameterIndex;
  };
}

export function Param(name: string) {
  return function (target: any, classFieldName: string | symbol): void {
    const meta = getOrCreateComponentMeta(target);
    if (!meta.routeParamFields) meta.routeParamFields = new Map();
    meta.routeParamFields.set(classFieldName, name);
    meta.stateFields.add(classFieldName);
  };
}

export function Query(name: string) {
  return function (target: any, classFieldName: string | symbol): void {
    const meta = getOrCreateComponentMeta(target);
    if (!meta.queryParamFields) meta.queryParamFields = new Map();
    meta.queryParamFields.set(classFieldName, name);
    meta.stateFields.add(classFieldName);
  };
}
