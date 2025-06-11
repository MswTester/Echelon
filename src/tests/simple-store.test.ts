import 'reflect-metadata';
import { createElement, mount, Component, Render, Store, Use } from '../index';

describe('Simple Store Test', () => {
  test('store basic functionality', () => {
    @Component('div')
    class StoreProvider {
      @Store('testStore') value = 42;

      @Render()
      render() {
        return createElement('span', null, `Provider: ${this.value}`);
      }
    }

    const container = document.createElement('div');
    mount(createElement(StoreProvider, null), container);
    
    expect(container.textContent).toBe('Provider: 42');
  });

  test('store updates work manually', () => {
    @Component('div')
    class StoreProvider {
      @Store('testStore2') value = 0;

      increment() {
        this.value++;
      }

      @Render()
      render() {
        return createElement('span', null, `Value: ${this.value}`);
      }
    }

    const container = document.createElement('div');
    const instance = mount(createElement(StoreProvider, null), container);
    
    expect(container.textContent).toBe('Value: 0');
    
    // Manually call increment
    const comp = instance?.componentObject as any;
    comp.increment();
    
    expect(container.textContent).toBe('Value: 1');
  });
});