///<reference path="../node_modules/angular2/typings/browser.d.ts"/>

// This stuff is needed by Angular at runtime...
import 'zone.js';
import 'reflect-metadata';

// This is the (viewless) business logic
import app = require('./app');

// This is required to launch the React version
import view = require('./view');

export { run, bootstrapAngular, render } from './entry';
