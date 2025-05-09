// .eslintrc.js
module.exports = {
    parser: '@typescript-eslint/parser', // TypeScript 파서 지정
    parserOptions: {
      ecmaVersion: 2020, // 최신 ECMAScript 버전 사용
      sourceType: 'module', // ES 모듈 사용
      ecmaFeatures: {
        jsx: true, // JSX 파싱 활성화
      },
      project: './tsconfig.json', // 타입 기반 린팅을 위해 tsconfig.json 경로 지정
    },
    env: {
      browser: true, // 브라우저 환경 (window, document 등)
      node: true, // Node.js 환경 (global, process 등)
      es2021: true, // ES2021 전역 변수 사용 가능
      jest: true, // Jest 테스트 환경 (describe, it 등)
    },
    plugins: [
      '@typescript-eslint', // TypeScript 플러그인
      // 'react' // Echelon은 자체 JSX이므로 React 플러그인은 신중하게 사용 (아래 참고)
    ],
    extends: [
      'eslint:recommended', // ESLint 추천 규칙
      'plugin:@typescript-eslint/recommended', // TypeScript 추천 규칙
      // 'plugin:@typescript-eslint/recommended-requiring-type-checking', // 타입 정보가 필요한 규칙 (성능에 영향 줄 수 있음, 필요시 활성화)
      'prettier', // Prettier와 충돌하는 ESLint 규칙 비활성화 (반드시 마지막에 추가)
      // 'plugin:prettier/recommended' // 위 prettier와 eslint-plugin-prettier를 합친 효과, eslint-plugin-prettier 설치 시 사용 가능
    ],
    rules: {
      // 여기에 프로젝트별 커스텀 규칙 추가
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }], // 사용하지 않는 변수 경고 (밑줄로 시작하는 인자는 무시)
      '@typescript-eslint/explicit-function-return-type': 'off', // 함수 반환 타입 명시 강제 비활성화 (취향에 따라 'warn' 또는 'error')
      '@typescript-eslint/explicit-module-boundary-types': 'off', // export 되는 함수/클래스 메소드의 반환 타입 명시 강제 비활성화
      '@typescript-eslint/no-explicit-any': 'warn', // 'any' 타입 사용 시 경고
      '@typescript-eslint/no-non-null-assertion': 'warn', // '!' non-null assertion 사용 시 경고
  
      // Echelon 프레임워크 관련 고려사항:
      // 만약 React 플러그인 규칙을 일부 사용하고 싶다면, Echelon의 특성과 맞지 않는 규칙은 비활성화 해야합니다.
      // 예: 'react/react-in-jsx-scope': 'off', // Echelon은 전역 React 객체가 필요 없음
      //     'react/prop-types': 'off',        // TypeScript로 prop 타입 관리
      //     'react/no-unknown-property': ['error', { ignore: ['class'] }] // React와 다른 HTML 표준 속성 사용 시 (예: class 대신 className)
      // 하지만 Echelon은 React와 다르므로, JSX 관련해서는 기본적인 문법 검사 외에는 주의가 필요합니다.
  
      // 프레임워크 제작 시 도움이 될 수 있는 규칙 예시 (선택적)
      // 'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off', // 프로덕션 빌드 시 console 사용 경고
    },
    settings: {
      // React 플러그인 사용 시 JSX pragma 설정 (Echelon의 createElement 함수)
      // react: {
      //   version: 'detect', // React 버전 자동 감지 (필요 없음)
      //   pragma: 'Echelon', // JSX pragma (Babel 설정과 일치시켜야 함)
      //   fragment: 'Fragment', // JSX Fragment pragma (Babel 설정과 일치)
      // },
      // TypeScript resolver 설정 (import/resolver 같은 플러그인 사용 시)
    },
    ignorePatterns: ['node_modules/', 'dist/', 'coverage/', '*.config.js', '.eslintrc.js', '.prettierrc.js'], // ESLint가 무시할 파일/폴더
  };