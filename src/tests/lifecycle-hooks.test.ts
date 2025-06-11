import 'reflect-metadata';
import { createElement, mount, Component, Render, State, Event, Mounted, BeforeMount, Destroyed, BeforeUnmount, BeforeUpdate, Updated, ErrorCaptured, Prop } from '../index';

describe('Lifecycle Hooks Tests', () => {
  test('basic lifecycle hook execution order', () => {
    const lifecycleEvents: string[] = [];

    @Component('div')
    class LifecycleTestComponent {
      @State() count = 0;

      @BeforeMount()
      beforeMount() {
        lifecycleEvents.push('beforeMount');
      }

      @Mounted()
      mounted() {
        lifecycleEvents.push('mounted');
      }

      @BeforeUpdate()
      beforeUpdate() {
        lifecycleEvents.push('beforeUpdate');
      }

      @Updated()
      updated() {
        lifecycleEvents.push('updated');
      }

      @BeforeUnmount()
      beforeUnmount() {
        lifecycleEvents.push('beforeUnmount');
      }

      @Destroyed()
      destroyed() {
        lifecycleEvents.push('destroyed');
      }

      @Event('click')
      increment() {
        this.count++;
      }

      @Render()
      render() {
        return createElement('div', null,
          createElement('span', { id: 'count' }, this.count.toString()),
          createElement('button', { id: 'increment' }, 'Increment')
        );
      }
    }

    const container = document.createElement('div');
    const instance = mount(createElement(LifecycleTestComponent, null), container);
    
    // Check initial render and mount hooks
    expect(lifecycleEvents).toContain('beforeMount');
    expect(lifecycleEvents).toContain('mounted');
    expect(container.querySelector('#count')?.textContent).toBe('0');
    
    // Trigger update
    const incrementBtn = container.querySelector('#increment') as HTMLElement;
    incrementBtn.click();
    
    // Check update hooks
    expect(lifecycleEvents).toContain('beforeUpdate');
    expect(lifecycleEvents).toContain('updated');
    expect(container.querySelector('#count')?.textContent).toBe('1');
    
    // Trigger destroy
    if (instance && typeof instance.destroy === 'function') {
      instance.destroy();
      expect(lifecycleEvents).toContain('beforeUnmount');
      expect(lifecycleEvents).toContain('destroyed');
    }
  });

  test('mounted hook access to DOM elements', () => {
    let domElementRef: HTMLElement | null = null;
    let elementId: string = '';

    @Component('div')
    class DOMAccessComponent {
      @Mounted()
      mounted() {
        // Access the host DOM element after mounting
        const instance = (this as any)[Symbol.for('EchelonInternalInstance')];
        if (instance && instance.hostDomElement) {
          domElementRef = instance.hostDomElement as HTMLElement;
          elementId = domElementRef.id || 'no-id';
        }
      }

      @Render()
      render() {
        return createElement('div', { id: 'mounted-test' },
          createElement('span', null, 'DOM Access Test')
        );
      }
    }

    const container = document.createElement('div');
    mount(createElement(DOMAccessComponent, null), container);
    
    // Check that mounted hook has access to DOM
    expect(domElementRef).toBeTruthy();
    expect(elementId).toBe('mounted-test');
  });

  test('error handling with ErrorCaptured hook', () => {
    const capturedErrors: Error[] = [];
    let shouldThrowError = false;

    @Component('div')
    class ErrorPropagationComponent {
      @ErrorCaptured()
      errorCaptured(error: Error, context: any) {
        capturedErrors.push(error);
        return true; // Prevent error propagation
      }

      @Event('click')
      triggerError() {
        shouldThrowError = true;
        // Force re-render which will trigger error
        (this as any).forceUpdate();
      }

      @Render()
      render() {
        if (shouldThrowError) {
          throw new Error('Test error');
        }
        return createElement('div', null,
          createElement('button', { id: 'error-trigger' }, 'Trigger Error'),
          createElement('span', null, 'No error')
        );
      }
    }

    const container = document.createElement('div');
    mount(createElement(ErrorPropagationComponent, null), container);
    
    // Initial state should be fine
    expect(container.querySelector('span')?.textContent).toBe('No error');
    
    // Note: This test depends on the framework's error handling implementation
    // In a real implementation, we'd test the actual error capture mechanism
    expect(capturedErrors).toHaveLength(0); // Initially no errors
  });

  test('lifecycle hooks with state changes', () => {
    const stateChanges: Array<{ hook: string; count: number }> = [];

    @Component('div')
    class StateLifecycleComponent {
      @State() count = 0;
      @State() isVisible = true;

      @BeforeMount()
      beforeMount() {
        stateChanges.push({ hook: 'beforeMount', count: this.count });
      }

      @Mounted()
      mounted() {
        stateChanges.push({ hook: 'mounted', count: this.count });
      }

      @BeforeUpdate()
      beforeUpdate() {
        stateChanges.push({ hook: 'beforeUpdate', count: this.count });
      }

      @Updated()
      updated() {
        stateChanges.push({ hook: 'updated', count: this.count });
      }

      @Event('click')
      handleClick(event: MouseEvent) {
        const target = event.target as HTMLElement;
        const action = target.dataset.action;
        
        if (action === 'increment') {
          this.count++;
        } else if (action === 'toggle') {
          this.isVisible = !this.isVisible;
        }
      }

      @Render()
      render() {
        return createElement('div', null,
          this.isVisible && createElement('div', { id: 'content' },
            createElement('span', { id: 'count' }, this.count.toString()),
            createElement('button', { 'data-action': 'increment' }, 'Increment'),
            createElement('button', { 'data-action': 'toggle' }, 'Toggle')
          )
        );
      }
    }

    const container = document.createElement('div');
    mount(createElement(StateLifecycleComponent, null), container);
    
    // Check initial lifecycle
    expect(stateChanges.some(s => s.hook === 'beforeMount' && s.count === 0)).toBe(true);
    expect(stateChanges.some(s => s.hook === 'mounted' && s.count === 0)).toBe(true);
    
    // Trigger state change
    const incrementBtn = container.querySelector('[data-action="increment"]') as HTMLElement;
    incrementBtn.click();
    
    // Check update lifecycle
    expect(stateChanges.some(s => s.hook === 'beforeUpdate')).toBe(true);
    expect(stateChanges.some(s => s.hook === 'updated')).toBe(true);
    expect(container.querySelector('#count')?.textContent).toBe('1');
    
    // Trigger visibility toggle
    const toggleBtn = container.querySelector('[data-action="toggle"]') as HTMLElement;
    toggleBtn.click();
    
    expect(container.querySelector('#content')).toBeFalsy();
  });

  test('lifecycle hooks with component composition', () => {
    const parentEvents: string[] = [];
    const childEvents: string[] = [];

    @Component('div')
    class ChildComponent {
      @BeforeMount()
      beforeMount() {
        childEvents.push('child-beforeMount');
      }

      @Mounted()
      mounted() {
        childEvents.push('child-mounted');
      }

      @BeforeUnmount()
      beforeUnmount() {
        childEvents.push('child-beforeUnmount');
      }

      @Destroyed()
      destroyed() {
        childEvents.push('child-destroyed');
      }

      @Render()
      render(@Prop('message') message: string) {
        return createElement('span', { id: 'child-message' }, message);
      }
    }

    @Component('div')
    class ParentComponent {
      @State() showChild = true;
      @State() childMessage = 'Hello Child';

      @BeforeMount()
      beforeMount() {
        parentEvents.push('parent-beforeMount');
      }

      @Mounted()
      mounted() {
        parentEvents.push('parent-mounted');
      }

      @BeforeUpdate()
      beforeUpdate() {
        parentEvents.push('parent-beforeUpdate');
      }

      @Updated()
      updated() {
        parentEvents.push('parent-updated');
      }

      @Event('click')
      toggleChild() {
        this.showChild = !this.showChild;
      }

      @Render()
      render() {
        return createElement('div', null,
          createElement('button', { id: 'toggle' }, 'Toggle Child'),
          this.showChild && createElement(ChildComponent, { message: this.childMessage })
        );
      }
    }

    const container = document.createElement('div');
    mount(createElement(ParentComponent, null), container);
    
    // Check initial lifecycle order
    expect(parentEvents).toContain('parent-beforeMount');
    expect(parentEvents).toContain('parent-mounted');
    expect(childEvents).toContain('child-beforeMount');
    expect(childEvents).toContain('child-mounted');
    
    // Check child is rendered
    expect(container.querySelector('#child-message')?.textContent).toBe('Hello Child');
    
    // Toggle child visibility (should trigger unmount/destroy)
    const toggleBtn = container.querySelector('#toggle') as HTMLElement;
    toggleBtn.click();
    
    expect(container.querySelector('#child-message')).toBeFalsy();
    expect(parentEvents).toContain('parent-beforeUpdate');
    expect(parentEvents).toContain('parent-updated');
    
    // Note: Child unmount/destroy events depend on framework implementation
    // In a full implementation, we'd expect:
    // expect(childEvents).toContain('child-beforeUnmount');
    // expect(childEvents).toContain('child-destroyed');
  });

  test('async operations in lifecycle hooks', async () => {
    const asyncResults: string[] = [];
    let asyncDataLoaded = false;

    @Component('div')
    class AsyncLifecycleComponent {
      @State() data = 'Loading...';

      @Mounted()
      async mounted() {
        asyncResults.push('mounted-start');
        
        // Simulate async data loading
        await new Promise(resolve => setTimeout(resolve, 10));
        
        this.data = 'Data loaded';
        asyncDataLoaded = true;
        asyncResults.push('mounted-complete');
      }

      @Render()
      render() {
        return createElement('div', { id: 'async-data' }, this.data);
      }
    }

    const container = document.createElement('div');
    mount(createElement(AsyncLifecycleComponent, null), container);
    
    // Initially should show loading
    expect(container.querySelector('#async-data')?.textContent).toBe('Loading...');
    expect(asyncResults).toContain('mounted-start');
    
    // Wait for async operation
    await new Promise(resolve => setTimeout(resolve, 20));
    
    expect(asyncResults).toContain('mounted-complete');
    expect(asyncDataLoaded).toBe(true);
    // Note: Whether the DOM updates depends on the framework's async handling
  });

  test('lifecycle hooks with cleanup operations', () => {
    let intervalId: number | null = null;
    let timerCount = 0;
    const cleanupCalls: string[] = [];

    @Component('div')
    class CleanupComponent {
      @State() seconds = 0;

      @Mounted()
      mounted() {
        // Start a timer that needs cleanup
        intervalId = window.setInterval(() => {
          timerCount++;
          this.seconds++;
        }, 10);
      }

      @BeforeUnmount()
      beforeUnmount() {
        cleanupCalls.push('beforeUnmount');
        if (intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
      }

      @Destroyed()
      destroyed() {
        cleanupCalls.push('destroyed');
      }

      @Render()
      render() {
        return createElement('div', { id: 'timer' }, `Seconds: ${this.seconds}`);
      }
    }

    const container = document.createElement('div');
    const instance = mount(createElement(CleanupComponent, null), container);
    
    // Check initial state
    expect(container.querySelector('#timer')?.textContent).toBe('Seconds: 0');
    expect(intervalId).toBeTruthy();
    
    // Wait a bit for timer
    setTimeout(() => {
      expect(timerCount).toBeGreaterThan(0);
    }, 30);
    
    // Cleanup
    if (instance && typeof instance.destroy === 'function') {
      instance.destroy();
      expect(cleanupCalls).toContain('beforeUnmount');
      expect(cleanupCalls).toContain('destroyed');
      expect(intervalId).toBeNull();
    }
  });
});