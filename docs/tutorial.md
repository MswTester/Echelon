# Echelon Framework Tutorial

Learn Echelon step by step with practical examples. This tutorial will take you from basic concepts to building a complete application.

## Table of Contents

1. [Setup and Installation](#setup-and-installation)
2. [Your First Component](#your-first-component)
3. [Adding State and Interactivity](#adding-state-and-interactivity)
4. [Working with Props and Children](#working-with-props-and-children)
5. [DOM Interactions](#dom-interactions)
6. [Styling Components](#styling-components)
7. [Lifecycle Management](#lifecycle-management)
8. [Computed Properties and Watchers](#computed-properties-and-watchers)
9. [Global State Management](#global-state-management)
10. [Building a Router Application](#building-a-router-application)
11. [Complete Example: Todo Application](#complete-example-todo-application)
12. [Error Handling](#error-handling)
13. [Best Practices](#best-practices)

## Setup and Installation

### Prerequisites

- Node.js 16+ 
- TypeScript knowledge
- Basic understanding of decorators and JSX

### Create a New Project

```bash
mkdir my-echelon-app
cd my-echelon-app
npm init -y
```

### Install Dependencies

```bash
npm install echelonjs reflect-metadata
npm install -D typescript @types/node
npm install -D @babel/core @babel/preset-env @babel/preset-typescript
npm install -D @babel/plugin-proposal-decorators @babel/plugin-transform-react-jsx
```

### Configure TypeScript

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "node",
    "jsx": "react",
    "jsxFactory": "createElement",
    "jsxFragmentFactory": "Fragment",
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "baseUrl": ".",
    "paths": {
      "echelon/*": ["node_modules/echelonjs/dist/types/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### Configure Babel

Create `babel.config.js`:

```javascript
module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    '@babel/preset-typescript'
  ],
  plugins: [
    ['@babel/plugin-proposal-decorators', { legacy: true }],
    ['@babel/plugin-transform-react-jsx', {
      pragma: 'createElement',
      pragmaFrag: 'Fragment'
    }]
  ]
};
```

### Project Structure

```
my-echelon-app/
├── src/
│   ├── components/
│   ├── pages/
│   ├── main.ts
│   └── index.html
├── package.json
├── tsconfig.json
└── babel.config.js
```

## Your First Component

Let's create a simple "Hello World" component.

### Create `src/main.ts`

```typescript
// Import reflect-metadata first
import 'reflect-metadata';

// Import Echelon essentials
import { createElement, Fragment, Component, Render, mount } from 'echelonjs';

@Component('div')
class HelloWorld {
  @Render()
  render() {
    return <h1>Hello, Echelon!</h1>;
  }
}

// Mount the component
const appContainer = document.getElementById('app');
if (appContainer) {
  mount(<HelloWorld />, appContainer);
}
```

### Create `src/index.html`

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Echelon App</title>
</head>
<body>
  <div id="app"></div>
  <script src="main.js"></script>
</body>
</html>
```

### Understanding the Code

- `@Component('div')` creates a component with a `div` root element
- `@Render()` marks the method that returns JSX
- `mount()` attaches the component to the DOM
- JSX is transpiled to `createElement()` calls

## Adding State and Interactivity

Let's make our component interactive with state and events.

### Create `src/components/Counter.ts`

```typescript
import { Component, Render, State, Event } from 'echelonjs';

@Component('div')
export class Counter {
  @State() count = 0;
  @State() step = 1;

  @Event('click')
  increment(event: MouseEvent) {
    // Check which button was clicked
    const target = event.target as HTMLElement;
    if (target.dataset.action === 'increment') {
      this.count += this.step;
    } else if (target.dataset.action === 'decrement') {
      this.count -= this.step;
    } else if (target.dataset.action === 'reset') {
      this.count = 0;
    }
  }

  @Event('input')
  updateStep(event: InputEvent) {
    const input = event.target as HTMLInputElement;
    this.step = parseInt(input.value) || 1;
  }

  @Render()
  render() {
    return (
      <div>
        <h2>Counter: {this.count}</h2>
        <div>
          <label>
            Step: 
            <input 
              type="number" 
              value={this.step} 
              min="1" 
            />
          </label>
        </div>
        <div>
          <button data-action="decrement">-{this.step}</button>
          <button data-action="increment">+{this.step}</button>
          <button data-action="reset">Reset</button>
        </div>
      </div>
    );
  }
}
```

### Update `src/main.ts`

```typescript
import 'reflect-metadata';
import { createElement, mount } from 'echelonjs';
import { Counter } from './components/Counter';

const appContainer = document.getElementById('app');
if (appContainer) {
  mount(<Counter />, appContainer);
}
```

### Key Concepts

- `@State()` makes properties reactive
- `@Event()` binds DOM events to methods
- State changes automatically trigger re-renders
- Event handlers receive native DOM events

## Working with Props and Children

Learn how to create reusable components with props and children.

### Create `src/components/Button.ts`

```typescript
import { Component, Render, Event, Prop, Children } from 'echelonjs';

@Component('button')
export class Button {
  private clickHandler?: () => void;

  @Event('click')
  handleClick() {
    if (this.clickHandler) {
      this.clickHandler();
    }
  }

  @Render()
  render(
    @Prop('onClick') onClick: () => void,
    @Prop('variant') variant: 'primary' | 'secondary' = 'primary',
    @Prop('disabled') disabled: boolean = false,
    @Children() children: any
  ) {
    this.clickHandler = onClick;
    
    return (
      <span 
        className={`btn btn-${variant} ${disabled ? 'btn-disabled' : ''}`}
      >
        {children}
      </span>
    );
  }
}
```

### Create `src/components/Card.ts`

```typescript
import { Component, Render, Prop, Children } from 'echelonjs';

@Component('div')
export class Card {
  @Render()
  render(
    @Prop('title') title: string,
    @Prop('subtitle') subtitle?: string,
    @Children() children: any
  ) {
    return (
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">{title}</h3>
          {subtitle && <p className="card-subtitle">{subtitle}</p>}
        </div>
        <div className="card-content">
          {children}
        </div>
      </div>
    );
  }
}
```

### Create `src/components/InteractiveDemo.ts`

```typescript
import { Component, Render, State } from 'echelonjs';
import { Button } from './Button';
import { Card } from './Card';

@Component('div')
export class InteractiveDemo {
  @State() message = 'Hello!';
  @State() clickCount = 0;

  handlePrimaryClick = () => {
    this.message = 'Primary button clicked!';
    this.clickCount++;
  };

  handleSecondaryClick = () => {
    this.message = 'Secondary button clicked!';
    this.clickCount++;
  };

  handleReset = () => {
    this.message = 'Reset!';
    this.clickCount = 0;
  };

  @Render()
  render() {
    return (
      <div>
        <Card 
          title="Interactive Demo" 
          subtitle={`Clicked ${this.clickCount} times`}
        >
          <p>{this.message}</p>
          <div className="button-group">
            <Button onClick={this.handlePrimaryClick} variant="primary">
              Primary Action
            </Button>
            <Button onClick={this.handleSecondaryClick} variant="secondary">
              Secondary Action
            </Button>
            <Button 
              onClick={this.handleReset} 
              variant="primary"
              disabled={this.clickCount === 0}
            >
              Reset
            </Button>
          </div>
        </Card>
      </div>
    );
  }
}
```

### Understanding Props and Children

- `@Prop('name')` maps render parameters to component props
- `@Children()` receives child elements from JSX
- Props are passed as attributes: `<Button variant="primary">`
- Children are nested elements: `<Button>Click me</Button>`

## DOM Interactions

Learn how to directly interact with DOM elements.

### Create `src/components/InputDemo.ts`

```typescript
import { 
  Component, 
  Render, 
  State, 
  Event, 
  Property, 
  Method, 
  Mounted 
} from 'echelonjs';

@Component('div')
export class InputDemo {
  @State() inputValue = '';
  @State() isDisabled = false;

  // DOM property bindings
  @Property('value') value = '';
  @Property('disabled') disabled = false;

  // DOM method bindings
  @Method('focus') focusInput!: () => void;
  @Method('blur') blurInput!: () => void;
  @Method('select') selectAllText!: () => void;

  @Mounted()
  onMounted() {
    // Auto-focus the input when component mounts
    setTimeout(() => this.focusInput(), 100);
  }

  @Event('input')
  handleInput(event: InputEvent) {
    const input = event.target as HTMLInputElement;
    this.inputValue = input.value;
    this.value = input.value; // Update DOM property
  }

  @Event('focus')
  handleFocus() {
    console.log('Input focused');
  }

  @Event('blur')
  handleBlur() {
    console.log('Input blurred');
  }

  toggleDisabled = () => {
    this.isDisabled = !this.isDisabled;
    this.disabled = this.isDisabled; // Update DOM property
  };

  clearInput = () => {
    this.inputValue = '';
    this.value = '';
    this.focusInput();
  };

  selectAll = () => {
    this.selectAllText();
  };

  @Render()
  render() {
    return (
      <div>
        <h3>DOM Interaction Demo</h3>
        <div>
          <input 
            type="text" 
            placeholder="Type something..." 
          />
        </div>
        <div>
          <p>Current value: "{this.inputValue}"</p>
          <p>Length: {this.inputValue.length}</p>
        </div>
        <div>
          <button onClick={this.clearInput}>Clear</button>
          <button onClick={this.selectAll}>Select All</button>
          <button onClick={this.toggleDisabled}>
            {this.isDisabled ? 'Enable' : 'Disable'}
          </button>
        </div>
      </div>
    );
  }
}
```

### Key DOM Interaction Features

- `@Property()` binds component fields to DOM properties
- `@Method()` binds component fields to DOM methods
- DOM interactions work only with components that have a `tagName`
- Use these for direct DOM manipulation when needed

## Styling Components

Learn different ways to style Echelon components.

### Create `src/components/StyledComponent.ts`

```typescript
import { 
  Component, 
  Render, 
  State, 
  Style, 
  StyleLayout, 
  Event 
} from 'echelonjs';

@Component('div')
export class StyledComponent {
  @State() isActive = false;
  @State() theme = 'light';

  // Individual style properties
  @Style('background-color') backgroundColor = '#f0f0f0';
  @Style() color = '#333';
  @Style() padding = '20px';
  @Style('border-radius') borderRadius = '8px';

  // Layout styles as object
  @StyleLayout() layout = {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '10px',
    transition: 'all 0.3s ease'
  };

  @Event('click')
  toggleActive() {
    this.isActive = !this.isActive;
    this.updateStyles();
  }

  toggleTheme = () => {
    this.theme = this.theme === 'light' ? 'dark' : 'light';
    this.updateStyles();
  };

  updateStyles() {
    if (this.theme === 'dark') {
      this.backgroundColor = this.isActive ? '#2c3e50' : '#34495e';
      this.color = '#ecf0f1';
    } else {
      this.backgroundColor = this.isActive ? '#3498db' : '#f0f0f0';
      this.color = this.isActive ? 'white' : '#333';
    }

    // Update layout styles
    this.layout = {
      ...this.layout,
      transform: this.isActive ? 'scale(1.05)' : 'scale(1)',
      boxShadow: this.isActive 
        ? '0 4px 8px rgba(0,0,0,0.2)' 
        : '0 2px 4px rgba(0,0,0,0.1)'
    };
  }

  @Render()
  render() {
    return (
      <div>
        <h3>Styled Component Demo</h3>
        <p>Theme: {this.theme}</p>
        <p>Active: {this.isActive ? 'Yes' : 'No'}</p>
        <div>
          <button onClick={this.toggleTheme}>
            Switch to {this.theme === 'light' ? 'Dark' : 'Light'} Theme
          </button>
        </div>
        <p>Click this card to toggle active state</p>
      </div>
    );
  }
}
```

### Understanding Styling

- `@Style('css-property')` binds to individual CSS properties
- `@Style()` without parameter uses field name (camelCase → kebab-case)
- `@StyleLayout()` binds to multiple CSS properties via object
- Style changes are applied immediately to the DOM

## Lifecycle Management

Learn how to use lifecycle hooks for initialization and cleanup.

### Create `src/components/LifecycleDemo.ts`

```typescript
import { 
  Component, 
  Render, 
  State, 
  BeforeMount, 
  Mounted, 
  BeforeUpdate, 
  Updated, 
  BeforeUnmount, 
  Destroyed,
  Event
} from 'echelonjs';

@Component('div')
export class LifecycleDemo {
  @State() count = 0;
  @State() logs: string[] = [];
  @State() isVisible = true;
  
  private interval?: number;
  private startTime = Date.now();

  log(message: string) {
    const timestamp = Date.now() - this.startTime;
    this.logs = [...this.logs, `[${timestamp}ms] ${message}`];
    console.log(`LifecycleDemo: ${message}`);
  }

  @BeforeMount()
  beforeMount() {
    this.log('BeforeMount: Component is about to mount');
    // Initialize data, set up subscriptions
  }

  @Mounted()
  mounted() {
    this.log('Mounted: Component is now in the DOM');
    
    // Set up interval after component is mounted
    this.interval = window.setInterval(() => {
      this.count++;
    }, 1000);

    // Safe to access DOM elements here
    const element = document.querySelector('#lifecycle-demo') as HTMLElement;
    if (element) {
      element.style.border = '2px solid green';
    }
  }

  @BeforeUpdate()
  beforeUpdate() {
    this.log(`BeforeUpdate: About to update (count: ${this.count})`);
    // Capture current state before update
  }

  @Updated()
  updated() {
    this.log(`Updated: Component updated (count: ${this.count})`);
    // React to DOM changes after update
  }

  @BeforeUnmount()
  beforeUnmount() {
    this.log('BeforeUnmount: About to unmount');
    
    // Clean up timers
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  @Destroyed()
  destroyed() {
    this.log('Destroyed: Component has been destroyed');
    // Final cleanup
  }

  @Event('click')
  handleReset() {
    this.count = 0;
    this.log('Count reset by user');
  }

  toggleVisibility = () => {
    this.isVisible = !this.isVisible;
  };

  @Render()
  render() {
    if (!this.isVisible) {
      return <div>Component is hidden</div>;
    }

    return (
      <div id="lifecycle-demo">
        <h3>Lifecycle Demo</h3>
        <p>Auto-incrementing count: {this.count}</p>
        <button onClick={this.handleReset}>Reset Count</button>
        <button onClick={this.toggleVisibility}>Hide Component</button>
        
        <div style={{ marginTop: '20px' }}>
          <h4>Lifecycle Logs:</h4>
          <div style={{ 
            maxHeight: '200px', 
            overflow: 'auto', 
            border: '1px solid #ccc',
            padding: '10px',
            fontSize: '12px'
          }}>
            {this.logs.map((log, index) => (
              <div key={index}>{log}</div>
            ))}
          </div>
        </div>
      </div>
    );
  }
}
```

### Lifecycle Hook Order

1. **BeforeMount** → Initialize data, set up subscriptions
2. **Mounted** → DOM manipulation, start timers, API calls
3. **BeforeUpdate** → Capture state before changes
4. **Updated** → React to DOM changes
5. **BeforeUnmount** → Clean up timers, subscriptions
6. **Destroyed** → Final cleanup

## Computed Properties and Watchers

Learn advanced reactivity patterns.

### Create `src/components/ReactivityDemo.ts`

```typescript
import { 
  Component, 
  Render, 
  State, 
  Computed, 
  Watch, 
  Event 
} from 'echelonjs';

@Component('div')
export class ReactivityDemo {
  @State() firstName = 'John';
  @State() lastName = 'Doe';
  @State() age = 25;
  @State() items: string[] = ['apple', 'banana', 'cherry'];
  @State() filter = '';

  // Computed properties automatically update when dependencies change
  @Computed()
  get fullName() {
    return `${this.firstName} ${this.lastName}`;
  }

  @Computed()
  get initials() {
    return `${this.firstName[0] || ''}${this.lastName[0] || ''}`.toUpperCase();
  }

  @Computed()
  get ageGroup() {
    if (this.age < 13) return 'child';
    if (this.age < 20) return 'teenager';
    if (this.age < 60) return 'adult';
    return 'senior';
  }

  @Computed()
  get filteredItems() {
    if (!this.filter) return this.items;
    return this.items.filter(item => 
      item.toLowerCase().includes(this.filter.toLowerCase())
    );
  }

  @Computed()
  get summary() {
    return `${this.fullName} (${this.initials}) is a ${this.age}-year-old ${this.ageGroup}`;
  }

  // Watchers react to specific field changes
  @Watch('fullName')
  onNameChange(newName: string, oldName: string) {
    console.log(`Name changed from "${oldName}" to "${newName}"`);
  }

  @Watch('age')
  onAgeChange(newAge: number, oldAge: number) {
    console.log(`Age changed from ${oldAge} to ${newAge}`);
    if (newAge >= 18 && oldAge < 18) {
      alert('Congratulations! You are now an adult!');
    }
  }

  @Watch('items')
  onItemsChange(newItems: string[], oldItems: string[]) {
    console.log(`Items changed. Count: ${oldItems.length} → ${newItems.length}`);
  }

  @Event('input')
  handleInput(event: InputEvent) {
    const input = event.target as HTMLInputElement;
    const name = input.dataset.field;
    const value = input.value;

    switch (name) {
      case 'firstName':
        this.firstName = value;
        break;
      case 'lastName':
        this.lastName = value;
        break;
      case 'age':
        this.age = parseInt(value) || 0;
        break;
      case 'filter':
        this.filter = value;
        break;
    }
  }

  addItem = () => {
    const item = prompt('Enter new item:');
    if (item) {
      this.items = [...this.items, item];
    }
  };

  removeItem = (index: number) => {
    this.items = this.items.filter((_, i) => i !== index);
  };

  @Render()
  render() {
    return (
      <div>
        <h3>Reactivity Demo</h3>
        
        <div>
          <h4>Personal Information</h4>
          <div>
            <label>
              First Name: 
              <input 
                data-field="firstName" 
                value={this.firstName} 
              />
            </label>
          </div>
          <div>
            <label>
              Last Name: 
              <input 
                data-field="lastName" 
                value={this.lastName} 
              />
            </label>
          </div>
          <div>
            <label>
              Age: 
              <input 
                data-field="age" 
                type="number" 
                value={this.age} 
              />
            </label>
          </div>
        </div>

        <div>
          <h4>Computed Values</h4>
          <p><strong>Full Name:</strong> {this.fullName}</p>
          <p><strong>Initials:</strong> {this.initials}</p>
          <p><strong>Age Group:</strong> {this.ageGroup}</p>
          <p><strong>Summary:</strong> {this.summary}</p>
        </div>

        <div>
          <h4>Items ({this.items.length} total, {this.filteredItems.length} filtered)</h4>
          <div>
            <input 
              data-field="filter" 
              value={this.filter}
              placeholder="Filter items..." 
            />
            <button onClick={this.addItem}>Add Item</button>
          </div>
          <ul>
            {this.filteredItems.map((item, index) => (
              <li key={index}>
                {item}
                <button onClick={() => this.removeItem(this.items.indexOf(item))}>
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }
}
```

### Key Reactivity Concepts

- **Computed Properties**: Automatically recalculate when dependencies change
- **Watchers**: Execute side effects when specific fields change
- **Dependency Tracking**: Computed properties automatically track their dependencies
- **Caching**: Computed values are cached until dependencies change

## Global State Management

Learn how to share state between components.

### Create `src/components/UserProfile.ts`

```typescript
import { Component, Render, Store, Use, Event } from 'echelonjs';

interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
}

@Component('div')
export class UserProfile {
  @Store('currentUser') user: User | null = null;
  @Store('isLoggedIn') isLoggedIn = false;

  login = () => {
    const user: User = {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      avatar: '👤'
    };
    
    this.user = user;
    this.isLoggedIn = true;
  };

  logout = () => {
    this.user = null;
    this.isLoggedIn = false;
  };

  @Render()
  render() {
    if (!this.isLoggedIn || !this.user) {
      return (
        <div>
          <h3>Login</h3>
          <button onClick={this.login}>Login as Demo User</button>
        </div>
      );
    }

    return (
      <div>
        <h3>User Profile</h3>
        <div>
          <span>{this.user.avatar}</span>
          <div>
            <strong>{this.user.name}</strong>
            <br />
            <em>{this.user.email}</em>
          </div>
        </div>
        <button onClick={this.logout}>Logout</button>
      </div>
    );
  }
}
```

### Create `src/components/UserDisplay.ts`

```typescript
import { Component, Render, Use } from 'echelonjs';

@Component('div')
export class UserDisplay {
  @Use('currentUser') user: any = null;
  @Use('isLoggedIn') isLoggedIn = false;

  @Render()
  render() {
    return (
      <div style={{ padding: '10px', border: '1px solid #ccc' }}>
        <h4>User Status (from global store)</h4>
        {this.isLoggedIn ? (
          <p>Welcome, {this.user?.name}!</p>
        ) : (
          <p>Please log in</p>
        )}
      </div>
    );
  }
}
```

### Create `src/components/ShoppingCart.ts`

```typescript
import { Component, Render, State, Store, Event } from 'echelonjs';

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

@Component('div')
export class ShoppingCart {
  @Store('cartItems') items: CartItem[] = [];
  @State() newItemName = '';

  @Event('input')
  updateItemName(event: InputEvent) {
    this.newItemName = (event.target as HTMLInputElement).value;
  }

  addItem = () => {
    if (!this.newItemName.trim()) return;
    
    const newItem: CartItem = {
      id: Date.now(),
      name: this.newItemName,
      price: Math.floor(Math.random() * 50) + 10,
      quantity: 1
    };
    
    this.items = [...this.items, newItem];
    this.newItemName = '';
  };

  updateQuantity = (id: number, change: number) => {
    this.items = this.items.map(item => {
      if (item.id === id) {
        const newQuantity = Math.max(0, item.quantity + change);
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
      }
      return item;
    }).filter(Boolean) as CartItem[];
  };

  get total() {
    return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  @Render()
  render() {
    return (
      <div>
        <h3>Shopping Cart ({this.items.length} items)</h3>
        
        <div>
          <input 
            value={this.newItemName}
            placeholder="Item name"
          />
          <button onClick={this.addItem}>Add Item</button>
        </div>

        <div>
          {this.items.map(item => (
            <div key={item.id} style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              padding: '5px',
              borderBottom: '1px solid #eee'
            }}>
              <span>{item.name}</span>
              <span>${item.price}</span>
              <div>
                <button onClick={() => this.updateQuantity(item.id, -1)}>-</button>
                <span style={{ margin: '0 10px' }}>{item.quantity}</span>
                <button onClick={() => this.updateQuantity(item.id, 1)}>+</button>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '10px', fontWeight: 'bold' }}>
          Total: ${this.total}
        </div>
      </div>
    );
  }
}
```

### Create `src/components/CartSummary.ts`

```typescript
import { Component, Render, Use, Computed } from 'echelonjs';

@Component('div')
export class CartSummary {
  @Use('cartItems') items: any[] = [];

  @Computed()
  get itemCount() {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  @Computed()
  get totalValue() {
    return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  @Render()
  render() {
    return (
      <div style={{ 
        position: 'fixed', 
        top: '10px', 
        right: '10px',
        background: '#f8f9fa',
        padding: '10px',
        border: '1px solid #ddd',
        borderRadius: '4px'
      }}>
        <h4>Cart Summary</h4>
        <p>Items: {this.itemCount}</p>
        <p>Total: ${this.totalValue}</p>
      </div>
    );
  }
}
```

### Understanding Global State

- `@Store('id')` creates or connects to a global store
- `@Use('id')` connects to an existing store
- Store changes trigger re-renders in all connected components
- Stores persist across component lifecycle

## Building a Router Application

Learn how to create a multi-page application with routing.

### Create `src/pages/HomePage.ts`

```typescript
import { Component, Render } from 'echelonjs';

@Component('div')
export class HomePage {
  @Render()
  render() {
    return (
      <div>
        <h1>Welcome to Echelon</h1>
        <p>This is the home page of our tutorial application.</p>
        <ul>
          <li>Learn about reactive components</li>
          <li>Explore state management</li>
          <li>Build interactive UIs</li>
        </ul>
      </div>
    );
  }
}
```

### Create `src/pages/AboutPage.ts`

```typescript
import { Component, Render } from 'echelonjs';

@Component('div')
export class AboutPage {
  @Render()
  render() {
    return (
      <div>
        <h1>About Echelon</h1>
        <p>Echelon is a modern TypeScript framework that uses decorators for reactive programming.</p>
        <h2>Key Features</h2>
        <ul>
          <li>Decorator-driven development</li>
          <li>JSX/TSX support</li>
          <li>Reactive state management</li>
          <li>Component lifecycle hooks</li>
          <li>Built-in routing</li>
        </ul>
      </div>
    );
  }
}
```

### Create `src/pages/UserPage.ts`

```typescript
import { Component, Render, Param, Query, State } from 'echelonjs';

@Component('div')
export class UserPage {
  @Param('id') userId = '';
  @Query('tab') activeTab = 'profile';
  @State() user: any = null;

  async loadUser() {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    this.user = {
      id: this.userId,
      name: `User ${this.userId}`,
      email: `user${this.userId}@example.com`,
      joinDate: '2023-01-01'
    };
  }

  componentDidMount() {
    this.loadUser();
  }

  @Render()
  render() {
    if (!this.user) {
      return <div>Loading user {this.userId}...</div>;
    }

    return (
      <div>
        <h1>User Profile</h1>
        <div>
          <h2>{this.user.name}</h2>
          <p>Email: {this.user.email}</p>
          <p>User ID: {this.user.id}</p>
          <p>Active Tab: {this.activeTab}</p>
        </div>

        <div>
          <h3>Tabs</h3>
          <nav>
            <a href={`/user/${this.userId}?tab=profile`}>Profile</a> | 
            <a href={`/user/${this.userId}?tab=settings`}>Settings</a> | 
            <a href={`/user/${this.userId}?tab=history`}>History</a>
          </nav>
        </div>

        <div>
          {this.activeTab === 'profile' && (
            <div>
              <h4>Profile Information</h4>
              <p>Member since: {this.user.joinDate}</p>
            </div>
          )}
          
          {this.activeTab === 'settings' && (
            <div>
              <h4>User Settings</h4>
              <p>Theme, notifications, privacy settings...</p>
            </div>
          )}
          
          {this.activeTab === 'history' && (
            <div>
              <h4>Activity History</h4>
              <p>Recent actions and login history...</p>
            </div>
          )}
        </div>
      </div>
    );
  }
}
```

### Create `src/components/Navigation.ts`

```typescript
import { Component, Render } from 'echelonjs';
import { Link } from 'echelonjs';

@Component('nav')
export class Navigation {
  @Render()
  render() {
    return (
      <nav style={{ 
        padding: '10px',
        backgroundColor: '#f8f9fa',
        borderBottom: '1px solid #ddd'
      }}>
        <Link to="/">Home</Link>
        <span> | </span>
        <Link to="/about">About</Link>
        <span> | </span>
        <Link to="/user/123">User 123</Link>
        <span> | </span>
        <Link to="/user/456?tab=settings">User 456 Settings</Link>
      </nav>
    );
  }
}
```

### Create Router Application `src/RouterApp.ts`

```typescript
import { Component, Render } from 'echelonjs';
import { Router, RouterOutlet } from 'echelonjs';
import { Navigation } from './components/Navigation';
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { UserPage } from './pages/UserPage';

@Component()
export class RouterApp {
  @Render()
  render() {
    return (
      <Router>
        <Navigation />
        <main style={{ padding: '20px' }}>
          <RouterOutlet />
        </main>
      </Router>
    );
  }
}

// Configure routes
const router = new Router();
router.routes = [
  { path: '/', component: HomePage },
  { path: '/about', component: AboutPage },
  { path: '/user/:id', component: UserPage }
];
```

### Update `src/main.ts` for Router

```typescript
import 'reflect-metadata';
import { createElement, mount } from 'echelonjs';
import { RouterApp } from './RouterApp';

const appContainer = document.getElementById('app');
if (appContainer) {
  mount(<RouterApp />, appContainer);
}
```

### Router Features

- **Route Parameters**: `:id` captures URL segments
- **Query Parameters**: Automatically parsed from URL
- **Programmatic Navigation**: Use `navigate()` function
- **Route Guards**: Protect routes with guard functions

## Complete Example: Todo Application

Let's build a complete todo application that demonstrates all concepts.

### Create `src/components/TodoItem.ts`

```typescript
import { Component, Render, State, Event, Prop, Watch } from 'echelonjs';

export interface Todo {
  id: number;
  text: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
}

@Component('li')
export class TodoItem {
  @State() isEditing = false;
  @State() editText = '';
  
  private todo!: Todo;
  private onToggle!: (id: number) => void;
  private onDelete!: (id: number) => void;
  private onUpdate!: (id: number, text: string) => void;

  @Watch('editText')
  onEditTextChange(newText: string) {
    // Auto-save draft as user types (debounced in real app)
    console.log('Edit text changed:', newText);
  }

  @Event('click')
  handleClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    
    if (target.dataset.action === 'toggle') {
      this.onToggle(this.todo.id);
    } else if (target.dataset.action === 'delete') {
      this.onDelete(this.todo.id);
    } else if (target.dataset.action === 'edit') {
      this.startEdit();
    } else if (target.dataset.action === 'save') {
      this.saveEdit();
    } else if (target.dataset.action === 'cancel') {
      this.cancelEdit();
    }
  }

  @Event('keydown')
  handleKeyDown(event: KeyboardEvent) {
    if (this.isEditing) {
      if (event.key === 'Enter') {
        this.saveEdit();
      } else if (event.key === 'Escape') {
        this.cancelEdit();
      }
    }
  }

  @Event('input')
  handleInput(event: InputEvent) {
    if (this.isEditing) {
      this.editText = (event.target as HTMLInputElement).value;
    }
  }

  startEdit() {
    this.isEditing = true;
    this.editText = this.todo.text;
  }

  saveEdit() {
    if (this.editText.trim()) {
      this.onUpdate(this.todo.id, this.editText.trim());
    }
    this.isEditing = false;
  }

  cancelEdit() {
    this.isEditing = false;
    this.editText = '';
  }

  getPriorityColor() {
    switch (this.todo.priority) {
      case 'high': return '#e74c3c';
      case 'medium': return '#f39c12';
      case 'low': return '#27ae60';
    }
  }

  @Render()
  render(
    @Prop('todo') todo: Todo,
    @Prop('onToggle') onToggle: (id: number) => void,
    @Prop('onDelete') onDelete: (id: number) => void,
    @Prop('onUpdate') onUpdate: (id: number, text: string) => void
  ) {
    this.todo = todo;
    this.onToggle = onToggle;
    this.onDelete = onDelete;
    this.onUpdate = onUpdate;

    const itemStyle = {
      display: 'flex',
      alignItems: 'center',
      padding: '10px',
      margin: '5px 0',
      backgroundColor: todo.completed ? '#f8f9fa' : 'white',
      border: '1px solid #ddd',
      borderRadius: '4px',
      borderLeft: `4px solid ${this.getPriorityColor()}`
    };

    return (
      <div style={itemStyle}>
        <input 
          type="checkbox" 
          checked={todo.completed}
          data-action="toggle"
          style={{ marginRight: '10px' }}
        />
        
        {this.isEditing ? (
          <input 
            type="text"
            value={this.editText}
            style={{ 
              flex: 1, 
              marginRight: '10px',
              padding: '4px',
              border: '1px solid #ccc'
            }}
          />
        ) : (
          <span style={{ 
            flex: 1,
            textDecoration: todo.completed ? 'line-through' : 'none',
            color: todo.completed ? '#666' : '#000'
          }}>
            {todo.text}
          </span>
        )}

        <span style={{ 
          fontSize: '12px',
          color: '#666',
          marginRight: '10px'
        }}>
          {todo.priority}
        </span>

        <div>
          {this.isEditing ? (
            <>
              <button data-action="save">Save</button>
              <button data-action="cancel">Cancel</button>
            </>
          ) : (
            <>
              <button data-action="edit">Edit</button>
              <button data-action="delete">Delete</button>
            </>
          )}
        </div>
      </div>
    );
  }
}
```

### Create `src/components/TodoForm.ts`

```typescript
import { Component, Render, State, Event, Prop } from 'echelonjs';
import type { Todo } from './TodoItem';

@Component('form')
export class TodoForm {
  @State() text = '';
  @State() priority: 'low' | 'medium' | 'high' = 'medium';
  
  private onAdd!: (todo: Omit<Todo, 'id' | 'createdAt'>) => void;

  @Event('submit')
  handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    
    if (this.text.trim()) {
      this.onAdd({
        text: this.text.trim(),
        completed: false,
        priority: this.priority
      });
      
      this.text = '';
      this.priority = 'medium';
    }
  }

  @Event('input')
  handleInput(event: InputEvent) {
    const target = event.target as HTMLInputElement;
    if (target.name === 'text') {
      this.text = target.value;
    }
  }

  @Event('change')
  handleChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    if (target.name === 'priority') {
      this.priority = target.value as 'low' | 'medium' | 'high';
    }
  }

  @Render()
  render(@Prop('onAdd') onAdd: (todo: Omit<Todo, 'id' | 'createdAt'>) => void) {
    this.onAdd = onAdd;

    return (
      <form style={{ 
        display: 'flex', 
        gap: '10px', 
        marginBottom: '20px',
        padding: '15px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        backgroundColor: '#f8f9fa'
      }}>
        <input 
          type="text"
          name="text"
          value={this.text}
          placeholder="Add a new todo..."
          style={{ 
            flex: 1,
            padding: '8px',
            border: '1px solid #ccc',
            borderRadius: '4px'
          }}
        />
        
        <select 
          name="priority"
          value={this.priority}
          style={{ 
            padding: '8px',
            border: '1px solid #ccc',
            borderRadius: '4px'
          }}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        
        <button 
          type="submit"
          style={{ 
            padding: '8px 16px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Add Todo
        </button>
      </form>
    );
  }
}
```

### Create `src/components/TodoFilters.ts`

```typescript
import { Component, Render, State, Event, Prop, Computed } from 'echelonjs';
import type { Todo } from './TodoItem';

export type FilterType = 'all' | 'active' | 'completed';
export type SortType = 'created' | 'priority' | 'text';

@Component('div')
export class TodoFilters {
  @State() searchText = '';
  
  private filter!: FilterType;
  private sortBy!: SortType;
  private todos!: Todo[];
  private onFilterChange!: (filter: FilterType) => void;
  private onSortChange!: (sort: SortType) => void;
  private onSearchChange!: (search: string) => void;

  @Computed()
  get filteredCount() {
    return this.todos.filter(todo => {
      const matchesFilter = 
        this.filter === 'all' ||
        (this.filter === 'active' && !todo.completed) ||
        (this.filter === 'completed' && todo.completed);
      
      const matchesSearch = 
        this.searchText === '' ||
        todo.text.toLowerCase().includes(this.searchText.toLowerCase());
      
      return matchesFilter && matchesSearch;
    }).length;
  }

  @Event('click')
  handleClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const action = target.dataset.action;
    const value = target.dataset.value;
    
    if (action === 'filter' && value) {
      this.onFilterChange(value as FilterType);
    } else if (action === 'sort' && value) {
      this.onSortChange(value as SortType);
    } else if (action === 'clear-search') {
      this.searchText = '';
      this.onSearchChange('');
    }
  }

  @Event('input')
  handleSearch(event: InputEvent) {
    this.searchText = (event.target as HTMLInputElement).value;
    this.onSearchChange(this.searchText);
  }

  @Render()
  render(
    @Prop('todos') todos: Todo[],
    @Prop('filter') filter: FilterType,
    @Prop('sortBy') sortBy: SortType,
    @Prop('onFilterChange') onFilterChange: (filter: FilterType) => void,
    @Prop('onSortChange') onSortChange: (sort: SortType) => void,
    @Prop('onSearchChange') onSearchChange: (search: string) => void
  ) {
    this.todos = todos;
    this.filter = filter;
    this.sortBy = sortBy;
    this.onFilterChange = onFilterChange;
    this.onSortChange = onSortChange;
    this.onSearchChange = onSearchChange;

    return (
      <div style={{ 
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        padding: '15px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        backgroundColor: '#f8f9fa',
        marginBottom: '20px'
      }}>
        {/* Search */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <input 
            type="text"
            value={this.searchText}
            placeholder="Search todos..."
            style={{ 
              flex: 1,
              padding: '8px',
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}
          />
          {this.searchText && (
            <button data-action="clear-search">Clear</button>
          )}
        </div>

        {/* Filters and Sort */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <strong>Filter: </strong>
            <button 
              data-action="filter" 
              data-value="all"
              style={{ 
                fontWeight: filter === 'all' ? 'bold' : 'normal',
                marginRight: '5px'
              }}
            >
              All
            </button>
            <button 
              data-action="filter" 
              data-value="active"
              style={{ 
                fontWeight: filter === 'active' ? 'bold' : 'normal',
                marginRight: '5px'
              }}
            >
              Active
            </button>
            <button 
              data-action="filter" 
              data-value="completed"
              style={{ 
                fontWeight: filter === 'completed' ? 'bold' : 'normal'
              }}
            >
              Completed
            </button>
          </div>

          <div>
            <strong>Sort by: </strong>
            <button 
              data-action="sort" 
              data-value="created"
              style={{ 
                fontWeight: sortBy === 'created' ? 'bold' : 'normal',
                marginRight: '5px'
              }}
            >
              Created
            </button>
            <button 
              data-action="sort" 
              data-value="priority"
              style={{ 
                fontWeight: sortBy === 'priority' ? 'bold' : 'normal',
                marginRight: '5px'
              }}
            >
              Priority
            </button>
            <button 
              data-action="sort" 
              data-value="text"
              style={{ 
                fontWeight: sortBy === 'text' ? 'bold' : 'normal'
              }}
            >
              Text
            </button>
          </div>
        </div>

        {/* Stats */}
        <div style={{ fontSize: '14px', color: '#666' }}>
          Showing {this.filteredCount} of {todos.length} todos
        </div>
      </div>
    );
  }
}
```

### Create `src/TodoApp.ts`

```typescript
import { 
  Component, 
  Render, 
  Store, 
  State, 
  Computed, 
  Watch,
  Mounted
} from 'echelonjs';
import { TodoItem, type Todo } from './components/TodoItem';
import { TodoForm } from './components/TodoForm';
import { TodoFilters, type FilterType, type SortType } from './components/TodoFilters';

@Component('div')
export class TodoApp {
  @Store('todos') todos: Todo[] = [];
  @State() filter: FilterType = 'all';
  @State() sortBy: SortType = 'created';
  @State() searchText = '';
  
  private nextId = 1;

  @Mounted()
  onMounted() {
    // Load from localStorage if available
    const saved = localStorage.getItem('echelon-todos');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        this.todos = data.todos || [];
        this.nextId = data.nextId || 1;
      } catch (e) {
        console.warn('Failed to load saved todos:', e);
      }
    }
  }

  @Watch('todos')
  onTodosChange() {
    // Save to localStorage whenever todos change
    localStorage.setItem('echelon-todos', JSON.stringify({
      todos: this.todos,
      nextId: this.nextId
    }));
  }

  @Computed()
  get filteredAndSortedTodos() {
    let filtered = this.todos.filter(todo => {
      const matchesFilter = 
        this.filter === 'all' ||
        (this.filter === 'active' && !todo.completed) ||
        (this.filter === 'completed' && todo.completed);
      
      const matchesSearch = 
        this.searchText === '' ||
        todo.text.toLowerCase().includes(this.searchText.toLowerCase());
      
      return matchesFilter && matchesSearch;
    });

    // Sort
    filtered.sort((a, b) => {
      switch (this.sortBy) {
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'text':
          return a.text.localeCompare(b.text);
        default:
          return 0;
      }
    });

    return filtered;
  }

  @Computed()
  get stats() {
    const total = this.todos.length;
    const completed = this.todos.filter(t => t.completed).length;
    const active = total - completed;
    
    return { total, completed, active };
  }

  addTodo = (todoData: Omit<Todo, 'id' | 'createdAt'>) => {
    const newTodo: Todo = {
      ...todoData,
      id: this.nextId++,
      createdAt: new Date()
    };
    
    this.todos = [...this.todos, newTodo];
  };

  toggleTodo = (id: number) => {
    this.todos = this.todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
  };

  deleteTodo = (id: number) => {
    this.todos = this.todos.filter(todo => todo.id !== id);
  };

  updateTodo = (id: number, text: string) => {
    this.todos = this.todos.map(todo =>
      todo.id === id ? { ...todo, text } : todo
    );
  };

  clearCompleted = () => {
    this.todos = this.todos.filter(todo => !todo.completed);
  };

  toggleAll = () => {
    const allCompleted = this.todos.every(todo => todo.completed);
    this.todos = this.todos.map(todo => ({ 
      ...todo, 
      completed: !allCompleted 
    }));
  };

  handleFilterChange = (filter: FilterType) => {
    this.filter = filter;
  };

  handleSortChange = (sortBy: SortType) => {
    this.sortBy = sortBy;
  };

  handleSearchChange = (searchText: string) => {
    this.searchText = searchText;
  };

  @Render()
  render() {
    return (
      <div style={{ 
        maxWidth: '800px', 
        margin: '0 auto', 
        padding: '20px',
        fontFamily: 'Arial, sans-serif'
      }}>
        <h1>Echelon Todo App</h1>
        
        {/* Stats */}
        <div style={{ 
          display: 'flex', 
          gap: '20px', 
          marginBottom: '20px',
          padding: '10px',
          backgroundColor: '#e9ecef',
          borderRadius: '4px'
        }}>
          <span><strong>Total:</strong> {this.stats.total}</span>
          <span><strong>Active:</strong> {this.stats.active}</span>
          <span><strong>Completed:</strong> {this.stats.completed}</span>
        </div>

        {/* Add Todo Form */}
        <TodoForm onAdd={this.addTodo} />

        {/* Filters */}
        <TodoFilters 
          todos={this.todos}
          filter={this.filter}
          sortBy={this.sortBy}
          onFilterChange={this.handleFilterChange}
          onSortChange={this.handleSortChange}
          onSearchChange={this.handleSearchChange}
        />

        {/* Bulk Actions */}
        {this.todos.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <button onClick={this.toggleAll}>
              {this.todos.every(t => t.completed) ? 'Mark All Active' : 'Mark All Complete'}
            </button>
            {this.stats.completed > 0 && (
              <button 
                onClick={this.clearCompleted}
                style={{ marginLeft: '10px' }}
              >
                Clear Completed ({this.stats.completed})
              </button>
            )}
          </div>
        )}

        {/* Todo List */}
        <div>
          {this.filteredAndSortedTodos.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px',
              color: '#666'
            }}>
              {this.todos.length === 0 
                ? 'No todos yet. Add one above!' 
                : 'No todos match your current filter.'}
            </div>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {this.filteredAndSortedTodos.map(todo => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onToggle={this.toggleTodo}
                  onDelete={this.deleteTodo}
                  onUpdate={this.updateTodo}
                />
              ))}
            </ul>
          )}
        </div>
      </div>
    );
  }
}
```

### Update `src/main.ts` for Todo App

```typescript
import 'reflect-metadata';
import { createElement, mount } from 'echelonjs';
import { TodoApp } from './TodoApp';

const appContainer = document.getElementById('app');
if (appContainer) {
  mount(<TodoApp />, appContainer);
}
```

### Todo App Features

- **CRUD Operations**: Create, read, update, delete todos
- **Filtering**: All, active, completed todos
- **Sorting**: By creation date, priority, or text
- **Search**: Real-time text search
- **Persistence**: Local storage integration
- **Bulk Actions**: Mark all, clear completed
- **Statistics**: Live count updates

## Error Handling

Learn how to handle errors gracefully in your Echelon applications.

### Create `src/components/ErrorBoundary.ts`

```typescript
import { 
  Component, 
  Render, 
  State, 
  ErrorCaptured, 
  Children, 
  Event 
} from 'echelonjs';

interface ErrorInfo {
  error: Error;
  context: any;
  timestamp: Date;
}

@Component('div')
export class ErrorBoundary {
  @State() hasError = false;
  @State() errorInfo: ErrorInfo | null = null;
  @State() errorHistory: ErrorInfo[] = [];

  @ErrorCaptured()
  handleError(error: Error, context: any) {
    console.error('ErrorBoundary caught error:', error, context);
    
    const errorInfo: ErrorInfo = {
      error,
      context,
      timestamp: new Date()
    };
    
    this.hasError = true;
    this.errorInfo = errorInfo;
    this.errorHistory = [...this.errorHistory, errorInfo];
    
    // Send error to logging service in real app
    this.logError(errorInfo);
    
    return true; // Prevent error from propagating
  }

  logError(errorInfo: ErrorInfo) {
    // In a real app, send to logging service
    console.log('Logging error:', {
      message: errorInfo.error.message,
      stack: errorInfo.error.stack,
      context: errorInfo.context,
      timestamp: errorInfo.timestamp,
      userAgent: navigator.userAgent,
      url: window.location.href
    });
  }

  @Event('click')
  handleClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const action = target.dataset.action;
    
    if (action === 'retry') {
      this.hasError = false;
      this.errorInfo = null;
    } else if (action === 'reload') {
      window.location.reload();
    } else if (action === 'report') {
      this.reportError();
    }
  }

  reportError() {
    if (this.errorInfo) {
      const mailto = `mailto:support@example.com?subject=Error Report&body=${encodeURIComponent(
        `Error: ${this.errorInfo.error.message}\n\n` +
        `Stack: ${this.errorInfo.error.stack}\n\n` +
        `Context: ${JSON.stringify(this.errorInfo.context, null, 2)}\n\n` +
        `Timestamp: ${this.errorInfo.timestamp}\n` +
        `URL: ${window.location.href}\n` +
        `User Agent: ${navigator.userAgent}`
      )}`;
      window.open(mailto);
    }
  }

  @Render()
  render(@Children() children: any) {
    if (this.hasError && this.errorInfo) {
      return (
        <div style={{ 
          padding: '20px',
          margin: '20px',
          border: '2px solid #e74c3c',
          borderRadius: '8px',
          backgroundColor: '#fdf2f2'
        }}>
          <h2 style={{ color: '#e74c3c', marginTop: 0 }}>
            Something went wrong
          </h2>
          
          <p>
            An error occurred while rendering this component. 
            You can try to recover or reload the page.
          </p>
          
          <details style={{ marginBottom: '20px' }}>
            <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
              Error Details
            </summary>
            <div style={{ 
              marginTop: '10px',
              padding: '10px',
              backgroundColor: '#f8f9fa',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontFamily: 'monospace',
              fontSize: '12px',
              overflow: 'auto'
            }}>
              <div><strong>Message:</strong> {this.errorInfo.error.message}</div>
              <div><strong>Time:</strong> {this.errorInfo.timestamp.toLocaleString()}</div>
              {this.errorInfo.context && (
                <div>
                  <strong>Context:</strong>
                  <pre>{JSON.stringify(this.errorInfo.context, null, 2)}</pre>
                </div>
              )}
              {this.errorInfo.error.stack && (
                <div>
                  <strong>Stack Trace:</strong>
                  <pre>{this.errorInfo.error.stack}</pre>
                </div>
              )}
            </div>
          </details>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              data-action="retry"
              style={{ 
                padding: '8px 16px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Try Again
            </button>
            
            <button 
              data-action="reload"
              style={{ 
                padding: '8px 16px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Reload Page
            </button>
            
            <button 
              data-action="report"
              style={{ 
                padding: '8px 16px',
                backgroundColor: '#ffc107',
                color: '#000',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Report Error
            </button>
          </div>
          
          {this.errorHistory.length > 1 && (
            <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
              This is error #{this.errorHistory.length} in this session.
            </div>
          )}
        </div>
      );
    }

    return children;
  }
}
```

### Create `src/components/BuggyComponent.ts` (for testing)

```typescript
import { Component, Render, State, Event } from 'echelonjs';

@Component('div')
export class BuggyComponent {
  @State() shouldThrow = false;
  @State() count = 0;

  @Event('click')
  handleClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const action = target.dataset.action;
    
    if (action === 'throw-error') {
      this.shouldThrow = true;
    } else if (action === 'increment') {
      this.count++;
    }
  }

  @Render()
  render() {
    if (this.shouldThrow) {
      throw new Error('This is a simulated error for testing!');
    }

    return (
      <div style={{ padding: '20px', border: '1px solid #ddd' }}>
        <h3>Buggy Component</h3>
        <p>Count: {this.count}</p>
        <button data-action="increment">Increment (Safe)</button>
        <button 
          data-action="throw-error"
          style={{ 
            marginLeft: '10px',
            backgroundColor: '#e74c3c',
            color: 'white'
          }}
        >
          Throw Error
        </button>
      </div>
    );
  }
}
```

### Use Error Boundary in App

```typescript
import { Component, Render } from 'echelonjs';
import { ErrorBoundary } from './components/ErrorBoundary';
import { BuggyComponent } from './components/BuggyComponent';

@Component('div')
export class AppWithErrorHandling {
  @Render()
  render() {
    return (
      <div>
        <h1>Error Handling Demo</h1>
        
        <ErrorBoundary>
          <div style={{ marginBottom: '20px' }}>
            <h2>Safe Component</h2>
            <p>This component won't cause any errors.</p>
          </div>
        </ErrorBoundary>
        
        <ErrorBoundary>
          <BuggyComponent />
        </ErrorBoundary>
        
        <ErrorBoundary>
          <div style={{ marginTop: '20px' }}>
            <h2>Another Safe Component</h2>
            <p>This component continues to work even if others fail.</p>
          </div>
        </ErrorBoundary>
      </div>
    );
  }
}
```

## Best Practices

### 1. Component Design

**Keep Components Small and Focused**
```typescript
// Good: Single responsibility
@Component('button')
class PrimaryButton {
  @Event('click')
  handleClick() { this.onClick(); }
  
  @Render()
  render(@Prop('onClick') onClick: () => void, @Children() children: any) {
    this.onClick = onClick;
    return <span className="btn btn-primary">{children}</span>;
  }
}

// Avoid: Too many responsibilities
@Component('div')
class MegaComponent {
  // ... 50+ lines of state and methods
}
```

**Use Composition Over Inheritance**
```typescript
// Good: Composition
@Component('div')
class UserCard {
  @Render()
  render(@Prop('user') user: User) {
    return (
      <Card title={user.name}>
        <Avatar src={user.avatar} />
        <ContactInfo email={user.email} />
      </Card>
    );
  }
}

// Avoid: Deep inheritance
class BaseCard extends Component { }
class UserBaseCard extends BaseCard { }
class DetailedUserCard extends UserBaseCard { }
```

### 2. State Management

**Use Local State for Component-Specific Data**
```typescript
@Component('input')
class SearchInput {
  @State() value = '';        // Local state
  @State() isFocused = false; // Local state
  
  @Event('input')
  handleInput(e: InputEvent) {
    this.value = (e.target as HTMLInputElement).value;
    this.onSearch(this.value); // Notify parent
  }
}
```

**Use Global Store for Shared Data**
```typescript
@Component('div')
class UserProfile {
  @Store('currentUser') user: User | null = null; // Global state
  @State() isEditing = false;                     // Local state
}
```

**Prefer Computed Properties for Derived Data**
```typescript
@Component('div')
class ProductList {
  @Store('products') products: Product[] = [];
  @State() searchTerm = '';
  @State() category = 'all';
  
  // Good: Computed property
  @Computed()
  get filteredProducts() {
    return this.products.filter(p => 
      (this.category === 'all' || p.category === this.category) &&
      p.name.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }
  
  // Avoid: Manual filtering in render
  @Render()
  render() {
    // Don't filter here every time
    return <div>{this.filteredProducts.map(/* ... */)}</div>;
  }
}
```

### 3. Performance Optimization

**Avoid Creating Objects in Render**
```typescript
@Component('div')
class OptimizedComponent {
  // Good: Create objects outside render
  private buttonStyle = { padding: '10px', margin: '5px' };
  
  @Render()
  render() {
    return <button style={this.buttonStyle}>Click me</button>;
  }
  
  // Avoid: Creating objects in render
  // render() {
  //   return <button style={{ padding: '10px', margin: '5px' }}>Click me</button>;
  // }
}
```

**Use Event Delegation When Appropriate**
```typescript
@Component('ul')
class TodoList {
  @Event('click')
  handleClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const action = target.dataset.action;
    const id = target.dataset.id;
    
    if (action === 'delete' && id) {
      this.deleteTodo(parseInt(id));
    }
  }
  
  @Render()
  render() {
    return (
      <ul>
        {this.todos.map(todo => (
          <li key={todo.id}>
            {todo.text}
            <button data-action="delete" data-id={todo.id}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    );
  }
}
```

### 4. Type Safety

**Define Interfaces for Props**
```typescript
interface UserProps {
  user: User;
  onEdit: (user: User) => void;
  onDelete: (id: number) => void;
}

@Component('div')
class UserCard {
  @Render()
  render(
    @Prop('user') user: UserProps['user'],
    @Prop('onEdit') onEdit: UserProps['onEdit'],
    @Prop('onDelete') onDelete: UserProps['onDelete']
  ) {
    // Implementation with full type safety
  }
}
```

**Use Strict TypeScript Configuration**
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noImplicitThis": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

### 5. Error Handling

**Implement Error Boundaries**
```typescript
@Component()
class App {
  @Render()
  render() {
    return (
      <ErrorBoundary>
        <Router>
          <Navigation />
          <RouterOutlet />
        </Router>
      </ErrorBoundary>
    );
  }
}
```

**Handle Async Errors Gracefully**
```typescript
@Component('div')
class AsyncDataComponent {
  @State() data: any = null;
  @State() loading = false;
  @State() error: string | null = null;
  
  @Mounted()
  async loadData() {
    this.loading = true;
    this.error = null;
    
    try {
      const response = await fetch('/api/data');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      this.data = await response.json();
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Unknown error';
    } finally {
      this.loading = false;
    }
  }
  
  @Render()
  render() {
    if (this.loading) return <div>Loading...</div>;
    if (this.error) return <div>Error: {this.error}</div>;
    if (!this.data) return <div>No data</div>;
    
    return <div>{/* Render data */}</div>;
  }
}
```

This completes the comprehensive Echelon tutorial. You now have a solid foundation to build modern, reactive applications with the Echelon framework!