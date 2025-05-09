/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// src/core/decorators.ts
import 'reflect-metadata';
import { COMPONENT_META_KEY, ComponentMeta } from 'echelon/core/types';

// 헬퍼 함수: 클래스의 메타데이터를 안전하게 가져오거나 새로 생성
function getOrCreateComponentMeta(targetOrConstructor: any): ComponentMeta {
  const constructor = typeof targetOrConstructor === 'function' ? targetOrConstructor : targetOrConstructor.constructor;
  
  if (!Reflect.hasOwnMetadata(COMPONENT_META_KEY, constructor)) {
    const componentName = constructor.name || 'AnonymousComponent';
    const newMeta: ComponentMeta = {
      componentName,
      eventHandlers: new Map(),
      propertyBindings: new Map(),
      methodBindings: new Map(),
      styleBindings: new Map(),
      propMappings: new Map(),
      stateFields: new Set(),
      // tagName, renderMethodName 등은 데코레이터에서 직접 설정
    };
    Reflect.defineMetadata(COMPONENT_META_KEY, newMeta, constructor);
    return newMeta;
  }
  
  // 기존 메타데이터가 있다면, 누락된 Set/Map 필드들을 초기화 (방어 코드)
  const meta = Reflect.getOwnMetadata(COMPONENT_META_KEY, constructor) as ComponentMeta;
  if (!meta.eventHandlers) meta.eventHandlers = new Map();
  if (!meta.propertyBindings) meta.propertyBindings = new Map();
  if (!meta.methodBindings) meta.methodBindings = new Map();
  if (!meta.styleBindings) meta.styleBindings = new Map();
  if (!meta.propMappings) meta.propMappings = new Map();
  if (!meta.stateFields) meta.stateFields = new Set();

  return meta;
}

// --- 클래스 데코레이터 ---
export function Component(tagName?: string) {
  return function <T extends { new (...args: any[]): object }>(constructor: T) {
    const meta = getOrCreateComponentMeta(constructor);
    meta.tagName = tagName;
  };
}

// --- 메서드 데코레이터 ---
export function Render() {
  return function (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
    const meta = getOrCreateComponentMeta(target);
    meta.renderMethodName = propertyKey;
  };
}

export function Mounted() {
  return function (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
    const meta = getOrCreateComponentMeta(target);
    meta.mountedMethodName = propertyKey;
  };
}

export function Destroyed() {
  return function (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
    const meta = getOrCreateComponentMeta(target);
    meta.destroyedMethodName = propertyKey;
  };
}

// 클래스 메서드를 DOM 이벤트 핸들러로 지정
export function Event(domEventName: string) {
  return function (target: any, classMethodName: string | symbol, descriptor: TypedPropertyDescriptor<(event: any) => void>) {
    const meta = getOrCreateComponentMeta(target);
    meta.eventHandlers.set(classMethodName, domEventName);
  };
}

// --- 필드 데코레이터 ---
export function State() {
  return function (target: any, classFieldName: string | symbol) {
    const meta = getOrCreateComponentMeta(target);
    meta.stateFields.add(classFieldName);
  };
}

export function Property(domPropertyName: string) {
  return function (target: any, classFieldName: string | symbol) {
    const meta = getOrCreateComponentMeta(target);
    meta.propertyBindings.set(classFieldName, domPropertyName);
  };
}

export function Method(domMethodName: string) {
  return function (target: any, classFieldName: string | symbol) {
    const meta = getOrCreateComponentMeta(target);
    meta.methodBindings.set(classFieldName, domMethodName);
  };
}

export function Style(cssStyleName: string) {
  return function (target: any, classFieldName: string | symbol) {
    const meta = getOrCreateComponentMeta(target);
    meta.styleBindings.set(classFieldName, cssStyleName);
  };
}

// --- 파라미터 데코레이터 (Render 메서드의 파라미터에 사용) ---
export function Prop(propNameFromParent: string) {
  return function (target: any, renderMethodName: string | symbol, parameterIndex: number) {
    const meta = getOrCreateComponentMeta(target); // target은 클래스의 프로토타입
    if (meta.renderMethodName && meta.renderMethodName !== renderMethodName) {
        console.warn(`@Prop used on parameter of method "${String(renderMethodName)}" but @Render is on "${String(meta.renderMethodName)}".`);
    }
    meta.propMappings.set(parameterIndex, propNameFromParent);
  };
}

export function Children() {
  return function (target: any, renderMethodName: string | symbol, parameterIndex: number) {
    const meta = getOrCreateComponentMeta(target);
    if (meta.renderMethodName && meta.renderMethodName !== renderMethodName) {
        console.warn(`@Children used on parameter of method "${String(renderMethodName)}" but @Render is on "${String(meta.renderMethodName)}".`);
    }
    meta.childrenParamIndex = parameterIndex;
  };
}