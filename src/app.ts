// Routing related types
import { RouteId, RouteState } from 'vada';
// Operation related types
import { DefOp, Operation, OpReducer } from 'vada';

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
    route: allRoute.apply(null),
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

export const markCompleted = DefOp("mark", (s: TodoItem, p: number) => {
    if (p!==s.id) return s;
    return {
        id: s.id,
        completed: true,
        text: s.text,
    };
});

export const toggleCompleted = DefOp("toggle", (s: TodoItem, p: number) => {
    return {
        id: s.id,
        completed: !s.completed,
        text: s.text,
    };
});

export const reducer = OpReducer(initialState, [createNew]);
