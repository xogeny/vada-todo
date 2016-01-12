import React = require('react');
import ReactDOM = require('react-dom');

//import { } from 'vada-react';
//import { } from 'vada-browser';

export class App extends React.Component<{}, void> {
    render() {
        return <span>Hello</span>;
    }
}

export function render(elem: Element) {
    ReactDOM.render(<App/>, elem);
}
