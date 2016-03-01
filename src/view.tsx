import redux = require('redux');
import React = require('react');
import ReactDOM = require('react-dom');
import { createStore } from 'redux';

import app = require('./app');
import { routingCallback, RouteId } from 'vada';
import { ENTER_KEY, addSampleItems } from './utils';

import { bindClass, classnames, ClassMap } from 'vada/lib/src/react';

interface HeaderProps extends React.Props<Header> {
    actions: app.ActionProvider;
    text: string;
};

class Header extends React.Component<HeaderProps, void> {
    input: HTMLInputElement;
    newItem(e: React.KeyboardEvent) {
        if (e.keyCode !== ENTER_KEY || this.props.text.trim()==="") return;
        this.props.actions.createNew();
    }
    render() {
        return (<div>
            <h1>React</h1>
            <input className="new-todo" placeholder="What needs to be done?"
                   value={this.props.text} onKeyDown={e => this.newItem(e)}
                   ref={(input) => this.input = input}
                   onChange={e => this.props.actions.entryText(this.input.value) }/>
        </div>);
    };
};

interface TodoProps extends app.TodoItem, React.Props<TodoItem> {
    actions: app.ActionProvider;
}

interface TodoState {
    editing: boolean;
}

class TodoItem extends React.Component<TodoProps, TodoState> {
    input: HTMLInputElement;
    constructor(props?: TodoProps) {
        super(props);
        this.state = { editing: false };
    }
    endEditing(e: React.KeyboardEvent) {
        if (e.keyCode !== ENTER_KEY) return;
        this.setState({editing: false});
    }
    render() {
        let cm: ClassMap = {
            editing: this.state.editing,
            completed: this.props.completed
        };
        let { actions, id } = this.props;
        return <li className={classnames(cm)}>
            <div className="view">
                <input className="toggle" type="checkbox"
                       checked={this.props.completed}
                       onChange={e => actions.toggleCompleted(id)}/>
                <label onDoubleClick={e => this.setState({editing: true})}>
                    {this.props.text}
                </label>
                <button className="destroy" onClick={e => actions.deleteItem(id)}>
                </button>
            </div>
            <input className="edit" value={this.props.text}
                   onKeyDown={e => this.endEditing(e)}
                   ref={(input) => this.input = input}                   
                   onChange={e => actions.editItem(id, this.input.value)}/>
        </li>;
    };
};

interface FooterProps extends React.Props<Footer> {
    actions: app.ActionProvider;
    active: number;
    total: number;
    route: string;
};

class Footer extends React.Component<FooterProps, void> {
    render() {
        let cl = (a: RouteId<any>) => (this.props.route==a.id ? "selected": "");
        return <footer className="footer">
            <span className="todo-count">
                <strong>{this.props.active}&nbsp;</strong>
                <span>{this.props.active==1 ? "item" : "items"} left</span>
            </span>
            <ul className="filters">
                <li><a href={this.props.actions.all.href(null)}
                       className={cl(app.allRoute)}>All</a></li>
                <li><a href={this.props.actions.active.href(null)}
                       className={cl(app.activeRoute)}>Active</a></li>
                <li><a href={this.props.actions.completed.href(null)}
                       className={cl(app.completedRoute)}>Completed</a></li>
            </ul>
            {this.props.active==this.props.total ? null : 
             <button className="clear-completed"
                     onClick={e => this.props.actions.clearCompleted() }>
                 Clear completed
             </button>}
        </footer>;
    }
};

export interface AppProps extends React.Props<App> {
    state: app.AppState;
    actions: app.ActionProvider;
}

export class App extends React.Component<AppProps, void> {
    render() {
        let actions = this.props.actions;
        let items = app.memoFilter({route: this.props.state.route.name,
                                    items: this.props.state.items});
        let todos = items.map(item => (
            <TodoItem {...item} actions={actions} key={item.id}/>));
        let completed = this.props.state.items.length-this.props.state.active;
        let toggleDone = this.props.state.active===0;
        return <div>
                <Header text={this.props.state.entry} actions={actions}/>
                <section className="main">
                    <input className="toggle-all" type="checkbox"
                           onClick={e => actions.markAllAs(!toggleDone)}
                           checked={toggleDone}/>
                    <ul className="todo-list">
                        {todos}
                    </ul>
                </section>
                <Footer active={this.props.state.active} actions={actions}
                        total={this.props.state.items.length}
                        route={this.props.state.route.name}/>
        </div>;
    }
}
