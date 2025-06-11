# Echelon Framework - Working Examples

This document contains tested and verified examples that work correctly with the current version of Echelon.

## Basic Component Examples

### Hello World Component

```typescript
import { createElement, Component, Render, mount } from 'echelonjs';

@Component('div')
class HelloWorld {
  @Render()
  render() {
    return createElement('h1', null, 'Hello, Echelon!');
  }
}

// Usage
const container = document.getElementById('app');
mount(createElement(HelloWorld, null), container);
```

### Fragment-Based Component

```typescript
@Component()  // No tag name = fragment
class FragmentComponent {
  @Render()
  render() {
    return createElement('div', null, 'Fragment content');
  }
}
```

## State Management Examples

### Simple Counter

```typescript
@Component('div')
class Counter {
  @State() count = 0;

  @Event('click')
  increment() {
    this.count++;
  }

  @Render()
  render() {
    return createElement('span', null, this.count);
  }
}
```

### Multi-State Component

```typescript
@Component('div')
class StatusComponent {
  @State() message = 'Ready';
  @State() isActive = false;
  @State() count = 0;

  @Event('click')
  handleClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const action = target.dataset.action;
    
    if (action === 'toggle') {
      this.isActive = !this.isActive;
      this.message = this.isActive ? 'Active' : 'Inactive';
    } else if (action === 'increment') {
      this.count++;
      this.message = `Count: ${this.count}`;
    }
  }

  @Render()
  render() {
    return createElement('div', null,
      createElement('p', null, this.message),
      createElement('button', { 'data-action': 'toggle' }, 'Toggle'),
      createElement('button', { 'data-action': 'increment' }, 'Count')
    );
  }
}
```

## DOM Binding Examples

### Input Component with Property Bindings

```typescript
@Component('input')
class InputComponent {
  @State() inputValue = 'initial';
  @Property('value') value = 'initial';
  @Property('disabled') disabled = false;

  @Event('click')
  toggle() {
    this.disabled = !this.disabled;
    this.inputValue = this.disabled ? 'disabled' : 'enabled';
    this.value = this.inputValue;
  }

  @Render()
  render() {
    return createElement('span', null, this.inputValue);
  }
}
```

### Styled Component

```typescript
@Component('div')
class StyledComponent {
  @State() isActive = false;
  @Style('background-color') backgroundColor = '#f0f0f0';
  @Style() color = '#333';

  @Event('click')
  toggle() {
    this.isActive = !this.isActive;
    this.backgroundColor = this.isActive ? '#007bff' : '#f0f0f0';
    this.color = this.isActive ? 'white' : '#333';
  }

  @Render()
  render() {
    return createElement('span', null, this.isActive ? 'Active' : 'Inactive');
  }
}
```

### Layout Component with Style Objects

```typescript
@Component('div')
class LayoutComponent {
  @State() layoutMode = 'flex';
  @StyleLayout() layout: any = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px'
  };

  @Event('click')
  toggleLayout() {
    this.layoutMode = this.layoutMode === 'flex' ? 'block' : 'flex';
    this.layout = {
      display: this.layoutMode,
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px'
    };
  }

  @Render()
  render() {
    return createElement('span', null, `Layout: ${this.layoutMode}`);
  }
}
```

## Global Store Examples

### Simple Store Usage

```typescript
@Component('div')
class StoreProvider {
  @Store('globalCounter') counter = 0;

  increment() {
    this.counter++;
  }

  @Render()
  render() {
    return createElement('button', null, `Count: ${this.counter}`);
  }
}

@Component('div')
class StoreConsumer {
  @Use('globalCounter') counter = 0;

  @Render()
  render() {
    return createElement('span', null, `Display: ${this.counter}`);
  }
}
```

### Multi-Store Component

