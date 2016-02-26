///<reference path="../node_modules/angular2/typings/browser.d.ts"/>
import 'zone.js';
import 'reflect-metadata';

import app = require('./app');

import {bootstrap}    from 'angular2/platform/browser'

import { AppComponent } from './ang';

import view = require('./view');

export function bootstrapAngular() {
    console.log("Bootstrap!");
    bootstrap(AppComponent);
}

export function mountReact(elem: Element) {
    view.render(elem)
}
