///<reference path="../node_modules/angular2/typings/browser.d.ts"/>

// This stuff is needed by Angular at runtime...
import 'zone.js';
import 'reflect-metadata';

// This is the (viewless) business logic
import app = require('./app');

// These are required to launch the Angular2 version
import { bootstrap }    from 'angular2/platform/browser'
import { AppComponent } from './ang';

export function bootstrapAngular() {
    bootstrap(AppComponent);
}

// This is required to launch the React version
import view = require('./view');

export function mountReact(elem: Element) {
    view.render(elem)
}
