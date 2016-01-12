import redux = require('redux');

// Routing related types and actions
import { RouteId, RouteState, setRoute } from 'vada';
// Operation related types
import { DefOp, Operation, OpReducer } from 'vada';
// Reducer related functions
import { combineReducers, wrapReducer } from 'vada';

/*
   == Routes ==
*/
export const allRoute = new RouteId<{}>("all");
export const activeRoute = new RouteId<{}>("active");
export const completedRoute = new RouteId<{}>("completed");

/*
   == Types ==
*/
export interface TodoItem {
    id: number;
    completed: boolean;
    text: string;
}

export interface AppState {
    next: number;
    entry: string;
    route: RouteState;
    items: TodoItem[];
    count: number;
}

export const initialState: AppState = {
    next: 0,
    entry: "",
    route: allRoute.apply({}),
    items: [],
    count: 0,
}

export function clone(s: AppState): AppState {
    return {
        next: s.next,
        entry: s.entry,
        route: s.route,
        items: s.items,
        count: s.count,
    }
}

/*
   == Operations ==
*/
export const entryText = DefOp("entry", (s: AppState, p: string) => {
    let ret = clone(s);
    ret.entry = p;
    return ret;
});

export const createNew = DefOp("new", (s: AppState, p: void) => {
    return {
        next: s.next+1,
        entry: "",
        route: s.route,
        items: [{
            id: s.next,
            completed: false,
            text: s.entry.trim(),
        }, ...s.items],
        count: s.count,
    };
});

export const deleteItem = DefOp("delete", (s: AppState, p: number) => {
    let ret = clone(s);
    ret.items = [];
    s.items.forEach(i => {
        if (i.id!==p) {
            ret.items.push(i);
        }
    });
    return ret;
});

export const markAs = DefOp("mark", (s: TodoItem, p: {id: number, as: boolean}) => {
    if (p.id!==s.id) return s;
    return {
        id: s.id,
        completed: p.as,
        text: s.text,
    };
});

export const markAllAs = DefOp("markall", (s: TodoItem, p: boolean) => {
    return {
        id: s.id,
        completed: p,
        text: s.text,
    };
});

export const toggleCompleted = DefOp("toggle", (s: TodoItem, p: number) => {
    if (p!==s.id) return s;
    return {
        id: s.id,
        completed: !s.completed,
        text: s.text,
    };
});

// Reducers for nested state components
const todoReducer = OpReducer({ id: null, completed: false, text: ""},
                              [markAs, markAllAs, toggleCompleted]);

const routeReducer = OpReducer(allRoute.apply({}), [setRoute]);

// This reducer applies route and item reducers
const reducer1: redux.Reducer<AppState> = (s = initialState, a) => {
    return {
        next: s.next,
        entry: s.entry,
        route: routeReducer(s.route, a),
        items: s.items.map((i: TodoItem) => todoReducer(i, a)),
        count: s.count,
    }
};

const counter = (cur: AppState, prev: AppState) => {
    if (!cur || !prev) return cur;
    if (cur.items===prev.items && cur.route===prev.route) return cur;
    let ret = clone(cur);
    ret.count = 0;
    cur.items.forEach(i => {
        if (cur.route.name===allRoute.id ||
            (cur.route.name===activeRoute.id && !i.completed) ||
            (cur.route.name===completedRoute.id && i.completed)) {
            ret.count++;
        }
    });
    return ret;
};

// This reducer applies item level mutations
const reducer2 = OpReducer(initialState,
                           [entryText, createNew, deleteItem]);

export const reducer = wrapReducer(combineReducers(reducer1, reducer2), [counter]);
