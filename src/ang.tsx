import { Component, provide, Inject, Input, OnInit, OnChanges, ElementRef, View,
         ChangeDetectorRef } from 'angular2/core';
import { bootstrap } from 'angular2/platform/browser';
import { createStore } from 'redux';
import { ENTER_KEY, addSampleItems } from './utils';
import * as r from './view';

import { Footer2 } from './rang';

import app = require('./app');

@Component({
    selector: "Header",
    template: `
<div>
  <h1>Angular2</h1>
  <input #todotext class="new-todo" placeholder="What needs to be done?"
         [(ngModel)]=value (ngModelChange)="actions.entryText(todotext.value)"
         (keyup.enter)="actions.createNew(); value=''">
</div>`,
}) class Header implements OnInit, OnChanges {
    @Input() actions: app.ActionProvider;
    @Input() text: string;
    value: string; // Used with ngModel
    constructor() {}
    ngOnInit() {
        // A bit of a kludge. This state is introduced because
        // otherwise Angular2 resets the focus on the <input>
        this.value = this.text;
    }
    ngOnChanges() {
        this.value = this.text;
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
         (ngModelChange)="actions.editItem(item.id, text)"
         (keyup.enter)="editing=false">
</li>
`,
}) class TodoItem implements OnInit, OnChanges {
    @Input() public actions: app.ActionProvider;
    @Input() public item: app.TodoItem;
    public editing: boolean = false;
    public text: string; // Same focus kludge as with Header
    ngOnInit() {
        this.text = this.item.text;
    }
    ngOnChanges() {
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
}) class Footer {
    @Input() actions: app.ActionProvider;
    @Input() active: number;
    @Input() total: number;
    @Input() route: string;
    public allRoute = app.allRoute;
    public activeRoute = app.activeRoute;
    public completedRoute = app.completedRoute;
}

@Component({
    selector: 'todo-app',
    directives: [Header, TodoItem, Footer, Footer2],
    template: `
<div>
  <Header [text]="state.entry" [actions]="actions"></Header>
  <section class="main">
    <input class="toggle-all" type="checkbox"
           [checked]="state.active==0" (click)="actions.markAllAs(state.active>0)">
    <ul class="todo-list">
      <TodoItem *ngFor="#item of items; #i = index; trackBy: itemid"
                [item]="item" [actions]="actions">
      </TodoItem>
    </ul>
  </section>
  <foo data="foo"></foo>
  <Footer2 [active]="state.active" [actions]="actions"
          [total]="state.items.length" [route]="state.route.name">
  </Footer2>
</div>
`
})
export class AppComponent {
    public state: app.AppState;
    public items: app.TodoItem[];
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
    
    bootstrap(AppComponent,
              [provide('Actions', { useFactory: () => actions })]);
}
