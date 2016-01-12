import mocha = require("mocha");

import { expect } from 'chai';

import { setRoute } from 'vada';
import { allRoute, activeRoute, completedRoute } from '../src/app';
import { reducer, AppState } from '../src/app';
import { entryText, createNew, deleteItem } from '../src/app';
import { toggleCompleted, markAs, markAllAs, editItem } from '../src/app';

function addItems(s: AppState, ...desc: string[]): AppState {
    desc.forEach((d: string) => {
        s = reducer(reducer(s, entryText.request(d)), createNew.request(null));
    });
    return s;
}

describe("TodoMVC application flow", () => {
    let s0 = reducer(undefined, undefined);
    describe("Initialization", () => {
        it("should compute the correct initial state", () => {
            expect(s0.route).to.deep.equal({
                name: "all",
                params: {},
            });
            expect(s0.next).to.be.equal(0);
            expect(s0.count).to.be.equal(0);
            expect(s0.items).to.deep.equal([]);
        });
    });
    describe("Creating and deleting items", () => {
        it("should create a new item with id 0", () => {
            let desc = "Test TodoMVC"
            let s1 = reducer(s0, entryText.request(desc));
            expect(s1.entry).to.equal(desc);
            
            let s2 = reducer(s1, createNew.request(null));
            expect(s2.entry).to.equal("");
            expect(s2.next).to.be.equal(1);
            expect(s2.items.length).to.be.equal(1);
            expect(s2.items[0]).to.deep.equal({
                id: 0,
                completed: false,
                text: desc,
            });
        });
        it("should trim white space", () => {
            let desc = "  Test TodoMVC  ";
            let trimmed = "Test TodoMVC";
            let s1 = reducer(s0, entryText.request(desc));
            let s2 = reducer(s1, createNew.request(null));
            expect(s2.items[0]).to.deep.equal({
                id: 0,
                completed: false,
                text: trimmed,
            });
        });
        it("should delete items", () => {
            let s = addItems(s0, "Item1", "Item2", "Item3");
            let sf = reducer(s, deleteItem.request(1));
            expect(sf.items).to.deep.equal([
                { id: 2, completed: false, text: "Item3" },
                { id: 0, completed: false, text: "Item1" },
            ]);
        });
    });
    describe("Edit items", () => {
        it("edit item text", () => {
            let s = addItems(s0, "Item1", "Item2", "Item3");
            expect(s.items[1].text).to.be.equal("Item2");
            let sc = reducer(s, editItem.request({id: 1, t: "Item 7"}));
            expect(sc.items[1].text).to.be.equal("Item 7");
        });

        it("should toggle the first item twice", () => {
            let s = addItems(s0, "Item1", "Item2", "Item3");
            expect(s.items[1].completed).to.be.equal(false);
            let sc = reducer(s, toggleCompleted.request(1));
            expect(sc.items[1].completed).to.be.equal(true);
            let si = reducer(sc, toggleCompleted.request(1));
            expect(si.items[1].completed).to.be.equal(false);
        });
        
        it("should mark multiple items", () => {
            let s = addItems(s0, "Item1", "Item2", "Item3");
            expect(s.items[0].completed).to.be.equal(false);
            expect(s.items[1].completed).to.be.equal(false);
            expect(s.items[2].completed).to.be.equal(false);
            expect(s.count).to.be.equal(3);
            
            let s1 = reducer(s, markAs.request({id: 1, as: true}));
            expect(s1.items[0].completed).to.be.equal(false);
            expect(s1.items[1].completed).to.be.equal(true);
            expect(s1.items[2].completed).to.be.equal(false);

            let s2 = reducer(s1, markAs.request({id: 0, as: true}));
            expect(s2.items[0].completed).to.be.equal(false);
            expect(s2.items[1].completed).to.be.equal(true);
            expect(s2.items[2].completed).to.be.equal(true);

            let s3 = reducer(s2, markAs.request({id: 1, as: false}));
            expect(s3.items[0].completed).to.be.equal(false);
            expect(s3.items[1].completed).to.be.equal(false);
            expect(s3.items[2].completed).to.be.equal(true);

            let s4 = reducer(s3, markAs.request({id: 2, as: true}));
            expect(s4.items[0].completed).to.be.equal(true);
            expect(s4.items[1].completed).to.be.equal(false);
            expect(s4.items[2].completed).to.be.equal(true);
        });

        it("should mark all items", () => {
            let s = addItems(s0, "Item1", "Item2", "Item3");
            expect(s.items[0].completed).to.be.equal(false);
            expect(s.items[1].completed).to.be.equal(false);
            expect(s.items[2].completed).to.be.equal(false);

            let s1 = reducer(s, markAllAs.request(true));
            expect(s1.items[0].completed).to.be.equal(true);
            expect(s1.items[1].completed).to.be.equal(true);
            expect(s1.items[2].completed).to.be.equal(true);
        });
    });
    describe("Change routes", () => {
        it("should count all items", () => {
            let s = addItems(s0, "Item1", "Item2", "Item3");
            let s1 = reducer(s, markAs.request({id: 0, as: true}));
            let s2 = reducer(s1, setRoute.request(allRoute.apply(null)));
            expect(s2.count).to.be.equal(3);
        });

        it("should count active items", () => {
            let s = addItems(s0, "Item1", "Item2", "Item3");
            let s1 = reducer(s, markAs.request({id: 0, as: true}));
            expect(s1.count).to.be.equal(3);
            let s2 = reducer(s1, setRoute.request(activeRoute.apply(null)));
            expect(s2.count).to.be.equal(2);
            let s3 = reducer(s, setRoute.request(allRoute.apply(null)));
            expect(s3.count).to.be.equal(3);
        });

        it("should count active items", () => {
            let s = addItems(s0, "Item1", "Item2", "Item3");
            let s1 = reducer(s, markAs.request({id: 0, as: true}));
            let s2 = reducer(s1, setRoute.request(completedRoute.apply(null)));
            expect(s2.count).to.be.equal(1);
            let s3 = reducer(s2, setRoute.request(allRoute.apply(null)));
            expect(s3.count).to.be.equal(3);
        });
    });
});
