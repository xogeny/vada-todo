import { createStore } from 'redux';
import app = require('./app');
import { addSampleItems } from './utils';
import { bootstrap } from 'angular2/platform/browser';
import { provide } from 'angular2/core';

import { AppComponent } from './angular2';

import { bindClass } from 'vada/lib/src/react';

import { App } from './react';
import React = require('react');
import ReactDOM = require('react-dom');

export function run(showReact: boolean, showAngular: boolean, elem: Element) {
    let store = createStore(app.reducer);
    let actions = new app.ActionProvider(store);
    addSampleItems(store);

    let Root = bindClass(store, App, (s: app.AppState) => {
        return {
            state: s,
            actions: actions,
        };
    });
    if (showReact) {
        ReactDOM.render(<Root/>, elem);
    }

    if (showAngular) {
        bootstrap(AppComponent,
                  [provide('Actions', { useFactory: () => actions })]);
    }
}


export function render(elem: Element) {
    let store = createStore(app.reducer);
    let actions = new app.ActionProvider(store);
    addSampleItems(store);

    let Root = bindClass(store, App, (s: app.AppState) => {
        return {
            state: s,
            actions: actions,
        };
    });
    ReactDOM.render(<Root/>, elem);
}

export function bootstrapAngular() {
    let store = createStore(app.reducer);
    let actions = new app.ActionProvider(store);
    addSampleItems(store);
    
    bootstrap(AppComponent,
              [provide('Actions', { useFactory: () => actions })]);
}
