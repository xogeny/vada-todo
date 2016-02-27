import { Component, provide, Inject, Input, OnInit,
         ChangeDetectorRef } from 'angular2/core';
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
        if (text.trim()==="") return;
        if (e.which !== ENTER_KEY) {
            this.actions.entryText(text)
        } else {
            this.actions.createNew();
        }
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
  <input #edittext class="edit" [(ngModel)]="text"
         (keyup)="handleKey($event, edittext.value)">
</li>
`,
}) class TodoItem implements OnInit {
    public editing: boolean = false;
    public text: string;
    @Input() public item: app.TodoItem;
    @Input() public actions: app.ActionProvider;
    handleKey(e: KeyboardEvent, text: string) {
        if (text.trim()==="") return;
        if (e.which !== ENTER_KEY) {
            this.actions.editItem(this.item.id, text);
            return;
        }
        this.editing = false;
    }
    ngOnInit() {
        this.text = this.item.text;
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
        <li><a href="{{actions.all.href(null)}}"
               [class.selected]="route==allRoute.id">All</a></li>
        <li><a href="{{actions.active.href(null)}}"
               [class.selected]="route==activeRoute.id">Active</a></li>
        <li><a href="{{actions.completed.href(null)}}"
               [class.selected]="route==completedRoute.id">Completed</a></li>
    </ul>
    <button class="clear-completed" *ngIf="active!=total"
            (click)="actions.clearCompleted()">
       Clear completed
    </button>
</footer>
`,
})
class Footer {
    @Input() active: number;
    @Input() total: number;
    @Input() route: string;
    @Input() actions: app.ActionProvider;
    public allRoute = app.allRoute;
    public activeRoute = app.activeRoute;
    public completedRoute = app.completedRoute;
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
      <TodoItem *ngFor="#item of items; #i = index; trackBy: itemid"
                [item]="item" [actions]="actions">
      </TodoItem>
    </ul>
  </section>
  <Footer [active]="state.active" [actions]="actions"
          [total]="state.items.length" [route]="state.route.name">
  </Footer>
</div>
`
})
class AppComponent {
    public state: app.AppState;
    public items: app.TodoItem[];
    // TODO: The itemid avoids re-instantiating TodoItems when they are updated.
    // However, the cursor position still gets reset to the end when
    // ever an update occurs ?!?
    public itemid(index: number, item: app.TodoItem) { return item.id; }
    constructor(@Inject('Actions') private actions: app.ActionProvider, ref: ChangeDetectorRef) {
        this.state = this.actions.store.getState();
        this.items = app.memoFilter({route: this.state.route.name,
                                    items: this.state.items});
        this.actions.store.subscribe(() => {
            this.state = this.actions.store.getState();
            this.items = app.memoFilter({route: this.state.route.name,
                                        items: this.state.items});
            ref.detectChanges();
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
