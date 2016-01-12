import React = require('react');
import ReactDOM = require('react-dom');
import { createStore } from 'redux';

import { reducer, AppState } from './app';
import { bindClass } from 'vada-react';
//import { } from 'vada-browser';

export class App extends React.Component<AppState & React.Props<App>, void> {
    render() {
        return <section className="main">
            <input className="toggle-all" type="checkbox"
                   value=""/>
            <ul className="todo-list">
                <li className="">
                    <div className="view">
                        <input className="toggle" type="checkbox" value=""/>
                            <label>
                                Bump npm packages
                            </label>
                            <button className="destroy">
                            </button>
                    </div>
                    <input className="edit" value="Bump npm packages"/>
                </li>
            </ul>
            <footer className="footer">
                <span className="todo-count">
                    <strong>
                        1
                    </strong>
                    <span>
                    </span>
                    <span>
                        item</span>
                    <span>
                        left</span>
                </span>
                <ul className="filters">
                    <li>
                        <a href="#/" className="selected">
                            All
                        </a>
                    </li>
                    <span></span>
                    <li>
                        <a href="#/active" className="">
                            Active
                        </a>
                    </li>
                    <span>
                    </span>
                    <li>
                        <a href="#/completed" className="">
                            Completed
                        </a>
                    </li>
                </ul>
                <button className="clear-completed">
                    Clear completed
                </button>
            </footer>
        </section>;
    }
}

export function render(elem: Element) {
    let store = createStore(reducer);
    let Root = bindClass(store, App, (s: AppState) => s);
    ReactDOM.render(<Root/>, elem);
}
