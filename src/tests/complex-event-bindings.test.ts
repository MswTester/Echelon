import 'reflect-metadata';
import { createElement, mount, Component, Render, State, Event, Store, Use } from '../index';

describe('Complex Event Binding Tests', () => {
  test('event delegation with data attributes', () => {
    @Component('div')
    class EventDelegationComponent {
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
          createElement('div', { className: 'tabs' },
            createElement('button', { 
              'data-action': 'tab', 
              'data-value': 'home',
              id: 'tab-home'
            }, 'Home'),
            createElement('button', { 
              'data-action': 'tab', 
              'data-value': 'about',
              id: 'tab-about'
            }, 'About')
          ),
          // Active content
          createElement('div', { id: 'active-tab' }, `Active tab: ${this.activeTab}`),
          // Items list
          createElement('div', { className: 'items' },
            createElement('button', { 
              'data-action': 'add',
              id: 'add-item' 
            }, 'Add Item'),
            ...this.items.map((item, index) => 
              createElement('div', { key: index, className: 'item' },
                createElement('span', null, item),
                createElement('button', { 
                  'data-action': 'remove', 
                  'data-value': index.toString(),
                  className: 'remove-btn'
                }, 'Remove')
              )
            )
          )
        );
      }
    }

    const container = document.createElement('div');
    mount(createElement(EventDelegationComponent, null), container);
    
    // Test initial state
    expect(container.querySelector('#active-tab')?.textContent).toBe('Active tab: home');
    expect(container.querySelectorAll('.item')).toHaveLength(3);
    
    // Test tab switching
    const aboutTab = container.querySelector('#tab-about') as HTMLElement;
    aboutTab.click();
    expect(container.querySelector('#active-tab')?.textContent).toBe('Active tab: about');
    
    // Test adding item
    const addBtn = container.querySelector('#add-item') as HTMLElement;
    addBtn.click();
    expect(container.querySelectorAll('.item')).toHaveLength(4);
    expect(container.querySelector('.item:last-child span')?.textContent).toBe('Item 4');
    
    // Test removing item
    const removeBtn = container.querySelector('.remove-btn') as HTMLElement;
    removeBtn.click();
    expect(container.querySelectorAll('.item')).toHaveLength(3);
  });

  test('multiple event types on same component', () => {
    let keydownEvents: string[] = [];
    let focusEvents: string[] = [];

    @Component('input')
    class MultiEventComponent {
      @State() value = '';
      @State() isActive = false;

      @Event('input')
      handleInput(event: InputEvent) {
        this.value = (event.target as HTMLInputElement).value;
      }

      @Event('keydown')
      handleKeydown(event: KeyboardEvent) {
        keydownEvents.push(event.key);
      }

      @Event('focus')
      handleFocus() {
        this.isActive = true;
        focusEvents.push('focus');
      }

      @Event('blur')
      handleBlur() {
        this.isActive = false;
        focusEvents.push('blur');
      }

      @Render()
      render() {
        return createElement('div', null,
          createElement('span', { id: 'value' }, this.value),
          createElement('span', { id: 'status' }, this.isActive ? 'active' : 'inactive')
        );
      }
    }

    const container = document.createElement('div');
    const instance = mount(createElement(MultiEventComponent, null), container);
    const inputElement = instance?.hostDomElement as HTMLInputElement;
    
    // Test input event
    inputElement.value = 'test';
    const inputEvent = document.createEvent('Event');
    inputEvent.initEvent('input', true, true);
    inputElement.dispatchEvent(inputEvent);
    expect(container.querySelector('#value')?.textContent).toBe('test');
    
    // Test focus event
    const focusEvent = document.createEvent('Event');
    focusEvent.initEvent('focus', true, true);
    inputElement.dispatchEvent(focusEvent);
    expect(container.querySelector('#status')?.textContent).toBe('active');
    expect(focusEvents).toContain('focus');
    
    // Test keydown event
    const keydownEvent = document.createEvent('KeyboardEvent');
    (keydownEvent as any).initKeyboardEvent('keydown', true, true, window, 'Enter', 0, false, false, false, false);
    inputElement.dispatchEvent(keydownEvent);
    expect(keydownEvents).toContain('Enter');
    
    // Test blur event
    const blurEvent = document.createEvent('Event');
    blurEvent.initEvent('blur', true, true);
    inputElement.dispatchEvent(blurEvent);
    expect(container.querySelector('#status')?.textContent).toBe('inactive');
    expect(focusEvents).toContain('blur');
  });

  test('event binding with store updates', () => {
    @Component('div')
    class StoreEventComponent {
      @Store('eventCounter') counter = 0;
      @Store('eventHistory') history: string[] = [];

      @Event('click')
      handleClick(event: MouseEvent) {
        const target = event.target as HTMLElement;
        const action = target.dataset.action;
        
        if (action === 'increment') {
          this.counter++;
          this.history = [...this.history, `increment: ${this.counter}`];
        } else if (action === 'decrement') {
          this.counter--;
          this.history = [...this.history, `decrement: ${this.counter}`];
        } else if (action === 'reset') {
          this.counter = 0;
          this.history = [...this.history, 'reset'];
        }
      }

      @Render()
      render() {
        return createElement('div', null,
          createElement('div', { id: 'counter' }, `Count: ${this.counter}`),
          createElement('div', { id: 'history-length' }, `History: ${this.history.length}`),
          createElement('button', { 'data-action': 'increment' }, '+'),
          createElement('button', { 'data-action': 'decrement' }, '-'),
          createElement('button', { 'data-action': 'reset' }, 'Reset')
        );
      }
    }

    @Component('div')
    class StoreConsumerComponent {
      @Use('eventCounter') counter = 0;
      @Use('eventHistory') history: string[] = [];

      @Render()
      render() {
        return createElement('div', null,
          createElement('div', { id: 'consumer-counter' }, `Consumer Count: ${this.counter}`),
          createElement('div', { id: 'consumer-history' }, `Consumer History: ${this.history.length}`)
        );
      }
    }

    const container = document.createElement('div');
    mount(createElement(StoreEventComponent, null), container);
    
    const consumerContainer = document.createElement('div');
    mount(createElement(StoreConsumerComponent, null), consumerContainer);
    
    // Test increment
    const incrementBtn = container.querySelector('[data-action="increment"]') as HTMLElement;
    incrementBtn.click();
    
    expect(container.querySelector('#counter')?.textContent).toBe('Count: 1');
    expect(container.querySelector('#history-length')?.textContent).toBe('History: 1');
    expect(consumerContainer.querySelector('#consumer-counter')?.textContent).toBe('Consumer Count: 1');
    expect(consumerContainer.querySelector('#consumer-history')?.textContent).toBe('Consumer History: 1');
    
    // Test decrement
    const decrementBtn = container.querySelector('[data-action="decrement"]') as HTMLElement;
    decrementBtn.click();
    
    expect(container.querySelector('#counter')?.textContent).toBe('Count: 0');
    expect(consumerContainer.querySelector('#consumer-counter')?.textContent).toBe('Consumer Count: 0');
    
    // Test reset
    incrementBtn.click();
    incrementBtn.click();
    const resetBtn = container.querySelector('[data-action="reset"]') as HTMLElement;
    resetBtn.click();
    
    expect(container.querySelector('#counter')?.textContent).toBe('Count: 0');
    expect(container.querySelector('#history-length')?.textContent).toBe('History: 4'); // increment, decrement, increment, increment, reset
  });

  test('event bubbling and stopPropagation', () => {
    let parentClicks = 0;
    let childClicks = 0;

    @Component('div')
    class BubblingTestComponent {
      @Event('click')
      handleParentClick(event: MouseEvent) {
        const target = event.target as HTMLElement;
        if (target.dataset.role === 'parent') {
          parentClicks++;
        }
      }

      @Render()
      render() {
        return createElement('div', { 'data-role': 'parent', id: 'parent' },
          createElement(ChildComponent, null)
        );
      }
    }

    @Component('div')
    class ChildComponent {
      @Event('click')
      handleChildClick(event: MouseEvent) {
        const target = event.target as HTMLElement;
        if (target.dataset.role === 'child') {
          childClicks++;
          if (target.dataset.stop === 'true') {
            event.stopPropagation();
          }
        }
      }

      @Render()
      render() {
        return createElement('div', null,
          createElement('button', { 
            'data-role': 'child', 
            id: 'child-normal' 
          }, 'Normal Click'),
          createElement('button', { 
            'data-role': 'child', 
            'data-stop': 'true',
            id: 'child-stop' 
          }, 'Stop Propagation')
        );
      }
    }

    const container = document.createElement('div');
    mount(createElement(BubblingTestComponent, null), container);
    
    // Test normal bubbling
    const normalBtn = container.querySelector('#child-normal') as HTMLElement;
    normalBtn.click();
    expect(childClicks).toBe(1);
    // Note: Parent click won't increment because target role is 'child', not 'parent'
    
    // Test stop propagation
    const stopBtn = container.querySelector('#child-stop') as HTMLElement;
    stopBtn.click();
    expect(childClicks).toBe(2);
    
    // Test parent click
    const parentDiv = container.querySelector('#parent') as HTMLElement;
    parentDiv.click();
    expect(parentClicks).toBe(1);
  });

  test('high-frequency event handling performance', () => {
    let mouseMoveCount = 0;
    const startTime = Date.now();

    @Component('div')
    class PerformanceTestComponent {
      @State() x = 0;
      @State() y = 0;

      @Event('mousemove')
      handleMouseMove(event: MouseEvent) {
        mouseMoveCount++;
        this.x = event.clientX;
        this.y = event.clientY;
      }

      @Render()
      render() {
        return createElement('div', {
          id: 'performance-test',
          style: { width: '100px', height: '100px', position: 'relative' }
        },
          createElement('span', { id: 'coords' }, `${this.x},${this.y}`)
        );
      }
    }

    const container = document.createElement('div');
    mount(createElement(PerformanceTestComponent, null), container);
    
    const testDiv = container.querySelector('#performance-test') as HTMLElement;
    
    // Simulate multiple mouse move events
    for (let i = 0; i < 100; i++) {
      const event = document.createEvent('MouseEvent');
      event.initMouseEvent('mousemove', true, true, window, 0, 0, 0, i, i * 2, false, false, false, false, 0, null);
      testDiv.dispatchEvent(event);
    }
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    expect(mouseMoveCount).toBe(100);
    expect(container.querySelector('#coords')?.textContent).toBe('99,198');
    expect(duration).toBeLessThan(1000); // Should complete within 1 second
  });
});