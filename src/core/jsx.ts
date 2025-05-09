/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
// src/core/jsx.ts

export const Fragment = Symbol('Echelon.Fragment');

export interface EchelonElement<P = any> {
  type: string | Function | symbol;
  props: P & { children?: EchelonElement<any>[] | EchelonElement<any> };
  key?: string | number; // key는 현재 diffing에서 사용되지 않지만, 확장성 위해 남겨둠
}

export function createElement<P extends object>(
  type: string | Function | typeof Fragment,
  props: P | null,
  ...childrenInput: any[]
): EchelonElement<P> {
  const children = childrenInput
    .flat(Infinity) // 중첩 배열 자식들 평탄화
    .map(child =>
      // 이미 EchelonElement 객체 형태인지 확인 (type 프로퍼티 존재 여부)
      typeof child === 'object' && child !== null && 'type' in child
        ? child
        : createTextElement(child) // 그 외에는 텍스트 요소로 변환 시도
    )
    .filter(child => child !== null) as EchelonElement<any>[]; // null이 아닌 요소만 필터링 (boolean 등 제외)

  return {
    type,
    props: {
      ...(props || {}), // null props는 빈 객체로
      children,
    } as P & { children?: EchelonElement<any>[] },
  };
}

// 헬퍼: 텍스트 노드 EchelonElement 생성
function createTextElement(
  text: string | number | boolean | null | undefined
): EchelonElement<{ textContent: string }> | null {
  // null, undefined, boolean 값은 렌더링하지 않음 (React와 유사한 동작)
  if (text == null || typeof text === 'boolean') {
    return null;
  }
  return {
    type: 'TEXT_ELEMENT', // 텍스트 노드를 식별하기 위한 내부 타입
    props: {
      textContent: String(text),
      children: [], // 텍스트 노드는 자식을 갖지 않음
    },
  };
}