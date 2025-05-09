// tests/setupTests.ts
import 'reflect-metadata'; // 데코레이터 메타데이터 기능을 사용한다면 필수

// Jest DOM 매처 확장 (선택 사항, 더 풍부한 DOM 어설션 제공)
// import '@testing-library/jest-dom';

// 전역 mock 설정 예시
// global.ResizeObserver = jest.fn().mockImplementation(() => ({
//   observe: jest.fn(),
//   unobserve: jest.fn(),
//   disconnect: jest.fn(),
// }));

console.log('Jest setup file loaded.');