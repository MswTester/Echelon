# Echelon Framework Documentation

Echelon is a modern, decorator-driven JavaScript/TypeScript framework with full JSX/TSX support. It provides a reactive component system with minimal boilerplate through the power of decorators and reflection metadata.

> **🚀 Production Ready**: This framework has been thoroughly tested and optimized for production use. All core features including components, state management, DOM bindings, computed properties, routing, and lifecycle hooks are working reliably. Advanced features have been hardened with performance optimizations and production-level error handling. See [Production Summary](../PRODUCTION_READY_SUMMARY.md) for full details.

## Table of Contents

- [Quick Start](#quick-start)
- [Core Concepts](#core-concepts)
- [Working Examples](./working-examples.md)
- [Known Limitations](./known-limitations.md)
- [API Reference](./api-reference.md)
- [Tutorial](./tutorial.md)

## Quick Start

### Installation

```bash
npm install echelonjs reflect-metadata
```

### Basic Setup

```typescript
// main.ts
import 'reflect-metadata';
import { createElement, Component, Render, State, mount } from 'echelonjs';

@Component('div')
class Counter {
  @State() count = 0;

  @Event('click')
  increment() {
    this.count++;
  }

  @Render()
  render() {
    return <button>Count: {this.count}</button>;
  }
}

mount(<Counter />, document.getElementById('app')!);
```

### JSX Configuration

Configure your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "jsx": "react",
    "jsxFactory": "createElement",
    "jsxFragmentFactory": "Fragment",
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

Or use JSX pragma comments in each file:

```typescript
/** @jsx createElement */
/** @jsxFrag Fragment */
```

## Core Concepts

### Components

Components in Echelon are TypeScript classes decorated with `@Component`:

```typescript
@Component('div')  // Creates a div element
class MyComponent {
  @Render()
  render() {
    return <span>Hello World</span>;
  }
}

@Component()  // Fragment-based component (no root element)
class FragmentComponent {
  @Render()
  render() {
    return <div>Content</div>;
  }
}
```

### Reactive State

Use `@State()` to create reactive properties that trigger re-renders:

```typescript
@Component('div')
class StatefulComponent {
  @State() message = 'Hello';
  @State() counter = 0;

  @Render()
  render() {
    return <div>{this.message}: {this.counter}</div>;
  }
}
```

### Event Handling

Bind DOM events to component methods with `@Event()`:

```typescript
@Component('button')
class ClickableButton {
  @State() clicked = false;

  @Event('click')
  handleClick(event: MouseEvent) {
    this.clicked = true;
  }

  @Render()
  render() {
    return <span>{this.clicked ? 'Clicked!' : 'Click me'}</span>;
  }
}
```

### Props and Children

Pass data to components using props and children:

```typescript
@Component('div')
class GreetingCard {
  @Render()
  render(
    @Prop('name') name: string,
    @Prop('age') age: number,
    @Children() children: any
  ) {
    return (
      <div>
        <h1>Hello {name}, age {age}</h1>
        <div>{children}</div>
      </div>
    );
  }
}

// Usage
<GreetingCard name="Alice" age={25}>
  <p>Welcome to Echelon!</p>
</GreetingCard>
```

### Lifecycle Hooks

Echelon provides comprehensive lifecycle management:

```typescript
@Component('div')
class LifecycleComponent {
  @BeforeMount()
  beforeMount() {
    console.log('About to mount');
  }

  @Mounted()
  mounted() {
    console.log('Component mounted');
  }

  @BeforeUpdate()
  beforeUpdate() {
    console.log('About to update');
  }

  @Updated()
  updated() {
    console.log('Component updated');
  }

  @BeforeUnmount()
  beforeUnmount() {
    console.log('About to unmount');
  }

  @Destroyed()
  destroyed() {
    console.log('Component destroyed');
  }

  @ErrorCaptured()
  errorCaptured(error: Error, context: any) {
    console.error('Error caught:', error);
    return false; // Re-throw error
  }

  @Render()
  render() {
    return <span>Lifecycle Demo</span>;
  }
}
```

## API Reference

### Core Decorators

#### `@Component(tagName?: string)`
Marks a class as an Echelon component.
- `tagName`: Optional HTML tag name for the root element. If omitted, creates a fragment-based component.

#### `@Render()`
Marks a method as the render function. Must return JSX.

#### `@State()`
Makes a property reactive. Changes trigger component re-renders.

#### `@Event(eventName: string)`
Binds a DOM event to a component method.
- `eventName`: DOM event name (e.g., 'click', 'input', 'submit')

#### `@Prop(propName: string)`
Maps a render method parameter to a prop from parent component.

#### `@Children()`
Maps a render method parameter to receive child elements.

### DOM Binding Decorators

#### `@Property(domPropertyName: string)`
Binds a component field to a DOM property:

```typescript
@Component('input')
class InputComponent {
  @Property('value') inputValue = '';
  @Property('disabled') isDisabled = false;
}
```

#### `@Method(domMethodName: string)`
Binds a component field to a DOM method:

```typescript
@Component('input')
class InputComponent {
  @Method('focus') focusInput!: () => void;
  @Method('blur') blurInput!: () => void;

  @Event('click')
  handleClick() {
    this.focusInput(); // Calls DOM focus() method
  }
}
```

#### `@Style(cssProperty?: string)`
Binds a component field to a CSS style property:

```typescript
@Component('div')
class StyledComponent {
  @Style('background-color') bgColor = 'red';
  @Style() color = 'white'; // Uses field name as CSS property
  @Style() fontSize = '16px'; // Converts camelCase to kebab-case
}
```

#### `@StyleLayout()`
Binds a component field to multiple CSS properties via object:

```typescript
@Component('div')
class LayoutComponent {
  @StyleLayout() layout = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '200px'
  };
}
```

### Computed Properties

Create derived values that automatically update when dependencies change:

```typescript
@Component('div')
class ComputedExample {
  @State() firstName = 'John';
  @State() lastName = 'Doe';

  @Computed()
  get fullName() {
    return `${this.firstName} ${this.lastName}`;
  }

  @Render()
  render() {
    return <span>Full name: {this.fullName}</span>;
  }
}
```

### Watchers

React to state changes with `@Watch()`:

```typescript
@Component('div')
class WatcherExample {
  @State() count = 0;

  @Watch('count')
  onCountChange(newValue: number, oldValue: number) {
    console.log(`Count changed from ${oldValue} to ${newValue}`);
  }

  @Event('click')
  increment() {
    this.count++;
  }

  @Render()
  render() {
    return <button>Count: {this.count}</button>;
  }
}
```

## Router System

Echelon includes a built-in router for single-page applications:

### Basic Router Setup

```typescript
import { Router, RouterOutlet, Link, navigate } from 'echelonjs';

@Component()
class App {
  @Render()
  render() {
    return (
      <Router>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
          <Link to="/users/123">User 123</Link>
        </nav>
        <RouterOutlet />
      </Router>
    );
  }
}

// Configure routes
const routes = [
  { path: '/', component: Home },
  { path: '/about', component: About },
  { path: '/users/:id', component: UserProfile },
];

// Set routes on router
const router = new Router();
router.routes = routes;
```

### Route Parameters and Query Strings

Access route parameters and query strings in components:

```typescript
@Component('div')
class UserProfile {
  @Param('id') userId: string = '';
  @Query('tab') activeTab: string = 'profile';

  @Render()
  render() {
    return (
      <div>
        <h1>User ID: {this.userId}</h1>
        <p>Active Tab: {this.activeTab}</p>
      </div>
    );
  }
}
```

### Programmatic Navigation

```typescript
import { navigate } from 'echelonjs';

@Component('button')
class NavigationButton {
  @Event('click')
  goToAbout() {
    navigate('/about?section=team');
  }

  @Render()
  render() {
    return <span>Go to About</span>;
  }
}
```

### Route Guards

Protect routes with guard functions:

```typescript
const routes = [
  {
    path: '/admin',
    component: AdminPanel,
    guard: () => {
      return localStorage.getItem('isAdmin') === 'true';
    }
  }
];
```

## State Management

### Global Store

Share state across components with the global store:

```typescript
@Component('div')
class ComponentA {
  @Store('sharedCounter') counter = 0;

  @Event('click')
  increment() {
    this.counter++;
  }

  @Render()
  render() {
    return <button>A: {this.counter}</button>;
  }
}

@Component('div')
class ComponentB {
  @Use('sharedCounter') counter = 0; // Uses existing store

  @Render()
  render() {
    return <span>B: {this.counter}</span>;
  }
}
```

### Custom Store ID

```typescript
@Component('div')
class UserComponent {
  @Store('user-preferences') preferences = { theme: 'dark', lang: 'en' };
  @Store() localData = []; // Uses field name as store ID
}
```

## Examples

### Todo List Application

```typescript
@Component('li')
class TodoItem {
  @Event('click')
  handleClick() {
    this.onRemove(this.idx);
  }

  @Render()
  render(
    @Prop('text') text: string,
    @Prop('idx') idx: number,
    @Prop('onRemove') onRemove: (i: number) => void
  ) {
    this.idx = idx;
    this.onRemove = onRemove;
    return <span>{text}</span>;
  }
}

@Component('div')
class TodoApp {
  @Store('todos') items: string[] = [];
  @State() inputValue = '';

  removeItem(index: number) {
    this.items = this.items.filter((_, i) => i !== index);
  }

  @Event('submit')
  addItem(e: Event) {
    e.preventDefault();
    if (this.inputValue.trim()) {
      this.items = [...this.items, this.inputValue];
      this.inputValue = '';
    }
  }

  @Event('input')
  updateInput(e: InputEvent) {
    this.inputValue = (e.target as HTMLInputElement).value;
  }

  @Render()
  render() {
    return (
      <>
        <form>
          <input value={this.inputValue} />
          <button type="submit">Add</button>
        </form>
        <ul>
          {this.items.map((text, idx) => (
            <TodoItem
              text={text}
              idx={idx}
              onRemove={this.removeItem.bind(this)}
            />
          ))}
        </ul>
      </>
    );
  }
}
```

### Interactive Counter with Styling

```typescript
@Component('div')
class StyledCounter {
  @State() count = 0;
  @Style('background-color') bgColor = 'lightblue';
  @Style() color = 'darkblue';
  @StyleLayout() layout = {
    padding: '20px',
    textAlign: 'center',
    borderRadius: '8px',
    transition: 'all 0.3s ease'
  };
  @Property('id') elementId = 'counter-div';

  @Computed()
  get countColor() {
    return this.count > 10 ? 'red' : 'green';
  }

  @Watch('count')
  onCountChange(newCount: number) {
    this.bgColor = newCount % 2 === 0 ? 'lightblue' : 'lightgreen';
  }

  @Event('click')
  increment() {
    this.count++;
  }

  @Render()
  render(@Children() children: any) {
    return (
      <div>
        <h2 style={{ color: this.countColor }}>Count: {this.count}</h2>
        {children}
      </div>
    );
  }
}
```

## Tutorial

### Step 1: Create Your First Component

Create a simple greeting component:

```typescript
// greeting.ts
import { Component, Render, State, Event } from 'echelonjs';

@Component('div')
export class Greeting {
  @State() name = 'World';

  @Event('input')
  updateName(e: InputEvent) {
    this.name = (e.target as HTMLInputElement).value;
  }

  @Render()
  render() {
    return (
      <div>
        <input value={this.name} placeholder="Enter your name" />
        <h1>Hello, {this.name}!</h1>
      </div>
    );
  }
}
```

### Step 2: Add Interactivity

Enhance with more interactive features:

```typescript
@Component('div')
export class InteractiveGreeting {
  @State() name = '';
  @State() greetingCount = 0;
  @State() theme = 'light';

  @Computed()
  get greetingMessage() {
    if (this.greetingCount === 0) return `Hello, ${this.name || 'stranger'}!`;
    return `Hello again, ${this.name}! (${this.greetingCount} greetings)`;
  }

  @Event('input')
  updateName(e: InputEvent) {
    this.name = (e.target as HTMLInputElement).value;
  }

  @Event('click')
  greet() {
    this.greetingCount++;
  }

  @Event('click')
  toggleTheme() {
    this.theme = this.theme === 'light' ? 'dark' : 'light';
  }

  @Render()
  render() {
    const themeClass = this.theme === 'dark' ? 'dark-theme' : 'light-theme';
    
    return (
      <div className={themeClass}>
        <input 
          value={this.name} 
          placeholder="Enter your name" 
        />
        <button onClick={this.greet}>Greet</button>
        <button onClick={this.toggleTheme}>
          Switch to {this.theme === 'light' ? 'dark' : 'light'} theme
        </button>
        <h1>{this.greetingMessage}</h1>
      </div>
    );
  }
}
```

### Step 3: Component Composition

Create reusable components:

```typescript
@Component('button')
class Button {
  @Event('click')
  handleClick() {
    this.onClick();
  }

  @Render()
  render(
    @Prop('onClick') onClick: () => void,
    @Children() children: any
  ) {
    this.onClick = onClick;
    return <span>{children}</span>;
  }
}

@Component('div')
class Card {
  @Render()
  render(
    @Prop('title') title: string,
    @Children() children: any
  ) {
    return (
      <div className="card">
        <h2>{title}</h2>
        <div className="card-content">
          {children}
        </div>
      </div>
    );
  }
}

@Component('div')
export class App {
  @State() count = 0;

  increment = () => this.count++;
  decrement = () => this.count--;

  @Render()
  render() {
    return (
      <div>
        <Card title="Counter App">
          <p>Current count: {this.count}</p>
          <Button onClick={this.increment}>Increment</Button>
          <Button onClick={this.decrement}>Decrement</Button>
        </Card>
      </div>
    );
  }
}
```

### Step 4: Add Routing

Create a multi-page application:

```typescript
// pages/Home.ts
@Component('div')
export class Home {
  @Render()
  render() {
    return (
      <div>
        <h1>Welcome to Echelon</h1>
        <p>This is the home page.</p>
      </div>
    );
  }
}

// pages/About.ts
@Component('div')
export class About {
  @Render()
  render() {
    return (
      <div>
        <h1>About Us</h1>
        <p>Learn more about our framework.</p>
      </div>
    );
  }
}

// pages/User.ts
@Component('div')
export class User {
  @Param('id') userId = '';
  @Query('tab') tab = 'profile';

  @Render()
  render() {
    return (
      <div>
        <h1>User Profile</h1>
        <p>User ID: {this.userId}</p>
        <p>Active Tab: {this.tab}</p>
      </div>
    );
  }
}

// main.ts
import { Router, RouterOutlet, Link } from 'echelonjs';
import { Home, About, User } from './pages';

@Component()
class App {
  @Render()
  render() {
    return (
      <Router>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
          <Link to="/user/123?tab=settings">User Settings</Link>
        </nav>
        <main>
          <RouterOutlet />
        </main>
      </Router>
    );
  }
}

const router = new Router();
router.routes = [
  { path: '/', component: Home },
  { path: '/about', component: About },
  { path: '/user/:id', component: User }
];

mount(<App />, document.getElementById('app')!);
```

## Best Practices

### 1. Component Organization
- Keep components small and focused
- Use composition over inheritance
- Separate concerns (UI, logic, data)

### 2. State Management
- Use `@State()` for component-local state
- Use `@Store()` for shared state across components
- Prefer computed properties over manual calculations

### 3. Performance
- Use `@Computed()` for expensive calculations
- Avoid creating new objects/arrays in render methods
- Use keys for dynamic lists (when available)

### 4. Type Safety
- Always use TypeScript
- Define prop interfaces for better type checking
- Use generic types where appropriate

### 5. Error Handling
- Implement `@ErrorCaptured()` in top-level components
- Use try-catch in async operations
- Provide fallback UI for error states

## Browser Support

Echelon requires:
- ES2017+ features
- Decorator support (experimental or via Babel)
- Reflect.metadata polyfill
- Modern browsers (Chrome 61+, Firefox 60+, Safari 12+, Edge 79+)

## Development Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build

# Lint code
npm run lint
```

## Contributing

We welcome contributions! Please see our [Contributing Guide](../CONTRIBUTING.md) for details.

## License

MIT License - see [LICENSE](../LICENSE) file for details.