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
    selector: "Footer",
    template: `
<footer class="footer">
    <span class="todo-count">
        <strong>{active}&nbsp;</strong>
        <span>item<span *ngIf="this.props.active!=1">s</span> left</span>
    </span>
    <ul class="filters">
        <li><a href="" class="cl(app.allRoute)">All</a></li>
        <li><a href="" class="cl(app.activeRoute)">Active</a></li>
        <li><a href="" class="cl(app.completedRoute)">Completed</a></li>
    </ul>
    <button class="clear-completed" *ngIf="completed!=0">
       Clear completed
    </button>
</footer>
`,
})
class Footer {
    constructor(@Inject('Actions') private actions: app.ActionProvider) {
    }
}

@Component({
    selector: "TodoItem",
    template: `
<li [class.completed]="item.completed">
  <div class="view">
     <input class="toggle" type="checkbox" [value]="item.completed">
     <label>{{item.text}}</label>
     <button class="destroy">
     </button>
  </div>
  <input class="edit" [value]="item.text">
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
    directives: [Header, TodoItem, Footer],
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
  <Footer>
  </Footer>
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
