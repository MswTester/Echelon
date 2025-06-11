import 'reflect-metadata';
import { createElement, mount, Component, Render, State, Event } from '../index';

describe('Basic Documentation Examples', () => {
  test('simple hello world component', () => {
    @Component('div')
    class HelloWorld {
      @Render()
      render() {
        return createElement('h1', null, 'Hello, Echelon!');
      }
    }

    const container = document.createElement('div');
    mount(createElement(HelloWorld, null), container);
    expect(container.innerHTML).toBe('<div><h1>Hello, Echelon!</h1></div>');
  });

  test('fragment-based component', () => {
    @Component()
    class FragmentComponent {
      @Render()
      render() {
        return createElement('div', null, 'Fragment content');
      }
    }

    const container = document.createElement('div');
    mount(createElement(FragmentComponent, null), container);
    expect(container.innerHTML).toBe('<div>Fragment content</div>');
  });

  test('counter with state and events', () => {
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

    const container = document.createElement('div');
    mount(createElement(Counter, null), container);
    
    expect(container.innerHTML).toBe('<div><span>0</span></div>');
    
    // Click to increment
    container.querySelector('div')?.dispatchEvent(new MouseEvent('click'));
    expect(container.innerHTML).toBe('<div><span>1</span></div>');
  });
});