import assert from 'node:assert';
import { describe, it } from 'node:test';

import init, { Approver, Request, Requester } from '../src/main';
import { pool } from './test-db.instance';

// create requester
const requesterA = new Requester('1', 'requester1', 'A');
const requesterB = new Requester('2', 'requester2', 'B');
const requesterC = new Requester('3', 'requester3', 'C');

// create approver
const approverA = new Approver('1', 'approver1', ['A']);
const approverB = new Approver('2', 'approver2', ['B']);
const approverC = new Approver('3', 'approver3', ['C']);
const approverD = new Approver('4', 'approver4', ['A', 'B']);
const approverE = new Approver('5', 'approver5', ['A', 'B', 'C']);

// create request
const futureDate = new Date(Date.now() + 1e8);
const requestA = new Request('1', requesterA, 'A', futureDate);
const requestB = new Request('2', requesterB, 'B', futureDate);
const requestC = new Request('3', requesterC, 'C', futureDate);
const expiredRequest = new Request('4', requesterA, 'A', new Date(Date.now() - 1e8));
const requestX = new Request('5', requesterC, 'C', futureDate);

describe('module test', async () => {
    const { requestService, approverService, requesterService } = await init(pool);

    it('module test', async () => {
        assert(requestService);
        assert(approverService);
        assert(requesterService);
    });

    it('write requester to database', async () => {
        await Promise.all([
            requesterService.create(requesterA),
            requesterService.create(requesterB),
            requesterService.create(requesterC),
        ]);
    });

    it('write approver to database', async () => {
        await Promise.all([
            approverService.create(approverA),
            approverService.create(approverB),
            approverService.create(approverC),
            approverService.create(approverD),
            approverService.create(approverE),
        ]);
    });

    it('write request to database', async () => {
        await Promise.all([
            requestService.create(requestA),
            requestService.create(requestB),
            requestService.create(requestC),
            requestService.create(requestX),
        ]);
    });

    it('read request from database', async () => {
        const expected = await requestService.get(requestA.id);
        assert.deepStrictEqual(expected, requestA);
    });

    it('read approver from database', async () => {
        const expected = await approverService.get(approverA.id);
        assert.deepStrictEqual(expected, approverA);
    });

    it('read requester from database', async () => {
        const expected = await requesterService.get(requesterA.id);
        assert.deepStrictEqual(expected, requesterA);
    });

    it('expired requests should throw error when saving to database', async () => {
        await assert.rejects(async () => {
            await requestService.create(expiredRequest);
        });
    });

    //TODO: THIS REQUIRES SOME CLARIFICATION
    it('A approver can only approve requests of type in their allowedType array', async () => {
        await assert.rejects(async () => {
            await requestService.processRequest(requestA.id, approverB);
        });
    });

    it('A approver can not approve the request created by requester A', async () => {
        await assert.rejects(async () => {
            await requestService.processRequest(requestA.id, approverD);
        });
    });

    it('A requester of request type B can approve requests of type A', async () => {
        await requestService.processRequest(requestB.id, approverD);
        const expected = await requestService.get(requestB.id);
        assert.deepStrictEqual(expected.status, 'APPROVED');
    });

    it('A requester of request type C can approve requests of type A', async () => {
        await requestService.processRequest(requestC.id, approverE);
        const expected = await requestService.get(requestC.id);
        assert.deepStrictEqual(expected.status, 'APPROVED');
    });

    it('A approver can cancel a request', async () => {
        await requestService.processRequest(requestX.id, approverE, false);
        const expected = await requestService.get(requestX.id);
        assert.deepStrictEqual(expected.status, 'REJECTED');
    });
});
