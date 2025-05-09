/* eslint-disable @typescript-eslint/no-explicit-any */
// src/core/types.ts
// import type { EchelonComponent } from './EchelonComponent'; // 제거
import type { EchelonElement } from './jsx';

export const COMPONENT_META_KEY = Symbol('EchelonComponentMeta');
export const INTERNAL_INSTANCE_KEY = Symbol('EchelonInternalInstance'); // 새 심볼 추가

// ComponentMeta 인터페이스는 이전과 동일
export interface ComponentMeta {
  componentName: string;
  tagName?: string;
  renderMethodName?: string | symbol;
  mountedMethodName?: string | symbol;
  destroyedMethodName?: string | symbol;
  eventHandlers: Map<string | symbol, string>; 
  propertyBindings: Map<string | symbol, string>; 
  methodBindings: Map<string | symbol, string>;
  styleBindings: Map<string | symbol, string>; 
  propMappings: Map<number, string>; 
  childrenParamIndex?: number;
  stateFields: Set<string | symbol>; 
}

export interface EchelonInternalComponentInstance {
  componentObject: object; // EchelonComponent -> object 타입으로 변경
  hostDomElement: HTMLElement | DocumentFragment;
  currentRenderedDomNodes: Node[];
  meta: ComponentMeta;
  props: Record<string, any>;
  jsxChildren: EchelonElement[];
  isMounted: boolean;
  update: () => void;
  destroy: () => void;
  _eventListeners: Array<{ eventName: string, handler: (event: Event) => void, domElement: HTMLElement }>;
}