import { getOrCreateComponentMeta } from './meta';

export function Render() {
  return function (target: any, propertyKey: string | symbol): void {
    const meta = getOrCreateComponentMeta(target);
    meta.renderMethodName = propertyKey;
  };
}

export function Mounted() {
  return function (target: any, propertyKey: string | symbol): void {
    const meta = getOrCreateComponentMeta(target);
    meta.mountedMethodName = propertyKey;
  };
}

export function BeforeMount() {
  return function (target: any, propertyKey: string | symbol): void {
    const meta = getOrCreateComponentMeta(target);
    meta.beforeMountMethodName = propertyKey;
  };
}

export function BeforeUpdate() {
  return function (target: any, propertyKey: string | symbol): void {
    const meta = getOrCreateComponentMeta(target);
    meta.beforeUpdateMethodName = propertyKey;
  };
}

export function Updated() {
  return function (target: any, propertyKey: string | symbol): void {
    const meta = getOrCreateComponentMeta(target);
    meta.updatedMethodName = propertyKey;
  };
}

export function BeforeUnmount() {
  return function (target: any, propertyKey: string | symbol): void {
    const meta = getOrCreateComponentMeta(target);
    meta.beforeUnmountMethodName = propertyKey;
  };
}

export function ErrorCaptured() {
  return function (target: any, propertyKey: string | symbol): void {
    const meta = getOrCreateComponentMeta(target);
    meta.errorCapturedMethodName = propertyKey;
  };
}

export function Destroyed() {
  return function (target: any, propertyKey: string | symbol): void {
    const meta = getOrCreateComponentMeta(target);
    meta.destroyedMethodName = propertyKey;
  };
}
