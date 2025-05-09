/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// JSX 타입 선언
namespace JSX {
  interface IntrinsicElements {
    // HTML 요소 기본 타입
    div: any;
    span: any;
    p: any;
    h1: any;
    h2: any;
    h3: any;
    h4: any;
    h5: any;
    h6: any;
    button: any;
    input: any;
    a: any;
    ul: any;
    ol: any;
    li: any;
    // 필요한 다른 HTML 요소들...
    [elemName: string]: any; // 다른 모든 요소 허용
  }
}

declare global {
  namespace JSX {
    interface ElementAttributesProperty { props: object; }
    interface ElementChildrenAttribute { children: any; }
  }
}