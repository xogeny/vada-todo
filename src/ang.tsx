import { Component, provide, Inject, Input } from 'angular2/core';
import { bootstrap } from 'angular2/platform/browser';
import { createStore } from 'redux';
import { addSampleItems } from './utils';

import app = require('./app');

@Component({
    selector: "Header",
    template: `
<div>
  <h1>todos</h1>
  <input class="new-todo" placeholder="What needs to be done?">
</div>`,
})
class Header {
    constructor(@Inject('Actions') private actions: app.ActionProvider) {
    }
}

@Component({
    selector: "TodoItem",
    template: `
<li class="completed">
  <div class="view">
     <input class="toggle" type="checkbox">
     <label>
       {{item.text}}
     </label>
     <button class="destroy">
     </button>
  </div>
  <input class="edit">
</li>
`,
})
class TodoItem {
    @Input() public item: app.TodoItem;
}

/*
*/
@Component({
    selector: 'todo-app',
    directives: [Header, TodoItem],
    template: `
<div>
  <Header></Header>
  <section class="main">
    <input class="toggle-all" type="checkbox">
    <ul class="todo-list">
      <TodoItem [item]="item"
                *ngFor="#item of actions.store.getState().items; #i = index">
      </TodoItem>
    </ul>
  </section>
</div>
`
})
class AppComponent {
    public state: app.AppState;
    constructor(@Inject('Actions') private actions: app.ActionProvider) {
        this.state = this.actions.store.getState();
        this.actions.store.subscribe(() => {
            console.log("State updated")
            this.state = this.actions.store.getState();
        })
    }
}

export function bootstrapAngular() {
    let store = createStore(app.reducer);
    let actions = new app.ActionProvider(store);
    addSampleItems(store);
    
    bootstrap(AppComponent, [
        provide('Actions', {
            useFactory: () => actions
        }
    )]);
}
