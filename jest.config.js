// jest.config.js
module.exports = {
    preset: 'ts-jest', // TypeScript 파일(.ts, .tsx)을 위한 프리셋
    testEnvironment: 'jsdom', // DOM API 시뮬레이션을 위해 jsdom 환경 사용 (프론트엔드 프레임워크에 적합)
    roots: ['<rootDir>/src', '<rootDir>/tests'], // 테스트 파일이 위치할 기본 경로들
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'], // 테스트 대상 파일 확장자
  
    // TypeScript 및 JSX 변환 설정
    transform: {
      '^.+\\.(ts|tsx)$': [
        'ts-jest',
        {
          tsconfig: 'tsconfig.json', // 사용할 tsconfig 파일 지정
          // babelConfig: true, // .babelrc 또는 babel.config.js 를 사용하도록 설정
                             // ts-jest가 내부적으로 Babel을 호출하여 TS/TSX를 처리하게 할 수 있음
                             // 특히 데코레이터와 같은 고급 기능을 Babel로 처리해야 할 때 유용
        },
      ],
      // 만약 .js, .jsx 파일도 Babel 변환이 필요하다면 추가:
      // '^.+\\.(js|jsx)$': 'babel-jest',
    },
  
    // 테스트 커버리지 설정
    collectCoverage: true,
    coverageDirectory: 'coverage',
    collectCoverageFrom: [
      'src/**/*.{ts,tsx}', // 커버리지 수집 대상 파일
      '!src/**/*.d.ts', // 타입 정의 파일은 제외
      '!src/index.ts', // 진입점 파일은 필요에 따라 제외
      '!src/core/jsx.ts', // JSX 팩토리 함수 (테스트 방식에 따라 포함/제외)
    ],
  
    // 모듈 경로 매핑 (tsconfig.json의 paths와 유사하게 설정)
    moduleNameMapper: {
      '^echelon/(.*)$': '<rootDir>/src/$1',
      '^echelon$': '<rootDir>/src/index.ts',
      // CSS 모듈 등을 위한 mock 설정 (필요하다면)
      // '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    },
  
    // 각 테스트 파일 실행 전에 실행할 설정 파일 (전역 설정)
    setupFilesAfterEnv: [
      '<rootDir>/tests/setupTests.ts', // 예시 경로
      // 'reflect-metadata', // 데코레이터 메타데이터 사용 시
    ],
  
    // 테스트 파일 매칭 패턴
    testMatch: [
      '**/tests/**/*.test.(ts|tsx)', // tests 폴더 내 .test.ts 또는 .test.tsx 파일
      '**/src/**/*.test.(ts|tsx)', // src 폴더 내 .test.ts 또는 .test.tsx 파일
    ],
  
    // 데코레이터 사용 시 reflect-metadata 임포트
    // setupFiles: ['reflect-metadata'], // 이 방법도 가능하지만 setupFilesAfterEnv가 더 일반적
  
    // ts-jest가 babel.config.js를 사용하도록 명시 (특히 decorator plugin 때문)
    globals: {
      'ts-jest': {
        babelConfig: true, // 중요: ts-jest가 babel.config.js를 사용하도록 함
                           // Babel 플러그인(@babel/plugin-proposal-decorators 등)이 적용됨
      },
    },
  };