```typescript
@Component('div')
class MultiStoreComponent {
  @Store('userCount') users = 0;
  @Store('sessionCount') sessions = 0;
  @Use('userCount') displayUsers = 0;

  @Event('click')
  handleClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (target.dataset.action === 'addUser') {
      this.users++;
    } else if (target.dataset.action === 'addSession') {
      this.sessions++;
    }
  }

  @Render()
  render() {
    return createElement('div', null,
      createElement('div', null, `Users: ${this.users}, Sessions: ${this.sessions}`),
      createElement('div', null, `Display Users: ${this.displayUsers}`),
      createElement('button', { 'data-action': 'addUser' }, 'Add User'),
      createElement('button', { 'data-action': 'addSession' }, 'Add Session')
    );
  }
}
```

## Component Composition Examples

### Simple Card Component

```typescript
@Component('div')
class SimpleCard {
  @Render()
  render(
    @Prop('title') title: string,
    @Children() children: any,
    @Prop('subtitle') subtitle?: string
  ) {
    return createElement('div', { className: 'card' },
      createElement('div', { className: 'card-header' },
        createElement('h3', null, title),
        subtitle && createElement('p', null, subtitle)
      ),
      createElement('div', { className: 'card-content' }, children)
    );
  }
}

// Usage
createElement(SimpleCard, {
  title: 'My Card',
  subtitle: 'Card subtitle'
}, createElement('p', null, 'Card content'))
```

### Application with Multiple Components

```typescript
@Component('div')
class App {
  @State() message = 'Welcome to Echelon';

  @Render()
  render() {
    return createElement('div', null,
      createElement('h1', null, this.message),
      createElement(Counter, null),
      createElement(StyledComponent, null),
      createElement(MultiStoreComponent, null)
    );
  }
}

// Mount the application
const container = document.getElementById('app');
mount(createElement(App, null), container);
```

## Event Handling Patterns

### Data-Driven Events

```typescript
@Component('div')
class DataDrivenComponent {
  @State() activeTab = 'home';
  @State() items: string[] = ['Item 1', 'Item 2', 'Item 3'];

  @Event('click')
  handleClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const action = target.dataset.action;
    const value = target.dataset.value;
    
    if (action === 'tab' && value) {
      this.activeTab = value;
    } else if (action === 'remove' && value) {
      const index = parseInt(value);
      this.items = this.items.filter((_, i) => i !== index);
    } else if (action === 'add') {
      this.items = [...this.items, `Item ${this.items.length + 1}`];
    }
  }

  @Render()
  render() {
    return createElement('div', null,
      // Tab buttons
      createElement('div', null,
        createElement('button', { 
          'data-action': 'tab', 
          'data-value': 'home' 
        }, 'Home'),
        createElement('button', { 
          'data-action': 'tab', 
          'data-value': 'about' 
        }, 'About')
      ),
      // Active content
      createElement('div', null, `Active tab: ${this.activeTab}`),
      // Items list
      createElement('div', null,
        createElement('button', { 'data-action': 'add' }, 'Add Item'),
        ...this.items.map((item, index) => 
          createElement('div', { key: index },
            item,
            createElement('button', { 
              'data-action': 'remove', 
              'data-value': index.toString() 
            }, 'Remove')
          )
        )
      )
    );
  }
}
```

## Best Practices

### 1. State Management
- Keep state simple and avoid nested objects when possible
- Use manual calculations instead of computed properties
- Update state directly for reliable re-rendering

### 2. Event Handling
- Use data attributes for action identification
- Handle multiple actions in a single event handler
- Prefer simple state updates over complex logic

### 3. Component Design
- Start with simple components and compose them
- Use fragments for wrapper-less components
- Keep render methods simple and readable

### 4. Store Usage
- Use stores for truly global state
- Initialize stores with meaningful default values
- Prefer simple data types in stores

### 5. CSS and Styling
- Use `@Style()` for individual properties
- Use `@StyleLayout()` for multiple properties
- Keep style objects simple and flat

### 6. TypeScript Integration
- Order decorator parameters correctly
- Use explicit types when TypeScript inference fails
- Handle optional props carefully

These examples have been tested and verified to work correctly with the current version of Echelon. Use them as a foundation for building your applications.