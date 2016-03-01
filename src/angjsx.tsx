import { Component, Input, OnInit, OnChanges,
         ElementRef, View } from 'angular2/core';
import app = require('./app');

import { RouteId } from 'vada';

import React = require('react');
import ReactDOM = require('react-dom');

export abstract class RBase implements OnInit, OnChanges {
    abstract template(): JSX.Element;
    constructor(protected elementRef: ElementRef) {
    }
    ngOnInit() {
        ReactDOM.render(
            this.template(),
            this.elementRef.nativeElement);
    }
    ngOnChanges() {
        ReactDOM.render(
            this.template(),
            this.elementRef.nativeElement);
    }
}

@Component({
    selector: "Footer2",
    template: '',
}) export class Footer2 extends RBase {
    @Input() actions: app.ActionProvider;
    @Input() active: number;
    @Input() total: number;
    @Input() route: string;
    public allRoute = app.allRoute;
    public activeRoute = app.activeRoute;
    public completedRoute = app.completedRoute;
    constructor(elem: ElementRef) {
        super(elem)
    }
    template() {
        let cl = (a: RouteId<any>) => (this.route==a.id ? "selected": "");
        return (
            <footer className="footer">
                <span className="todo-count">
                    <strong>{this.active}&nbsp;</strong>
                    <span>{this.active==1 ? "item" : "items"} remaining</span>
                </span>
                <ul className="filters">
                    <li><a href={this.actions.all.href(null)}
                           className={cl(app.allRoute)}>All</a></li>
                    <li><a href={this.actions.active.href(null)}
                           className={cl(app.activeRoute)}>Active</a></li>
                    <li><a href={this.actions.completed.href(null)}
                           className={cl(app.completedRoute)}>Completed</a></li>
                </ul>
                {this.active==this.total ? null : 
                 <button className="clear-completed"
                         onClick={e => this.actions.clearCompleted() }>
                     Clear completed
                 </button>}
            </footer>);
    }
}
