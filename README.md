# Echelon Framework

Echelon is a decorator-driven framework with full JSX/TSX support. It lets you build modular components in TypeScript with minimal boilerplate.

## Key Features

* **Decorator based reactivity**: Manage component state and attributes using decorators such as `@State`, `@Prop` and `@Component`.
* **JSX/TSX support**: Full TypeScript and JSX support improves type safety and developer productivity.
* **Component system**: Build and manage modular UI using reusable components.
* **Declarative rendering**: Define component UI declaratively with the `@Render` decorator.
* **Event handling**: Handle DOM events easily via the `@Event` decorator.
* **Lifecycle management**: Define lifecycle hooks like `@Mounted` for components.

## Quick Start

```bash
npm install echelonjs
```

```typescript jsx
import { createElement, Component, Render, State, mount } from 'echelonjs';

@Component('button')
class Counter {
  @State() count = 0;
  @Render()
  render() {
    return <span>{this.count}</span>;
  }
}

const root = document.getElementById('app');
if (root) {
  mount(<Counter />, root);
}
```

For full installation instructions and a detailed tutorial, see the [documentation](docs/README.md).

## License

This project follows the [MIT](LICENSE) license as specified in `package.json`.
