import { createElement, Fragment, mount, Component, Render, State, Event, Store, Use, Watch } from 'echelon';

@Component('div')
class Counter {
  @State() count = 0;

  @Event('click')
  increment(_e: Event) {
    this.count++;
  }

  @Render()
  render() {
    return createElement('span', null, this.count);
  }
}

describe('Echelon basic component', () => {
  test('state updates trigger re-render', () => {
    const container = document.createElement('div');
    mount(createElement(Counter, null), container);
    expect(container.innerHTML).toBe('<div><span>0</span></div>');

    // dispatch click event to increment count
    container.firstElementChild!.dispatchEvent(new MouseEvent('click'));
    expect(container.innerHTML).toBe('<div><span>1</span></div>');
  });

  test('store values sync across components', () => {
    @Component('div')
    class Provider {
      @Store('shared') count = 0;

      @Event('click')
      inc(_e: Event) { this.count++; }

      @Render()
      render() {
        return createElement('span', null, this.count, createElement(Display, null));
      }
    }

    @Component('span')
    class Display {
      @Use('shared') count = 0;

      @Render()
      render() {
        return createElement('em', null, this.count);
      }
    }

    const container = document.createElement('div');
    mount(createElement(Provider, null), container);
    expect(container.innerHTML).toBe('<div><span>0<span><em>0</em></span></span></div>');

    container.firstElementChild!.dispatchEvent(new MouseEvent('click'));
    expect(container.innerHTML).toBe('<div><span>1<span><em>1</em></span></span></div>');
  });

  test('watch decorator triggers on state change', () => {
    @Component('div')
    class WatchComp {
      @State() value = 0;
      changes: Array<[number, number]> = [];

      @Watch('value')
      onChange(n: number, o: number) {
        this.changes.push([n, o]);
      }

      @Render()
      render() {
        return createElement('span', null, this.value);
      }
    }

    const container = document.createElement('div');
    const instance = mount(createElement(WatchComp, null), container)!;
    const comp = instance.componentObject as any;
    comp.value = 1;
    comp.value = 2;

    expect(comp.changes).toEqual([
      [1, 0],
      [2, 1],
    ]);
  });
});
