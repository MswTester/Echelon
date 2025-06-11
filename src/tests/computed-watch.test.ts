import 'reflect-metadata';
import { createElement, mount, Component, Render, State, Computed, Watch } from '../index';

describe('Computed Properties and Watchers', () => {
  test('computed properties update automatically', () => {
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
        return `${this.firstName[0] || ''}${this.lastName[0] || ''}`.toUpperCase();
      }

      @Render()
      render() {
        return createElement('div', null,
          createElement('span', { id: 'fullName' }, this.fullName),
          createElement('span', { id: 'initials' }, this.initials)
        );
      }
    }

    const container = document.createElement('div');
    const instance = mount(createElement(ComputedExample, null), container);
    
    expect(container.querySelector('#fullName')?.textContent).toBe('John Doe');
    expect(container.querySelector('#initials')?.textContent).toBe('JD');
    
    // Update state directly
    const comp = instance?.componentObject as any;
    comp.firstName = 'Jane';
    
    expect(container.querySelector('#fullName')?.textContent).toBe('Jane Doe');
    expect(container.querySelector('#initials')?.textContent).toBe('JD');
  });

  test('watchers react to state changes', () => {
    const watchCalls: Array<[number, number]> = [];

    @Component('div')
    class WatcherExample {
      @State() count = 0;

      @Watch('count')
      onCountChange(newValue: number, oldValue: number) {
        watchCalls.push([newValue, oldValue]);
      }

      @Render()
      render() {
        return createElement('span', null, this.count);
      }
    }

    const container = document.createElement('div');
    const instance = mount(createElement(WatcherExample, null), container);
    
    const comp = instance?.componentObject as any;
    comp.count = 1;
    comp.count = 2;
    
    expect(watchCalls).toEqual([[1, 0], [2, 1]]);
  });

  test('computed properties work with complex dependencies', () => {
    @Component('div')
    class ComplexComputedExample {
      @State() items: string[] = ['apple', 'banana', 'cherry'];
      @State() filter = '';

      @Computed()
      get filteredItems() {
        if (!this.filter) return this.items;
        return this.items.filter(item => 
          item.toLowerCase().includes(this.filter.toLowerCase())
        );
      }

      @Computed()
      get itemCount() {
        return this.filteredItems.length;
      }

      @Computed()
      get summary() {
        return `${this.itemCount} items (filtered from ${this.items.length})`;
      }

      @Render()
      render() {
        return createElement('div', null,
          createElement('div', { id: 'summary' }, this.summary),
          createElement('div', { id: 'count' }, this.itemCount.toString()),
          createElement('div', { id: 'items' }, 
            this.filteredItems.map((item, index) => 
              createElement('span', { key: index }, `${item} `)
            )
          )
        );
      }
    }

    const container = document.createElement('div');
    const instance = mount(createElement(ComplexComputedExample, null), container);
    
    expect(container.querySelector('#summary')?.textContent).toBe('3 items (filtered from 3)');
    expect(container.querySelector('#count')?.textContent).toBe('3');
    expect(container.querySelector('#items')?.textContent).toBe('apple banana cherry ');
    
    // Update filter
    const comp = instance?.componentObject as any;
    comp.filter = 'a';
    
    expect(container.querySelector('#summary')?.textContent).toBe('2 items (filtered from 3)');
    expect(container.querySelector('#count')?.textContent).toBe('2');
    expect(container.querySelector('#items')?.textContent).toBe('apple banana ');
  });

  test('watchers work with computed properties', () => {
    const computedWatchCalls: Array<[string, string]> = [];

    @Component('div')
    class ComputedWatcherExample {
      @State() firstName = 'John';
      @State() lastName = 'Doe';

      @Computed()
      get fullName() {
        return `${this.firstName} ${this.lastName}`;
      }

      @Watch('fullName')
      onFullNameChange(newValue: string, oldValue: string) {
        computedWatchCalls.push([newValue, oldValue]);
      }

      @Render()
      render() {
        return createElement('span', null, this.fullName);
      }
    }

    const container = document.createElement('div');
    const instance = mount(createElement(ComputedWatcherExample, null), container);
    
    const comp = instance?.componentObject as any;
    comp.firstName = 'Jane';
    comp.lastName = 'Smith';
    
    expect(computedWatchCalls).toEqual([
      ['Jane Doe', 'John Doe'],
      ['Jane Smith', 'Jane Doe']
    ]);
  });
});