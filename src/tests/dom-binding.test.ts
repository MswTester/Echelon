import 'reflect-metadata';
import { createElement, mount, Component, Render, State, Event, Property, Style, StyleLayout } from '../index';

describe('DOM Binding Features', () => {
  test('property bindings update DOM properties', () => {
    @Component('input')
    class InputComponent {
      @State() inputValue = 'initial';
      @Property('value') value = 'initial';
      @Property('disabled') disabled = false;

      @Event('click')
      toggle() {
        this.disabled = !this.disabled;
        this.inputValue = this.disabled ? 'disabled' : 'enabled';
        this.value = this.inputValue;
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
    expect(input.value).toBe('initial');
    expect(input.disabled).toBe(false);
    
    // Click to toggle
    input.dispatchEvent(new MouseEvent('click'));
    expect(input.disabled).toBe(true);
    expect(input.value).toBe('disabled');
  });

  test('style bindings update CSS styles', () => {
    @Component('div')
    class StyledComponent {
      @State() isActive = false;
      @Style('background-color') backgroundColor = '#f0f0f0';
      @Style() color = '#333';

      @Event('click')
      toggle() {
        this.isActive = !this.isActive;
        this.backgroundColor = this.isActive ? '#007bff' : '#f0f0f0';
        this.color = this.isActive ? 'white' : '#333';
      }

      @Render()
      render() {
        return createElement('span', null, this.isActive ? 'Active' : 'Inactive');
      }
    }

    const container = document.createElement('div');
    mount(createElement(StyledComponent, null), container);
    
    const div = container.querySelector('div') as HTMLElement;
    expect(div.style.backgroundColor).toBe('rgb(240, 240, 240)');
    expect(div.style.color).toBe('rgb(51, 51, 51)');
    
    // Click to toggle
    div.dispatchEvent(new MouseEvent('click'));
    expect(div.style.backgroundColor).toBe('rgb(0, 123, 255)');
    expect(div.style.color).toBe('white');
  });

  test('style layout bindings apply multiple CSS properties', () => {
    @Component('div')
    class LayoutComponent {
      @State() layoutMode = 'flex';
      @StyleLayout() layout: any = {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px'
      };

      @Event('click')
      toggleLayout() {
        this.layoutMode = this.layoutMode === 'flex' ? 'block' : 'flex';
        if (this.layoutMode === 'flex') {
          this.layout = {
            ...this.layout,
            display: this.layoutMode,
            flexDirection: 'column'
          };
        } else {
          this.layout = {
            display: this.layoutMode,
            justifyContent: 'center',
            alignItems: 'center',
            padding: '20px'
          };
        }
      }

      @Render()
      render() {
        return createElement('span', null, `Layout: ${this.layoutMode}`);
      }
    }

    const container = document.createElement('div');
    mount(createElement(LayoutComponent, null), container);
    
    const div = container.querySelector('div') as HTMLElement;
    expect(div.style.display).toBe('flex');
    expect(div.style.justifyContent).toBe('center');
    expect(div.style.alignItems).toBe('center');
    expect(div.style.padding).toBe('20px');
    
    // Click to toggle layout
    div.dispatchEvent(new MouseEvent('click'));
    expect(div.style.display).toBe('block');
  });
});