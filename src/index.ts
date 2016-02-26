import 'zone.js';
import 'reflect-metadata';

///<reference path="../node_modules/angular2/typings/browser.d.ts"/>

import app = require('./app');

import {bootstrap}    from 'angular2/platform/browser'

import { AppComponent } from './ang';

import view = require('./view');

const angular = true

if (angular) {
    console.log("Bootstrap!");
    bootstrap(AppComponent);
} else {
    view.render(document.getElementById("main"))
}
