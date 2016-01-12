import React = require('react');
import ReactDOM = require('react-dom');
import { createStore } from 'redux';

import app = require('./app');
import { bindClass } from 'vada-react';
import { addSampleItems } from './utils';
//import { } from 'vada-browser';

interface HeaderProps extends React.Props<Header> {
    text: string;
};
    
class Header extends React.Component<HeaderProps, void> {
    render() {
        return (<div>
            <h1>todos</h1>
            <input className="new-todo" placeholder="What needs to be done?"
                   value={this.props.text}/>
        </div>);
    };
};

interface TodoProps extends app.TodoItem, React.Props<TodoItem> {}
class TodoItem extends React.Component<TodoProps, void> {
    render() {
        return <li className="">
            <div className="view">
                <input className="toggle" type="checkbox"
                       checked={this.props.completed}/>
                <label>
                    {this.props.text}
                </label>
                <button className="destroy">
                </button>
            </div>
            <input className="edit" value="Bump npm packages"/>
        </li>;
    };
};

interface FooterProps extends React.Props<Footer> {
    items: number;
    completed: number;
    route: string;
};

class Footer extends React.Component<FooterProps, void> {
    render() {
        let left = this.props.items-this.props.completed;
        let allClass = this.props.route==app.allRoute.id ? "selected" : null;
        let actClass = this.props.route==app.activeRoute.id ? "selected" : null;
        let compClass = this.props.route==app.completedRoute.id ? "selected" : null;
        //let left = 2;
        return <footer className="footer">
            <span className="todo-count">
                <strong>{left}</strong>
                <span>&nbsp;</span>
                <span>{left==1 ? "item" : "items"} left</span>
            </span>
            <ul className="filters">
                <li><a href="#/" className={allClass}>All</a></li>
                <li><a href="#/active" className={actClass}>Active</a></li>
                <li><a href="#/completed" className={compClass}>Completed</a></li>
            </ul>
            {left==0 ? null : 
            <button className="clear-completed">
                Clear completed
            </button>}
        </footer>;
    }
};

export class App extends React.Component<app.AppState & React.Props<App>, void> {
    render() {
        let todos = this.props.items.map(item => (
            <TodoItem {...item}
                      key={item.id}/>));
        return <div>
                <Header text={this.props.entry}/>
                <section className="main">
                    <input className="toggle-all" type="checkbox"
                           checked={this.props.items.length==this.props.count}/>

                    <ul className="todo-list">
                        {todos}
                    </ul>
                </section>
                <Footer items={this.props.items.length}
                        route={this.props.route.name}
                        completed={this.props.count}/>
        </div>;
    }
}

export function render(elem: Element) {
    let store = createStore(app.reducer);
    addSampleItems(store);
    let Root = bindClass(store, App, (s: app.AppState) => s);
    ReactDOM.render(<Root/>, elem);
}
