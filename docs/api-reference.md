# Echelon API Reference

Complete API documentation for all Echelon decorators, functions, and types.

## Table of Contents

- [Core Functions](#core-functions)
- [Component Decorators](#component-decorators)
- [Lifecycle Decorators](#lifecycle-decorators)
- [State Management Decorators](#state-management-decorators)
- [DOM Binding Decorators](#dom-binding-decorators)
- [Parameter Decorators](#parameter-decorators)
- [Router API](#router-api)
- [Types](#types)

## Core Functions

### `createElement(type, props, ...children)`

Creates Echelon JSX elements.

**Parameters:**
- `type: string | Function | typeof Fragment` - Element type (HTML tag, component class, or Fragment)
- `props: object | null` - Element properties
- `children: any[]` - Child elements

**Returns:** `EchelonElement`

**Example:**
```typescript
const element = createElement('div', { className: 'container' }, 'Hello World');
const component = createElement(MyComponent, { prop1: 'value' });
```

### `Fragment`

Symbol for creating fragment elements (multiple root elements).

**Example:**
```typescript
return (
  <Fragment>
    <div>First</div>
    <div>Second</div>
  </Fragment>
);
```

### `mount(element, container)`

Mounts an Echelon element tree to a DOM container.

**Parameters:**
- `element: EchelonElement` - Root element to mount
- `container: HTMLElement` - DOM container element

**Returns:** `EchelonInternalComponentInstance | null`

**Example:**
```typescript
const app = <App />;
const container = document.getElementById('root');
mount(app, container);
```

## Component Decorators

### `@Component(tagName?: string)`

Marks a class as an Echelon component.

**Parameters:**
- `tagName?: string` - Optional HTML tag name for the component's root element

**Example:**
```typescript
@Component('div')  // Creates a div element
class MyComponent {
  @Render()
  render() {
    return <span>Content</span>;
  }
}

@Component()  // Fragment-based component
class FragmentComponent {
  @Render()
  render() {
    return <div>No root element</div>;
  }
}
```

**Notes:**
- Without `tagName`, the component renders as a DocumentFragment
- The `tagName` determines the type of DOM element created as the component's host

## Lifecycle Decorators

### `@Render()`

Marks a method as the component's render function.

**Returns:** Must return JSX (`EchelonElement`)

**Example:**
```typescript
@Component('div')
class MyComponent {
  @Render()
  render() {
    return <span>Hello World</span>;
  }
}
```

**Notes:**
- Required for all components
- Can accept parameters decorated with `@Prop` and `@Children`
- Called during initial mount and on state changes

### `@Mounted()`

Lifecycle hook called after the component is mounted to the DOM.

**Example:**
```typescript
@Component('div')
class MyComponent {
  @Mounted()
  onMounted() {
    console.log('Component is now in the DOM');
    // Safe to access DOM elements here
  }
}
```

**Notes:**
- Component is guaranteed to be in the DOM
- Ideal for DOM manipulation, setting up timers, or API calls

### `@BeforeMount()`

Lifecycle hook called before the component is mounted to the DOM.

**Example:**
```typescript
@Component('div')
class MyComponent {
  @BeforeMount()
  beforeMount() {
    console.log('About to mount');
    // Initialize data before rendering
  }
}
```

### `@BeforeUpdate()`

Lifecycle hook called before the component re-renders.

**Example:**
```typescript
@Component('div')
class MyComponent {
  @State() count = 0;

  @BeforeUpdate()
  beforeUpdate() {
    console.log('About to update, current count:', this.count);
  }
}
```

### `@Updated()`

Lifecycle hook called after the component re-renders.

**Example:**
```typescript
@Component('div')
class MyComponent {
  @Updated()
  updated() {
    console.log('Component updated');
    // React to DOM changes
  }
}
```

### `@BeforeUnmount()`

Lifecycle hook called before the component is removed from the DOM.

**Example:**
```typescript
@Component('div')
class MyComponent {
  private timer?: number;

  @BeforeUnmount()
  beforeUnmount() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }
}
```

### `@Destroyed()`

Lifecycle hook called after the component is removed from the DOM.

**Example:**
```typescript
@Component('div')
class MyComponent {
  @Destroyed()
  destroyed() {
    console.log('Component destroyed');
    // Final cleanup
  }
}
```

### `@ErrorCaptured()`

Error boundary lifecycle hook for catching errors in child components.

**Parameters (method signature):**
- `error: Error` - The caught error
- `context: object` - Context information about where the error occurred

**Returns:** `boolean | void` - Return `false` to re-throw the error

**Example:**
```typescript
@Component('div')
class ErrorBoundary {
  @State() hasError = false;

  @ErrorCaptured()
  onError(error: Error, context: any) {
    console.error('Error caught:', error, context);
    this.hasError = true;
    return true; // Prevent re-throwing
  }

  @Render()
  render(@Children() children: any) {
    if (this.hasError) {
      return <div>Something went wrong!</div>;
    }
    return children;
  }
}
```

## State Management Decorators

### `@State()`

Makes a property reactive. Changes trigger component re-renders.

**Example:**
```typescript
@Component('div')
class StatefulComponent {
  @State() count = 0;
  @State() message = 'Hello';
  @State() items: string[] = [];

  @Event('click')
  increment() {
    this.count++; // Triggers re-render
  }
}
```

**Notes:**
- Only components with `@State` properties will re-render on changes
- Changes are detected by reference for objects and arrays
- Supports any JavaScript value type

### `@Computed()`

Creates a computed property that automatically updates when dependencies change.

**Example:**
```typescript
@Component('div')
class ComputedExample {
  @State() firstName = 'John';
  @State() lastName = 'Doe';

  @Computed()
  get fullName() {
    return `${this.firstName} ${this.lastName}`;
  }

  @Computed()
  get initials() {
    return `${this.firstName[0]}${this.lastName[0]}`;
  }

  @Render()
  render() {
    return <span>{this.fullName} ({this.initials})</span>;
  }
}
```

**Notes:**
- Must be a getter method
- Dependencies are automatically tracked
- Cached until dependencies change
- Can depend on other computed properties

### `@Watch(fieldName: string | symbol)`

Creates a watcher that reacts to changes in a specific field.

**Parameters:**
- `fieldName: string | symbol` - Name of the field to watch

**Method signature:**
- `(newValue: any, oldValue: any) => void`

**Example:**
```typescript
@Component('div')
class WatcherExample {
  @State() count = 0;
  @State() message = '';

  @Watch('count')
  onCountChange(newValue: number, oldValue: number) {
    console.log(`Count changed from ${oldValue} to ${newValue}`);
    if (newValue > 10) {
      this.message = 'Count is high!';
    }
  }

  @Watch('message')
  onMessageChange(newMessage: string) {
    console.log('Message updated:', newMessage);
  }
}
```

### `@Store(id?: string)`

Creates a global store field that persists across component instances.

**Parameters:**
- `id?: string` - Optional store identifier. Uses field name if not provided.

**Example:**
```typescript
@Component('div')
class ComponentA {
  @Store('globalCounter') counter = 0;
  @Store() preferences = { theme: 'dark' }; // Uses 'preferences' as store ID

  @Event('click')
  increment() {
    this.counter++; // Updates global store
  }
}

@Component('div')
class ComponentB {
  @Use('globalCounter') counter = 0; // Accesses the same store

  @Render()
  render() {
    return <span>Counter: {this.counter}</span>;
  }
}
```

### `@Use(storeId: string)`

Connects to an existing global store.

**Parameters:**
- `storeId: string` - Identifier of the store to connect to

**Example:**
```typescript
@Component('div')
class StoreConsumer {
  @Use('sharedData') data: any[] = [];
  @Use('userPreferences') prefs = {};

  @Render()
  render() {
    return <div>Data count: {this.data.length}</div>;
  }
}
```

**Notes:**
- Store must already exist (created by `@Store`)
- Changes to store fields trigger re-renders in all connected components
- Initial value is ignored if store already exists

## DOM Binding Decorators

### `@Event(eventName: string)`

Binds a DOM event to a component method.

**Parameters:**
- `eventName: string` - DOM event name (without 'on' prefix)

**Example:**
```typescript
@Component('button')
class ClickableButton {
  @State() clicked = false;

  @Event('click')
  handleClick(event: MouseEvent) {
    console.log('Button clicked at:', event.clientX, event.clientY);
    this.clicked = true;
  }

  @Event('mouseenter')
  onHover(event: MouseEvent) {
    console.log('Mouse entered');
  }

  @Event('keydown')
  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.handleClick(event as any);
    }
  }
}
```

**Supported Events:**
- All standard DOM events: `click`, `input`, `change`, `submit`, `focus`, `blur`, etc.
- Mouse events: `mouseenter`, `mouseleave`, `mouseover`, `mouseout`, `mousedown`, `mouseup`
- Keyboard events: `keydown`, `keyup`, `keypress`
- Form events: `submit`, `reset`, `input`, `change`
- Touch events: `touchstart`, `touchend`, `touchmove`

### `@Property(domPropertyName: string)`

Binds a component field to a DOM element property.

**Parameters:**
- `domPropertyName: string` - Name of the DOM property to bind to

**Example:**
```typescript
@Component('input')
class InputComponent {
  @Property('value') inputValue = '';
  @Property('disabled') isDisabled = false;
  @Property('placeholder') placeholderText = 'Enter text...';
  @Property('checked') isChecked = false; // For checkboxes

  @Event('input')
  onInput(e: InputEvent) {
    this.inputValue = (e.target as HTMLInputElement).value;
  }

  @Render()
  render() {
    return <span>{this.inputValue}</span>;
  }
}
```

**Notes:**
- Works only with components that have a `tagName` (not fragments)
- Changes to the field automatically update the DOM property
- Two-way binding requires manual event handling

### `@Method(domMethodName: string)`

Binds a component field to a DOM element method.

**Parameters:**
- `domMethodName: string` - Name of the DOM method to bind to

**Example:**
```typescript
@Component('input')
class InputWithMethods {
  @Method('focus') focusInput!: () => void;
  @Method('blur') blurInput!: () => void;
  @Method('select') selectText!: () => void;
  @Method('click') clickElement!: () => void;

  @Event('click')
  handleClick() {
    this.selectText(); // Calls DOM select() method
  }

  @Mounted()
  onMounted() {
    this.focusInput(); // Auto-focus when mounted
  }
}
```

**Common DOM Methods:**
- Input elements: `focus()`, `blur()`, `select()`, `setSelectionRange()`
- Form elements: `submit()`, `reset()`
- Media elements: `play()`, `pause()`, `load()`
- General: `click()`, `scrollIntoView()`

### `@Style(cssProperty?: string)`

Binds a component field to a CSS style property.

**Parameters:**
- `cssProperty?: string` - CSS property name. If omitted, uses field name converted to kebab-case.

**Example:**
```typescript
@Component('div')
class StyledComponent {
  @Style('background-color') bgColor = 'red';
  @Style() color = 'white'; // Uses 'color' as CSS property
  @Style() fontSize = '16px'; // Becomes 'font-size'
  @Style('border-radius') borderRadius = '8px';

  @State() isActive = false;

  @Event('click')
  toggle() {
    this.isActive = !this.isActive;
    this.bgColor = this.isActive ? 'blue' : 'red';
  }
}
```

**CSS Property Conversion:**
- `fontSize` → `font-size`
- `backgroundColor` → `background-color`
- `borderRadius` → `border-radius`
- `zIndex` → `z-index`

### `@StyleLayout()`

Binds a component field to multiple CSS properties via an object.

**Example:**
```typescript
@Component('div')
class LayoutComponent {
  @StyleLayout() flexLayout = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '10px'
  };

  @StyleLayout() cardStyle = {
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    backgroundColor: 'white'
  };

  @State() isExpanded = false;

  @Event('click')
  toggleExpanded() {
    this.isExpanded = !this.isExpanded;
    this.cardStyle = {
      ...this.cardStyle,
      height: this.isExpanded ? '200px' : '100px'
    };
  }
}
```

**Notes:**
- Field value must be an object with CSS property names as keys
- All properties in the object are applied to the element's style
- Supports both camelCase and kebab-case property names

## Parameter Decorators

### `@Prop(propName: string)`

Maps a render method parameter to a prop passed from the parent component.

**Parameters:**
- `propName: string` - Name of the prop as passed by the parent

**Example:**
```typescript
@Component('div')
class GreetingCard {
  @Render()
  render(
    @Prop('name') userName: string,
    @Prop('age') userAge: number,
    @Prop('onDelete') deleteHandler: () => void
  ) {
    return (
      <div>
        <h1>Hello {userName}, age {userAge}</h1>
        <button onClick={deleteHandler}>Delete</button>
      </div>
    );
  }
}

// Usage:
<GreetingCard 
  name="Alice" 
  age={25} 
  onDelete={() => console.log('Delete clicked')} 
/>
```

### `@Children()`

Maps a render method parameter to receive child elements from JSX.

**Example:**
```typescript
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

// Usage:
<Card title="My Card">
  <p>This is the card content</p>
  <button>Action</button>
</Card>
```

### `@Param(paramName: string)`

Binds a field to a route parameter (for use with router).

**Parameters:**
- `paramName: string` - Name of the route parameter

**Example:**
```typescript
@Component('div')
class UserProfile {
  @Param('id') userId: string = '';
  @Param('section') activeSection: string = '';

  @Render()
  render() {
    return (
      <div>
        <h1>User ID: {this.userId}</h1>
        <p>Section: {this.activeSection}</p>
      </div>
    );
  }
}

// Route: /user/:id/:section
// URL: /user/123/profile → userId = "123", activeSection = "profile"
```

### `@Query(queryName: string)`

Binds a field to a URL query parameter.

**Parameters:**
- `queryName: string` - Name of the query parameter

**Example:**
```typescript
@Component('div')
class SearchPage {
  @Query('q') searchTerm: string = '';
  @Query('page') currentPage: string = '1';
  @Query('sort') sortOrder: string = 'name';

  @Render()
  render() {
    return (
      <div>
        <h1>Search: {this.searchTerm}</h1>
        <p>Page: {this.currentPage}</p>
        <p>Sort: {this.sortOrder}</p>
      </div>
    );
  }
}

// URL: /search?q=echelon&page=2&sort=date
// → searchTerm = "echelon", currentPage = "2", sortOrder = "date"
```

## Router API

### `Router`

Component that provides routing context and manages navigation.

**Properties:**
- `routes: RouteRecord[]` - Array of route definitions

**Example:**
```typescript
@Component()
class App {
  @Render()
  render() {
    return (
      <Router>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
        </nav>
        <RouterOutlet />
      </Router>
    );
  }
}

const router = new Router();
router.routes = [
  { path: '/', component: Home },
  { path: '/about', component: About },
  { path: '/user/:id', component: UserProfile }
];
```

### `RouterOutlet`

Component that renders the matched route component.

**Example:**
```typescript
@Component()
class App {
  @Render()
  render() {
    return (
      <div>
        <nav>Navigation here</nav>
        <main>
          <RouterOutlet />
        </main>
      </div>
    );
  }
}
```

### `Link`

Component for creating navigation links.

**Props:**
- `to: string` - Target path

**Example:**
```typescript
// Basic link
<Link to="/about">About Us</Link>

// Link with query parameters
<Link to="/search?q=echelon">Search</Link>

// Link with children
<Link to="/profile">
  <img src="avatar.jpg" />
  <span>My Profile</span>
</Link>
```

### `navigate(path: string)`

Programmatically navigate to a route.

**Parameters:**
- `path: string` - Target path (can include query parameters)

**Example:**
```typescript
import { navigate } from 'echelonjs';

@Component('button')
class LoginButton {
  @Event('click')
  handleLogin() {
    // Perform login logic
    if (loginSuccessful) {
      navigate('/dashboard?welcome=true');
    }
  }
}
```

### Route Configuration

#### `RouteRecord`

**Properties:**
- `path: string` - Route path pattern (supports parameters with `:param`)
- `component: ComponentClass` - Component to render for this route
- `guard?: () => boolean` - Optional guard function for route protection

**Example:**
```typescript
const routes: RouteRecord[] = [
  {
    path: '/',
    component: Home
  },
  {
    path: '/user/:id',
    component: UserProfile
  },
  {
    path: '/admin',
    component: AdminPanel,
    guard: () => {
      return localStorage.getItem('isAdmin') === 'true';
    }
  }
];
```

**Path Patterns:**
- `/` - Exact match
- `/user/:id` - Parameter match
- `/blog/:category/:slug` - Multiple parameters
- Parameters are available via `@Param` decorator

**Route Guards:**
- Function that returns `boolean`
- `true` allows navigation, `false` blocks it
- Called before route activation
- Useful for authentication, authorization

## Types

### `EchelonElement<P = any>`

Represents a JSX element in the Echelon system.

**Properties:**
- `type: string | Function | symbol` - Element type
- `props: P & { children?: EchelonElement[] }` - Element properties and children
- `key?: string | number` - Optional key for lists (future use)

### `ComponentMeta`

Internal metadata interface for component configuration.

**Key Properties:**
- `componentName: string` - Component class name
- `tagName?: string` - HTML tag name for the component
- `renderMethodName?: string | symbol` - Name of the render method
- `stateFields: Set<string | symbol>` - Set of reactive state fields
- `eventHandlers: Map<string | symbol, string>` - Event handler mappings
- Various other internal mappings for decorators

### `EchelonInternalComponentInstance`

Internal instance interface for component runtime.

**Key Properties:**
- `componentObject: object` - The actual component instance
- `hostDomElement: HTMLElement | DocumentFragment` - DOM container
- `isMounted: boolean` - Mount status
- `update: () => void` - Update function
- `destroy: () => void` - Cleanup function

### Store Types

```typescript
interface StoreEntry {
  value: any;
  listeners: Set<() => void>;
}
```

### Router Types

```typescript
interface RouteRecord {
  path: string;
  component: new (...args: any[]) => any;
  guard?: () => boolean;
}

interface RouteMatch {
  component: new (...args: any[]) => any;
  params: Record<string, string>;
  query: Record<string, string>;
}
```

## Constants

### `COMPONENT_META_KEY`

Symbol used for storing component metadata.

### `INTERNAL_INSTANCE_KEY`

Symbol used for accessing internal component instance.

### `Fragment`

Symbol representing JSX fragments.

## Error Handling

### Common Errors

1. **Missing `@Render()` decorator:**
   ```
   Component "MyComponent" is missing @Render() decorator for method name
   ```

2. **Missing `@Component` decorator:**
   ```
   Component "MyComponent" is missing @Component decorator or metadata structure is invalid
   ```

3. **Event binding on fragment components:**
   ```
   @Event binding: Handler method "handleClick" not found or not a function in "MyComponent" for event "click"
   ```

4. **DOM method binding on non-HTML elements:**
   ```
   @Method binding: DOM method "focus" not found on host element of "MyComponent" for field "focusInput"
   ```

### Error Boundaries

Use `@ErrorCaptured()` to handle errors gracefully:

```typescript
@Component('div')
class ErrorBoundary {
  @State() hasError = false;
  @State() errorMessage = '';

  @ErrorCaptured()
  handleError(error: Error, context: any) {
    this.hasError = true;
    this.errorMessage = error.message;
    console.error('Error boundary caught:', error, context);
    return true; // Prevent error from propagating
  }

  @Render()
  render(@Children() children: any) {
    if (this.hasError) {
      return (
        <div className="error-boundary">
          <h2>Something went wrong!</h2>
          <p>{this.errorMessage}</p>
          <button onClick={() => { this.hasError = false; this.errorMessage = ''; }}>
            Try Again
          </button>
        </div>
      );
    }
    return children;
  }
}
```

## Performance Considerations

### Computed Properties

- Use `@Computed()` for expensive calculations
- Computed values are cached until dependencies change
- Prefer computed properties over method calls in render

### State Updates

- Batch state updates when possible
- Avoid creating new objects/arrays in render methods
- Use immutable updates for arrays and objects

### Event Handlers

- Event handlers are automatically bound to component context
- Avoid creating new functions in render methods
- Use `@Event` decorator instead of inline handlers when possible

### Memory Management

- Component instances are automatically cleaned up on unmount
- Event listeners are automatically removed
- Store subscriptions are managed automatically
- Manual cleanup in `@BeforeUnmount` or `@Destroyed` if needed