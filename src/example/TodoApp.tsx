/** @jsx createElement */
/** @jsxFrag Fragment */
import { createElement, Fragment, Component, Render, State, Event, Prop, Store } from 'echelon';

@Component('li')
class TodoItem {
  idx = 0;
  onRemove: (i: number) => void = () => {};

  @Event('click')
  handleClick(_e: MouseEvent) {
    this.onRemove(this.idx);
  }

  @Render()
  render(
    @Prop('text') text: string,
    @Prop('idx') idx: number,
    @Prop('onRemove') onRemove: (i: number) => void
  ) {
    this.idx = idx;
    this.onRemove = onRemove;
    return <span>{text}</span>;
  }
}

@Component('div')
export class TodoApp {
  @Store('items') items: string[] = [];
  @State() inputValue: string = '';

  removeItem(index: number) {
    this.items = this.items.filter((_, i) => i !== index);
  }

  @Event('submit')
  addItem(e: Event) {
    e.preventDefault();
    if (this.inputValue.trim()) {
      this.items = [...this.items, this.inputValue];
      this.inputValue = '';
    }
  }

  @Event('input')
  updateInput(e: InputEvent) {
    this.inputValue = (e.target as HTMLInputElement).value;
  }

  @Render()
  render() {
    return (
      createElement(Fragment, null,
        createElement('form', null,
          createElement('input', { value: this.inputValue }),
          createElement('button', { type: 'submit' }, 'Add')
        ),
        createElement('ul', null,
          this.items.map((t, i) =>
            createElement(TodoItem, { text: t, idx: i, onRemove: this.removeItem.bind(this) })
          )
        )
      )
    );
  }
}
