import { Component, Render, State, Event, Property, Prop, Children, Mounted, Style, StyleLayout } from 'echelon';

@Component('div')
class Comp1 {
  @State() count: number = 0;
  @Style('background-color') r: string = 'red';
  @Style() backgroundColor: string = 'blue';
  @StyleLayout() style = { color: 'white', transition: 'all 0.2s ease' };
  @Property('id') id: string = 'comp-div';

  @Event('click') clickHandle(e: MouseEvent) {
    console.log(e.clientX, e.clientY)
    this.count++;
  }

  @Render() render(@Children() child: ChildNode, @Prop('plus') p: number) {
    console.log('Comp1 rendering, count:', this.count);
    return (<span>
      Count: {this.count + p}
      {child}
    </span>);
  }
}

@Component()
export class Root {
  @State() plusFromRoot:number = 0;
  loop:NodeJS.Timer | undefined;

  @Render() render(){
    return <Comp1 plus={this.plusFromRoot}>hahaha</Comp1>
  }

  @Mounted() init(){
    this.loop = setInterval(() => {
      this.plusFromRoot ++;
    }, 1000);
  }

}

