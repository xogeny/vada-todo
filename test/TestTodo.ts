import mocha = require("mocha");

import { expect } from 'chai';

import { reducer } from '../src/app';

describe("TodoMVC application flow", () => {
    describe("Initialization", () => {
        it("should compute the correct initial state", () => {
            let s = reducer(undefined, undefined);

            expect(s.next).to.be.equal(0);
            expect(s.count).to.be.equal(0);
            expect(s.items).to.deep.equal([]);
        });
    });
});
