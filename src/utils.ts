import redux = require('redux');
import { AppState, entryText, createNew, markAs } from './app';

export const ENTER_KEY = 13;

export function addSampleItems(store: redux.Store<AppState>) {
    store.dispatch(entryText.request("Test Application Logic"));
    store.dispatch(createNew.request(null));
    store.dispatch(entryText.request("Test View Rendering"));
    store.dispatch(createNew.request(null));
    store.dispatch(entryText.request("Test UI Actions"));
    store.dispatch(createNew.request(null));
    store.dispatch(entryText.request("Write Documentation"));
    store.dispatch(markAs.request({id: 1, as: true}));
}
