# Echelon Framework

## 설명

Echelon은 데코레이터 기반의 반응성과 JSX/TSX를 지원하는 새로운 프레임워크입니다. 컴포넌트 기반 아키텍처를 통해 웹 애플리케이션을 효율적으로 구축할 수 있도록 설계되었습니다.

## 주요 특징

*   **데코레이터 기반 반응성**: `@State`, `@Prop`, `@Component` 등의 데코레이터를 사용하여 간결하고 직관적으로 컴포넌트의 상태와 속성을 관리합니다.
*   **JSX/TSX 지원**: TypeScript와 JSX를 완벽하게 지원하여 타입 안정성을 높이고 개발 생산성을 향상시킵니다.
*   **컴포넌트 시스템**: 재사용 가능한 컴포넌트를 통해 UI를 모듈화하고 관리합니다.
*   **선언적 렌더링**: `@Render` 데코레이터를 사용하여 컴포넌트의 UI를 선언적으로 정의합니다.
*   **이벤트 처리**: `@Event` 데코레이터를 통해 DOM 이벤트를 손쉽게 처리할 수 있습니다.
*   **생명주기 관리**: `@Mounted` 와 같은 데코레이터로 컴포넌트 생명주기 메서드를 정의할 수 있습니다.

## 설치

```bash
npm install
# 또는
yarn install
```

## 사용 방법

### 기본 컴포넌트 예제

다음은 Echelon 프레임워크를 사용한 간단한 카운터 컴포넌트의 예입니다.

```typescript jsx
// src/example/MyComponent.tsx
/** @jsx createElement */
/** @jsxFrag Fragment */
import { createElement, Fragment, Component, Render, State, Event, Prop, Children, Mounted } from 'echelon';

@Component('div') // 이 컴포넌트는 <div/> 태그로 렌더링됩니다.
class MyClicker {
  @State() count: number = 0;

  @Event('click')
  handleClick(event: MouseEvent) {
    console.log('Clicked at:', event.clientX, event.clientY);
    this.count++;
  }

  @Render()
  render(@Prop('initialMessage') message: string, @Children() children: Node[]) {
    return (
      <>
        <h1>{message}</h1>
        <p>Current count: {this.count}</p>
        {children}
      </>
    );
  }
}

@Component() // 태그를 지정하지 않으면 DocumentFragment를 기반으로 합니다.
export class AppRoot {
  @State() messageForChild: string = "Hello Echelon!";

  @Mounted()
  onAppMounted() {
    console.log("AppRoot component has been mounted!");
    setTimeout(() => {
      this.messageForChild = "Message updated after 2 seconds!";
    }, 2000);
  }

  @Render()
  render() {
    return (
      <MyClicker initialMessage={this.messageForChild}>
        <button>Click Me!</button>
        <p>This is a child passed to MyClicker.</p>
      </MyClicker>
    );
  }
}

// 애플리케이션 마운트 (예시: src/index.ts 또는 main.ts)
// import { mount } from 'echelon';
// import { AppRoot } from './example/MyComponent';
//
// const appRootElement = document.getElementById('app');
// if (appRootElement) {
//   mount(<AppRoot />, appRootElement);
// }
```

## 사용 가능한 스크립트

프로젝트 루트 디렉토리에서 다음 스크립트를 사용할 수 있습니다:

*   `npm run dev`: 개발 모드로 애플리케이션을 실행합니다. 파일 변경 시 자동으로 다시 빌드됩니다.
*   `npm run build`: 프로덕션용으로 애플리케이션을 빌드합니다. `dist` 디렉토리에 결과물이 생성됩니다.
*   `npm run clean`: `dist` 디렉토리를 삭제합니다.
*   `npm run lint`: ESLint를 사용하여 코드 스타일을 검사합니다.
*   `npm run format`: Prettier를 사용하여 코드 스타일을 자동으로 수정합니다.
*   `npm test`: Jest를 사용하여 유닛 테스트를 실행합니다.
*   `npm run test:watch`: Jest를 watch 모드로 실행하여 변경 사항을 감지하고 테스트를 다시 실행합니다.
*   `npm run test:cov`: Jest를 사용하여 테스트 커버리지를 생성합니다.

## 라이선스

이 프로젝트는 [MIT](LICENSE) 라이선스를 따릅니다. (package.json에 명시된 대로) 