import redux = require('redux');
import React = require('react');
import ReactDOM = require('react-dom');
import { createStore } from 'redux';

import app = require('./app');
import { routingCallback } from 'vada';
import { bindClass, classnames, ClassMap } from 'vada-react';
import { addSampleItems } from './utils';
import { bindRoute, RouteRequest, initializeRouting } from 'vada-browser';

interface HeaderProps extends React.Props<Header> {
    dispatcher: Dispatcher;
    text: string;
};

const ENTER_KEY = 13;
    
class Header extends React.Component<HeaderProps, void> {
    newItem(e: React.KeyboardEvent) {
        if (e.keyCode === ENTER_KEY && this.props.text.trim()!=="") {
            this.props.dispatcher.createNew();
        }
    }
    changeText(e: React.FormEvent) {
        this.props.dispatcher.entryText(e.target["value"]);
    }
    render() {
        return (<div>
            <h1>todos</h1>
            <input className="new-todo" placeholder="What needs to be done?"
                   value={this.props.text} onKeyDown={e => this.newItem(e)}
                   onChange={e => this.changeText(e) }/>
        </div>);
    };
};

interface TodoProps extends app.TodoItem, React.Props<TodoItem> {
    dispatcher: Dispatcher;
}

interface TodoState {
    editing: boolean;
}
class TodoItem extends React.Component<TodoProps, TodoState> {
    constructor(props?: TodoProps) {
        super(props);
        this.state = {
            editing: false
        };
    }
    changeText(e: React.FormEvent) {
        this.props.dispatcher.editItem(this.props.id, e.target["value"]);
    }
    toggle() {
        this.props.dispatcher.toggleCompleted(this.props.id);
    }
    deleteMe(e: React.MouseEvent) {
        this.props.dispatcher.deleteItem(this.props.id);
    }
    startEditing(e: React.MouseEvent) {
        this.setState({editing: true});
    }
    endEditing(e: React.KeyboardEvent) {
        if (e.keyCode === ENTER_KEY) {
            this.setState({editing: false});
        }
    }
    render() {
        let cm: ClassMap = {
            editing: this.state.editing,
            completed: this.props.completed
        };
        return <li className={classnames(cm)}>
            <div className="view">
                <input className="toggle" type="checkbox"
                       checked={this.props.completed}
                       onChange={e => this.toggle()}/>
                <label onDoubleClick={e => this.startEditing(e)}>
                    {this.props.text}
                </label>
                <button className="destroy" onClick={e => this.deleteMe(e)}>
                </button>
            </div>
            <input className="edit" value={this.props.text}
                   onKeyDown={e => this.endEditing(e)}
                   onChange={e => this.changeText(e)}/>
        </li>;
    };
};

interface FooterProps extends React.Props<Footer> {
    dispatcher: Dispatcher;
    completed: number;
    left: number;
    route: string;
};

class Footer extends React.Component<FooterProps, void> {
    render() {
        let allClass = this.props.route==app.allRoute.id ? "selected" : null;
        let actClass = this.props.route==app.activeRoute.id ? "selected" : null;
        let compClass = this.props.route==app.completedRoute.id ? "selected" : null;
        return <footer className="footer">
            <span className="todo-count">
                <strong>{this.props.left}</strong>
                <span>&nbsp;</span>
                <span>{this.props.left==1 ? "item" : "items"} left</span>
            </span>
            <ul className="filters">
                <li><a href={this.props.dispatcher.all.href(null)}
                       className={allClass}>All</a></li>
                <li><a href={this.props.dispatcher.active.href(null)}
                       className={actClass}>Active</a></li>
                <li><a href={this.props.dispatcher.completed.href(null)}
                       className={compClass}>Completed</a></li>
            </ul>
            {this.props.completed===0 ? null : 
             <button className="clear-completed"
             onClick={e => this.props.dispatcher.clearCompleted() }>
                Clear completed
            </button>}
        </footer>;
    }
};

interface AppProps extends React.Props<App> {
    state: app.AppState;
    dispatcher: Dispatcher;
}

class App extends React.Component<AppProps, void> {
    render() {
        let items = app.filter(this.props.state.route.name, this.props.state.items);
        let todos = items.map(item => (
            <TodoItem {...item} dispatcher={this.props.dispatcher}
                                key={item.id}/>));
        let completed = this.props.state.items.length-this.props.state.count;
        let toggleDone = this.props.state.count===0;
        return <div>
                <Header text={this.props.state.entry}
                        dispatcher={this.props.dispatcher}/>
                <section className="main">
                    <input className="toggle-all" type="checkbox"
                           onClick={e => this.props.dispatcher.markAllAs(!toggleDone)}
                           checked={toggleDone}/>
                    <ul className="todo-list">
                        {todos}
                    </ul>
                </section>
                <Footer left={this.props.state.count}
                        completed={completed}
                        dispatcher={this.props.dispatcher}
                        route={this.props.state.route.name}/>
        </div>;
    }
}

class Dispatcher {
    all: RouteRequest<{}>;
    active: RouteRequest<{}>;
    completed: RouteRequest<{}>;
    constructor(public store: redux.Store<app.AppState>) {
        this.all = bindRoute(app.allRoute, "/");
        this.active = bindRoute(app.activeRoute, "/active");
        this.completed = bindRoute(app.completedRoute, "/completed");
        initializeRouting(routingCallback(store, () => {
            this.all.goto(null);
        }));
    }
    entryText(s: string) {
        this.store.dispatch(app.entryText.request(s));
    }
    createNew() { this.store.dispatch(app.createNew.request(null)); }
    deleteItem(id: number) {
        this.store.dispatch(app.deleteItem.request(id));
    }
    clearCompleted() {
        this.store.dispatch(app.clearCompleted.request(null));
    }
    editItem(id: number, t: string) {
        this.store.dispatch(app.editItem.request({id: id, t: t}));
    }
    markAs(id: number, as: boolean) {
        this.store.dispatch(app.markAs.request({id: id, as: as}));
    }
    markAllAs(as: boolean) {
        this.store.dispatch(app.markAllAs.request(as));
    }
    toggleCompleted(id: number) {
        this.store.dispatch(app.toggleCompleted.request(id));
    }
}

export function render(elem: Element) {
    let store = createStore(app.reducer);
    let dispatcher = new Dispatcher(store);
    addSampleItems(store);
    let Root = bindClass(store, App, (s: app.AppState) => {
        return {
            state: s,
            dispatcher: dispatcher,
        };
    });
    ReactDOM.render(<Root/>, elem);
}
