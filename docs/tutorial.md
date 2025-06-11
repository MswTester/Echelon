# Tutorial

## Basic Component Example

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

## Style Decorators

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

## Complex Todo Example

A more advanced example demonstrating nested components and store usage is provided in `src/example/TodoApp.tsx`.

```typescript
import { createElement, mount } from 'echelon';
import { TodoApp } from 'echelon/example/TodoApp';

const root = document.getElementById('app');
if (root) {
  mount(createElement(TodoApp, null), root);
}
```

Running this example shows that Echelon can handle dynamic lists and inter-component communication, making it suitable for complex front-end projects.
