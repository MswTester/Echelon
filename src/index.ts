// src/index.ts
import 'reflect-metadata'; // 데코레이터 메타데이터 사용을 위해 최상단에서 import

// JSX 관련 요소 (이름 충돌 방지를 위해 필요시 as로 alias 가능)
export { createElement, Fragment } from './core/jsx';

// 데코레이터들
export {
  Component,
  Render,
  Mounted,
  BeforeMount,
  Destroyed,
  BeforeUnmount,
  BeforeUpdate,
  Updated,
  ErrorCaptured,
  Event,
  State,
  Watch,
  Prop,
  Children,
  Style,
  StyleLayout,
  Property,
  Method,
  Store,
  Use,
} from './core/decorators';

// 마운트 함수
export { mount } from './core/renderer';

// 타입들 (필요한 경우 외부 사용을 위해 export)
export type { EchelonElement } from './core/jsx';
export type { EchelonInternalComponentInstance, ComponentMeta, INTERNAL_INSTANCE_KEY } from './core/types';

// Babel JSX pragma가 createElement, Fragment를 찾을 수 있도록 전역 설정 (선택적, 권장되지 않음)
// if (typeof window !== 'undefined') {
//   if (!(window as any).createElement) (window as any).createElement = createElement;
//   if (!(window as any).Fragment) (window as any).Fragment = Fragment;
// } else if (typeof global !== 'undefined') {
//   if (!(global as any).createElement) (global as any).createElement = createElement;
//   if (!(global as any).Fragment) (global as any).Fragment = Fragment;
// }
// --> 전역 설정 대신, 각 .tsx 파일 상단에 import 하거나, Babel의 `runtime: 'automatic'`과 `importSource` 옵션 사용 권장.