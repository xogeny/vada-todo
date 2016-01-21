import redux = require('redux');

// Routing related types and actions
import { RouteId, RouteState, setRoute, clone, overlay, overlayIf } from 'vada';
// Operation related types
import { DefOp, Operation, createOpReducer } from 'vada';
// Reducer related functions
import { combineReducers, wrapReducer } from 'vada';
// Memoization
import { multiMemo, Builder } from 'vada';

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
    active: number;
}

export const initialState: AppState = {
    next: 0,
    entry: "",
    route: allRoute.apply({}),
    items: [],
    active: 0,
}

/*
   == Operations ==
*/
export const entryText = DefOp("entry", (s: AppState, p: string) => {
    return overlay(s, s => s.entry = p);
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
        active: s.active,
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

export const clearCompleted = DefOp("clear", (s: AppState, p: void) => {
    let ret = clone(s);
    ret.items = [];
    s.items.forEach(i => {
        if (!i.completed) {
            ret.items.push(i);
        }
    });
    return ret;
});

export const editItem = DefOp("edit", (s: TodoItem, p: {id: number, t: string}) => {
    return overlayIf(s, p.id===s.id, s => s.text = p.t);
});

export const markAs = DefOp("mark", (s: TodoItem, p: {id: number, as: boolean}) => {
    return overlayIf(s, p.id===s.id, s => s.completed = p.as);
});

export const markAllAs = DefOp("markall", (s: TodoItem, p: boolean) => {
    return overlay(s, s => s.completed = p);
});

export const toggleCompleted = DefOp("toggle", (s: TodoItem, p: number) => {
    return overlayIf(s, p===s.id, s => s.completed = !s.completed);
});

/*
   == Reactors ==
*/
const countActive = (prev: AppState, cur: AppState) => {
    if (!cur || !prev) return cur;
    if (cur.items===prev.items) return cur;
    let ret = clone(cur);
    ret.active = 0;
    cur.items.forEach(i => {
        if (!i.completed) {
            ret.active++;
        }
    });
    return ret;
};

/*
   == Filters ==
*/
export function filter(route: string, items: TodoItem[]): TodoItem[] {
    let ret: TodoItem[] = [];
    items.forEach(i => {
        if (route==allRoute.id ||
            (route==activeRoute.id==!i.completed) ||
            (route==completedRoute.id==i.completed)) {
            ret.push(i);
        }
    });
    return ret;
}

export const memoFilter =
    multiMemo((s: {route: string, items: TodoItem[]}) => filter(s.route, s.items));

/*
   == Reducers ==
*/
let r = new Builder<AppState>(
    // Global actions
    [entryText, createNew, deleteItem, clearCompleted], initialState)
    // Actions to apply to items
    .overlayOps((s, r, a) => { s.items = s.items.map((i: TodoItem) => r(i, a)); },
             [editItem, markAs, markAllAs, toggleCompleted])
    // Actions to apply to the route
    .overlayOps((s, r, a) => { s.route = r(s.route, a) }, [setRoute])
    // Perform count
    .reactTo(countActive);

export const reducer = r.reducer();
