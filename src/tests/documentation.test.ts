import 'reflect-metadata';
import { 
  createElement, 
  Fragment, 
  mount, 
  Component, 
  Render, 
  State, 
  Event, 
  Property, 
  Method,
  Style,
  StyleLayout,
  Prop,
  Children,
  Store,
  Use,
  Watch,
  Computed,
  Mounted,
  BeforeMount,
  Updated,
  BeforeUpdate,
  BeforeUnmount,
  Destroyed
} from '../index';

describe('Documentation Examples', () => {
  beforeEach(() => {
    // Clear any existing stores
    const globalStore = (global as any).globalStore;
    if (globalStore) {
      globalStore.clear();
    }
  });

  describe('Basic Component Creation', () => {
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
  });

  describe('State Management', () => {
    test('counter with state and events', () => {
      @Component('div')
      class Counter {
        @State() count = 0;
        @State() step = 1;

        @Event('click')
        increment(event: MouseEvent) {
          const target = event.target as HTMLElement;
          if (target.dataset.action === 'increment') {
            this.count += this.step;
          } else if (target.dataset.action === 'decrement') {
            this.count -= this.step;
          } else if (target.dataset.action === 'reset') {
            this.count = 0;
          }
        }

        @Render()
        render() {
          return createElement('div', null,
            createElement('h2', null, `Count: ${this.count}`),
            createElement('div', null,
              createElement('button', { 'data-action': 'decrement' }, `-${this.step}`),
              createElement('button', { 'data-action': 'increment' }, `+${this.step}`),
              createElement('button', { 'data-action': 'reset' }, 'Reset')
            )
          );
        }
      }

      const container = document.createElement('div');
      mount(createElement(Counter, null), container);
      
      expect(container.querySelector('h2')?.textContent).toBe('Count: 0');
      
      // Test increment
      const incrementBtn = container.querySelector('[data-action="increment"]') as HTMLElement;
      incrementBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      expect(container.querySelector('h2')?.textContent).toBe('Count: 1');
      
      // Test decrement
      const decrementBtn = container.querySelector('[data-action="decrement"]') as HTMLElement;
      decrementBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      expect(container.querySelector('h2')?.textContent).toBe('Count: 0');
      
      // Test reset
      incrementBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      const resetBtn = container.querySelector('[data-action="reset"]') as HTMLElement;
      resetBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      expect(container.querySelector('h2')?.textContent).toBe('Count: 0');
    });
  });

  describe('Props and Children', () => {
    test('button component with props and children', () => {
      @Component('button')
      class Button {
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
          @Children() children: any,
          @Prop('variant') variant: 'primary' | 'secondary' = 'primary'
        ) {
          this.clickHandler = onClick;
          
          return createElement('span', {
            className: `btn btn-${variant}`
          }, children);
        }
      }

      let clicked = false;
      const handleClick = () => { clicked = true; };

      const container = document.createElement('div');
      mount(createElement(Button, { 
        onClick: handleClick, 
        variant: 'primary' 
      }, 'Click me'), container);
      
      expect(container.innerHTML).toBe('<button class="btn btn-primary"><span class="btn btn-primary">Click me</span></button>');
      
      container.querySelector('button')?.dispatchEvent(new MouseEvent('click'));
      expect(clicked).toBe(true);
    });

    test('card component with title and children', () => {
      @Component('div')
      class Card {
        @Render()
        render(
          @Prop('title') title: string,
          @Children() children: any,
          @Prop('subtitle') subtitle?: string
        ) {
          return createElement('div', { className: 'card' },
            createElement('div', { className: 'card-header' },
              createElement('h3', { className: 'card-title' }, title),
              subtitle && createElement('p', { className: 'card-subtitle' }, subtitle)
            ),
            createElement('div', { className: 'card-content' }, children)
          );
        }
      }

      const container = document.createElement('div');
      mount(createElement(Card, {
        title: 'Test Card',
        subtitle: 'A test subtitle'
      }, createElement('p', null, 'Card content')), container);
      
      expect(container.querySelector('.card-title')?.textContent).toBe('Test Card');
      expect(container.querySelector('.card-subtitle')?.textContent).toBe('A test subtitle');
      expect(container.querySelector('.card-content p')?.textContent).toBe('Card content');
    });
  });

  describe('DOM Interactions', () => {
    test('property bindings', () => {
      @Component('input')
      class InputComponent {
        @State() inputValue = '';
        @Property('value') value = '';
        @Property('disabled') disabled = false;

        @Event('input')
        handleInput(event: InputEvent) {
          const input = event.target as HTMLInputElement;
          this.inputValue = input.value;
          this.value = input.value;
        }

        @Render()
        render() {
          return createElement('span', null, this.inputValue);
        }
      }

      const container = document.createElement('div');
      mount(createElement(InputComponent, null), container);
      
      const input = container.querySelector('input') as HTMLInputElement;
      expect(input).toBeTruthy();
      expect(input.value).toBe('');
      expect(input.disabled).toBe(false);
    });

    test('style bindings', () => {
      @Component('div')
      class StyledComponent {
        @Style('background-color') backgroundColor = '#f0f0f0';
        @Style() color = '#333';
        @StyleLayout() layout = {
          display: 'flex',
          padding: '20px'
        };

        @Render()
        render() {
          return createElement('span', null, 'Styled content');
        }
      }

      const container = document.createElement('div');
      mount(createElement(StyledComponent, null), container);
      
      const div = container.querySelector('div') as HTMLElement;
      expect(div.style.backgroundColor).toBe('rgb(240, 240, 240)');
      expect(div.style.color).toBe('rgb(51, 51, 51)');
      expect(div.style.display).toBe('flex');
      expect(div.style.padding).toBe('20px');
    });
  });

  describe('Lifecycle Hooks', () => {
    test('lifecycle methods are called in correct order', () => {
      const calls: string[] = [];

      @Component('div')
      class LifecycleComponent {
        @State() count = 0;

        @BeforeMount()
        beforeMount() {
          calls.push('beforeMount');
        }

        @Mounted()
        mounted() {
          calls.push('mounted');
        }

        @BeforeUpdate()
        beforeUpdate() {
          calls.push('beforeUpdate');
        }

        @Updated()
        updated() {
          calls.push('updated');
        }

        @BeforeUnmount()
        beforeUnmount() {
          calls.push('beforeUnmount');
        }

        @Destroyed()
        destroyed() {
          calls.push('destroyed');
        }

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
      const instance = mount(createElement(LifecycleComponent, null), container);
      
      expect(calls).toEqual(['beforeMount', 'mounted']);
      
      // Trigger update
      container.querySelector('div')?.dispatchEvent(new MouseEvent('click'));
      expect(calls).toEqual(['beforeMount', 'mounted', 'beforeUpdate', 'updated']);
      
      // Clean up
      if (instance) {
        instance.destroy();
        expect(calls).toEqual(['beforeMount', 'mounted', 'beforeUpdate', 'updated', 'beforeUnmount', 'destroyed']);
      }
    });
  });

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
      
      // Update state
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
      const instance = mount(createElement(WatcherExample, null), container);
      
      const comp = instance?.componentObject as any;
      comp.count = 1;
      comp.count = 2;
      
      expect(watchCalls).toEqual([[1, 0], [2, 1]]);
    });
  });

  describe('Global Store', () => {
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
      
      // Click to increment
      container.querySelector('button')?.dispatchEvent(new MouseEvent('click'));
      
      expect(container.querySelector('button')?.textContent).toBe('A: 1');
      expect(container.querySelector('span')?.textContent).toBe('B: 1');
    });
  });
});