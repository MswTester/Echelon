# Echelon Framework - Known Limitations and Issues

This document outlines the current limitations and known issues with the Echelon framework based on testing and validation.

## ✅ Working Features

### Core Functionality
- ✅ **Basic component creation** with `@Component()`
- ✅ **JSX rendering** with `@Render()`
- ✅ **State management** with `@State()`
- ✅ **Event handling** with `@Event()`
- ✅ **Fragment-based components** (no root element)

### DOM Bindings
- ✅ **Property bindings** with `@Property()` - DOM properties sync correctly
- ✅ **Style bindings** with `@Style()` - CSS styles update properly
- ✅ **Style layout** with `@StyleLayout()` - Multiple CSS properties work

### Global State
- ✅ **Store creation** with `@Store()` - Global state works
- ✅ **Store consumption** with `@Use()` - Cross-component state sharing works
- ✅ **Basic store synchronization** - Manual state updates propagate

## ⚠️ Limitations and Issues

### Props and Children
- ⚠️ **Parameter order constraints**: TypeScript requires required parameters before optional ones
  ```typescript
  // ❌ This doesn't work in TypeScript
  render(@Prop('name') name: string, @Prop('age') age?: number, @Children() children: any)
  
  // ✅ This works
  render(@Prop('name') name: string, @Children() children: any, @Prop('age') age?: number)
  ```

### Event Handling
- ⚠️ **Event delegation issues**: Complex event handling with data attributes may not work as expected
- ⚠️ **Store updates via events**: Direct event-triggered store updates may not re-render components immediately

### Computed Properties and Watchers  
- ❌ **Computed properties**: May cause infinite loops in dependency tracking
- ❌ **Watchers**: Complex watch scenarios may not work correctly
- ❌ **Computed + Store**: Computed properties with store dependencies are unreliable

### Router System
- 🚧 **Not fully tested**: Router functionality needs comprehensive testing
- 🚧 **Route parameters**: `@Param()` and `@Query()` decorators need validation

### Lifecycle Hooks
- 🚧 **Not fully tested**: Lifecycle methods need comprehensive testing
- ⚠️ **Timing issues**: Some lifecycle methods may be called at unexpected times

### Method Bindings
- 🚧 **Not tested**: `@Method()` decorator functionality needs validation

## 🔧 Workarounds

### For Event-Driven Store Updates
Instead of relying on automatic event handling, manually update stores:

```typescript
@Component('div')
class Counter {
  @Store('count') count = 0;

  @Event('click')
  increment() {
    // Manual update works better
    this.count = this.count + 1;
  }

  @Render()
  render() {
    return <button>Count: {this.count}</button>;
  }
}
```

### For Complex State Management
Use simple state updates and avoid computed properties for now:

```typescript
@Component('div')
class ItemList {
  @State() items: string[] = [];
  @State() filteredItems: string[] = [];
  @State() filter = '';

  updateFilter(newFilter: string) {
    this.filter = newFilter;
    // Manual filtering instead of computed
    this.filteredItems = this.items.filter(item => 
      item.includes(newFilter)
    );
  }
}
```

### For Props with TypeScript
Order parameters carefully:

```typescript
@Component('div')
class Card {
  @Render()
  render(
    @Prop('title') title: string,           // Required first
    @Children() children: any,              // Children
    @Prop('subtitle') subtitle?: string     // Optional last
  ) {
    return (
      <div>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
        {children}
      </div>
    );
  }
}
```

## 📋 Recommendations

### For Production Use
1. **Stick to basic features**: Components, state, events, and basic store functionality
2. **Avoid computed properties**: Use manual calculations instead
3. **Test thoroughly**: Always test components with actual DOM interactions
4. **Simple event handling**: Use straightforward event patterns

### For Development
1. **Manual testing**: Automated tests may not catch all issues
2. **Start simple**: Build up complexity gradually
3. **Monitor console**: Watch for framework warnings and errors

## 🚀 Future Improvements Needed

### High Priority
1. Fix computed properties dependency tracking
2. Improve event handling reliability
3. Complete router system testing
4. Stabilize watcher functionality

### Medium Priority
1. Better TypeScript integration for decorators
2. Lifecycle hook reliability
3. Method binding functionality
4. Performance optimizations

### Low Priority
1. Developer tools integration
2. Better error messages
3. Documentation improvements
4. Example applications

## 📊 Test Coverage Summary

Based on automated testing:

- **Basic Components**: ✅ Fully working
- **State Management**: ✅ Core functionality works
- **DOM Bindings**: ✅ Property and style bindings work
- **Global Store**: ✅ Basic functionality works
- **Event Handling**: ⚠️ Simple cases work, complex cases need testing
- **Computed Properties**: ❌ Not reliable
- **Watchers**: ❌ Not reliable  
- **Router**: 🚧 Needs testing
- **Lifecycle**: 🚧 Needs testing

This framework is suitable for **simple to medium complexity applications** but may need additional work for complex reactive scenarios.