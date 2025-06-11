import 'reflect-metadata';
import { createElement, mount, Component, Render, State, Event, Store, Use, Watch, Computed } from '../index';

describe('Global Store Functionality', () => {
  test('store synchronizes across components', () => {
    @Component('div')
    class ComponentA {
      @Store('globalCounter') counter = 0;

      @Event('click')
      increment() {
        this.counter++;
      }

      @Render()
      render() {
        return createElement('button', null, `A: ${this.counter}`);
      }
    }

    @Component('div')
    class ComponentB {
      @Use('globalCounter') counter = 0;

      @Render()
      render() {
        return createElement('span', null, `B: ${this.counter}`);
      }
    }

    @Component('div')
    class App {
      @Render()
      render() {
        return createElement('div', null,
          createElement(ComponentA, null),
          createElement(ComponentB, null)
        );
      }
    }

    const container = document.createElement('div');
    mount(createElement(App, null), container);
    
    expect(container.querySelector('button')?.textContent).toBe('A: 0');
    expect(container.querySelector('span')?.textContent).toBe('B: 0');
    
    // Click to increment in ComponentA
    container.querySelector('button')?.dispatchEvent(new MouseEvent('click'));
    
    expect(container.querySelector('button')?.textContent).toBe('A: 1');
    expect(container.querySelector('span')?.textContent).toBe('B: 1');
  });

  test('multiple store instances with different IDs', () => {
    @Component('div')
    class ComponentWithMultipleStores {
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

    const container = document.createElement('div');
    mount(createElement(ComponentWithMultipleStores, null), container);
    
    expect(container.textContent).toContain('Users: 0, Sessions: 0');
    expect(container.textContent).toContain('Display Users: 0');
    
    // Add user
    const addUserBtn = container.querySelector('[data-action="addUser"]') as HTMLElement;
    addUserBtn.dispatchEvent(new MouseEvent('click'));
    
    expect(container.textContent).toContain('Users: 1, Sessions: 0');
    expect(container.textContent).toContain('Display Users: 1');
    
    // Add session
    const addSessionBtn = container.querySelector('[data-action="addSession"]') as HTMLElement;
    addSessionBtn.dispatchEvent(new MouseEvent('click'));
    
    expect(container.textContent).toContain('Users: 1, Sessions: 1');
    expect(container.textContent).toContain('Display Users: 1');
  });

  test('computed properties work with store values', () => {
    @Component('div')
    class ComputedStoreComponent {
      @Store('items') items: string[] = [];
      @State() filter = '';

      @Computed()
      get filteredItems() {
        return this.items.filter(item => 
          item.toLowerCase().includes(this.filter.toLowerCase())
        );
      }

      @Computed()
      get itemCount() {
        return this.filteredItems.length;
      }

      @Event('click')
      addItem() {
        this.items = [...this.items, `Item ${this.items.length + 1}`];
      }

      @Event('input')
      updateFilter(event: InputEvent) {
        this.filter = (event.target as HTMLInputElement).value;
      }

      @Render()
      render() {
        return createElement('div', null,
          createElement('input', { placeholder: 'Filter items...' }),
          createElement('button', null, 'Add Item'),
          createElement('div', null, `Total: ${this.items.length}, Filtered: ${this.itemCount}`),
          createElement('div', null, 
            this.filteredItems.map((item, index) => 
              createElement('div', { key: index }, item)
            )
          )
        );
      }
    }

    const container = document.createElement('div');
    mount(createElement(ComputedStoreComponent, null), container);
    
    expect(container.textContent).toContain('Total: 0, Filtered: 0');
    
    // Add items
    const addBtn = container.querySelector('button') as HTMLElement;
    addBtn.dispatchEvent(new MouseEvent('click'));
    addBtn.dispatchEvent(new MouseEvent('click'));
    
    expect(container.textContent).toContain('Total: 2, Filtered: 2');
    expect(container.textContent).toContain('Item 1');
    expect(container.textContent).toContain('Item 2');
  });

  test('watchers work with store changes', () => {
    const watchCalls: Array<[any, any]> = [];

    @Component('div')
    class WatchedStoreComponent {
      @Store('watchedValue') value = 0;

      @Watch('value')
      onValueChange(newValue: any, oldValue: any) {
        watchCalls.push([newValue, oldValue]);
      }

      @Event('click')
      increment() {
        this.value++;
      }

      @Render()
      render() {
        return createElement('button', null, `Value: ${this.value}`);
      }
    }

    const container = document.createElement('div');
    mount(createElement(WatchedStoreComponent, null), container);
    
    expect(watchCalls).toEqual([]);
    
    // Increment value
    const button = container.querySelector('button') as HTMLElement;
    button.dispatchEvent(new MouseEvent('click'));
    button.dispatchEvent(new MouseEvent('click'));
    
    expect(watchCalls).toEqual([[1, 0], [2, 1]]);
    expect(container.querySelector('button')?.textContent).toBe('Value: 2');
  });
});