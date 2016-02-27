import { Component, provide, Inject, Input, ChangeDetectorRef } from 'angular2/core';
import { bootstrap } from 'angular2/platform/browser';
import { createStore } from 'redux';
import { ENTER_KEY, addSampleItems } from './utils';

import app = require('./app');

@Component({
    selector: "Header",
    template: `
<div>
  <h1>todos</h1>
  <input #todotext class="new-todo" placeholder="What needs to be done?"
         [value]=text (keyup)="handleKey($event, todotext.value)">
</div>`,
})
class Header {
    @Input() text: string;
    @Input() actions: app.ActionProvider;
    handleKey(e: KeyboardEvent, text: string) {
        if (e.which !== ENTER_KEY) {
            this.actions.entryText(text)
            return
        }
        if (text.trim()==="") return;
        this.actions.createNew();
    }
}

@Component({
    selector: "TodoItem",
    template: `
<li [class.completed]="item.completed" [class.editing]="editing">
  <div class="view">
     <input class="toggle" type="checkbox" [checked]="item.completed"
            (click)="actions.toggleCompleted(item.id)">
     <label (dblclick)="editing=true" >{{item.text}}</label>
     <button class="destroy" (click)="actions.deleteItem(item.id)">
     </button>
  </div>
  <input #edittext class="edit" [value]="item.text"
         (keyup)="handleKey($event, edittext.value)">
</li>
`,
}) class TodoItem {
    public editing: boolean = false;
    @Input() public item: app.TodoItem;
    @Input() public actions: app.ActionProvider;
    handleKey(e: KeyboardEvent, text: string) {
        if (text.trim()==="") return;
        if (e.which !== ENTER_KEY) {
            this.actions.editItem(this.item.id, text);
            console.log("Change field to ", text);
            console.log("editing = ", this.editing);
            return;
        }
        console.log("Ending editing, e.which = ", e.which);
        this.editing = false;
    }
    constructor() {
        console.log("Creating TodoItem");
    }
}

@Component({
    selector: "Footer",
    template: `
<footer class="footer">
    <span class="todo-count">
        <strong>{{active}}&nbsp;</strong>
        <span>item<span *ngIf="active!=1">s</span> left</span>
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
    @Input() active: number;
    constructor(@Inject('Actions') private actions: app.ActionProvider) {
    }
}

@Component({
    selector: 'todo-app',
    directives: [Header, TodoItem, Footer],
    template: `
<div>
  <Header [text]="state.entry" [actions]="actions"></Header>
  <section class="main">
    <input class="toggle-all" type="checkbox">
    <ul class="todo-list">
      <TodoItem *ngFor="#item of state.items; #i = index; trackBy: itemid"
                [item]="item" [actions]="actions">
      </TodoItem>
    </ul>
  </section>
  <Footer active="{{state.active}}">
  </Footer>
</div>
`
})
class AppComponent {
    public state: app.AppState;
    // TODO: This avoids re-instantiating TodoItems when they are updated.
    // However, the cursor position still gets reset to the end when
    // ever an update occurs ?!?
    public itemid(index: number, item: app.TodoItem) { return item.id; }
    constructor(@Inject('Actions') private actions: app.ActionProvider,
                ref: ChangeDetectorRef) {
        this.state = this.actions.store.getState();
        this.actions.store.subscribe(() => {
            this.state = this.actions.store.getState();
            ref.markForCheck();
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
