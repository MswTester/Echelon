# Echelon Framework

## Overview

Echelon is a new framework supporting decorator driven reactivity and JSX/TSX syntax. Its component based architecture is designed for building web applications efficiently.

## Key Features

* **Decorator based reactivity**: Manage component state and attributes using decorators such as `@State`, `@Prop` and `@Component`.
* **JSX/TSX support**: Full TypeScript and JSX support improves type safety and developer productivity.
* **Component system**: Build and manage modular UI using reusable components.
* **Declarative rendering**: Define component UI declaratively with the `@Render` decorator.
* **Event handling**: Handle DOM events easily via the `@Event` decorator.
* **Lifecycle management**: Define lifecycle hooks like `@Mounted` for components.

## Installation

```bash
npm install
# or
yarn install
```

## Usage

### Basic Component Example

Below is a simple counter component built with Echelon.

```typescript jsx
// src/example/MyComponent.tsx
/** @jsx createElement */
/** @jsxFrag Fragment */
import { createElement, Fragment, Component, Render, State, Event, Prop, Children, Mounted } from 'echelon';

@Component('div') // This component renders as a <div> tag.
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

@Component() // Without a tag name a DocumentFragment is used as the host element.
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

// Application mount example (e.g. src/index.ts or main.ts)
// import { mount } from 'echelon';
// import { AppRoot } from './example/MyComponent';
//
// const appRootElement = document.getElementById('app');
// if (appRootElement) {
//   mount(<AppRoot />, appRootElement);
// }
```

### Style Decorators

You can bind class fields to DOM styles using `@Style` and `@StyleLayout`.

```typescript jsx
@Component('div')
class StyledBox {
  @Style() backgroundColor = 'blue'; // becomes background-color
  @StyleLayout() style = { color: 'white', transition: 'all 0.2s ease' };

  @Render()
  render() {
    return <span>Styled content</span>;
  }
}
```

### Complex Todo Example

A more advanced example demonstrating nested components and store usage is
provided in `src/example/TodoApp.tsx`.

```typescript
import { createElement, mount } from 'echelon';
import { TodoApp } from 'echelon/example/TodoApp';

const root = document.getElementById('app');
if (root) {
  mount(createElement(TodoApp, null), root);
}
```

Running this example shows that Echelon can handle dynamic lists and
inter-component communication, making it suitable for complex front-end
projects.

## Publishing

The framework builds to both ESM and CJS outputs. Create the npm package with:

```bash
npm run build
npm pack
```
This generates a tarball ready for publishing to the npm registry.

## Available Scripts

In the project root you can use the following scripts:

* `npm run dev`: Run the application in development mode with automatic rebuilds on file changes.
* `npm run build`: Build the application for production. Output is placed in the `dist` directory.
* `npm run clean`: Remove the `dist` directory.
* `npm run lint`: Check code style with ESLint.
* `npm run format`: Automatically format code using Prettier.
* `npm test`: Run unit tests using Jest.
* `npm run test:watch`: Run Jest in watch mode to re-run tests on changes.
* `npm run test:cov`: Generate a test coverage report using Jest.

## License

This project follows the [MIT](LICENSE) license as specified in `package.json`.
