import test from 'ava';
import * as assert from 'assert';
import * as sinon from 'sinon';
const Koa = require('koa');
const KoaSession2 = require('koa-session2');
const { randomBytes } = require('crypto');
import {HandleKoaSession2, HandleKoaGenericSession, HandleKoaSession} from '../src/index';

const KoaCtx: any = {
    cookies: {
        get: (key: string) => {
            return '1234';
        }
    }
};

const KoaApp: any = {
    use: (...args: any[]) => {},
    keys: [],
    createContext: (req: any, res: any) => {
        return KoaCtx;
    }
};

test.beforeEach(t => {
});

test('test koa-session2', async t => {
    // session store for koa-session2
    class Store {
        sessions: any;
        __timer: any;
        constructor() {
            this.sessions = new Map();
            this.__timer = new Map();
        }

        getID(length: number) {
            return randomBytes(length).toString('hex');
        }

        async get(sid: string) {
            if (!this.sessions.has(sid)) return undefined;
            return JSON.parse(this.sessions.get(sid));
        }

        async set(session: any, { sid =  this.getID(24), maxAge = 86400000 } = {}) {
            if (this.sessions.has(sid) && this.__timer.has(sid)) {
                const __timeout = this.__timer.get(sid);
                if (__timeout) clearTimeout(__timeout);
            }

            if (maxAge) {
                this.__timer.set(sid, setTimeout(() => this.destroy(sid), maxAge));
            }
            try {
                this.sessions.set(sid, JSON.stringify(session));
            } catch (err) {
                console.log('Set session error:', err);
            }
            return sid;
        }

        destroy(sid: string) {
            this.sessions.delete(sid);
            this.__timer.delete(sid);
        }
    }
    KoaApp.keys = ['koa2', 'socketio', 'koa-session2'];
    const sessionOpt = {
        store: new Store(),
        key: '4lKSd^Qma*3'
    };
    KoaApp.use(KoaSession2(sessionOpt));
    let spy1 = sinon.spy(KoaCtx.cookies, 'get');
    let spy2 = sinon.spy(sessionOpt.store, 'get');
    const ioMiddleware = HandleKoaSession2(KoaApp, sessionOpt);
    let socket: any = {
        request: {},
        reponse: {},
        handshake: {
            headers: {
                cookie: 'true=U3m-ZiUIGqU0JcLEAAAF; 4lKSd^Qma*3=twsVN6rKPz5CJhra9pOn8nczyFww_SN5; 4lKSd^Qma*3.sig=Lnv3NfZtqXArCKbqEM0oucyuMe0; koa:sess=0N1Gwg6wHCmm8bjomEm-PQorSGrFaDQN; koa:sess.sig=DyP5wWdGPFKrHeSWzBoo8UcO4n8',
            }
        }
    };
    await sessionOpt.store.set({name: 123}, {sid: '1234'});
    let md = ioMiddleware(socket, () => {});
    assert(spy1.withArgs('4lKSd^Qma*3').calledOnce);
    assert(spy1.withArgs('4lKSd^Qma*3').returned('1234'));
    spy1.restore();
    let s = socket.session;
    assert(spy2.withArgs('1234').calledOnce);
    spy2.restore();

    let next = sinon.spy();
    let socket2 = { handshake: {
        headers: {}
    } };
    let md2 = ioMiddleware(socket2, next);
    assert(next.calledOnce);
    t.is('no cookie', next.getCall(0).args[0].message, 'should throw no cookie');
    next.reset();
    t.pass();
});

test('test koa-generic-sessin', async t => {
    const Store = require('koa-generic-session/lib/memory_store');
    KoaApp.keys = ['koa2', 'socketio', 'koa-generic-session'];
    const sessionOpt = {
        store: new Store(),
        key: 'hj23.a#ja0'
    };
    KoaApp.use(KoaSession2(sessionOpt));
    let spy1 = sinon.spy(KoaCtx.cookies, 'get');
    let spy2 = sinon.spy(sessionOpt.store, 'get');
    const ioMiddleware = HandleKoaGenericSession(KoaApp, sessionOpt);
    let socket: any = {
        request: {},
        reponse: {},
        handshake: {
            headers: {
                cookie: 'true=U3m-ZiUIGqU0JcLEAAAF; 4lKSd^Qma*3=twsVN6rKPz5CJhra9pOn8nczyFww_SN5; 4lKSd^Qma*3.sig=Lnv3NfZtqXArCKbqEM0oucyuMe0; koa:sess=0N1Gwg6wHCmm8bjomEm-PQorSGrFaDQN; koa:sess.sig=DyP5wWdGPFKrHeSWzBoo8UcO4n8',
            }
        }
    };
    let md = ioMiddleware(socket, () => {});
    assert(spy1.withArgs('hj23.a#ja0').calledOnce);
    assert(spy1.withArgs('hj23.a#ja0').returned('1234'));
    spy1.restore();
    let s = await socket.session;
    assert(spy2.withArgs('koa:sess:1234').calledOnce);
    spy2.restore();

    let next = sinon.spy();
    let socket2 = { handshake: {
        headers: {}
    } };
    let md2 = ioMiddleware(socket2, next);
    assert(next.calledOnce);
    t.is('no cookie', next.getCall(0).args[0].message, 'should throw no cookie');
    next.reset();
    t.pass();
});

test('test koa-session', async t => {
    // session store
    class Store {
        sessions: any;
        __timer: any;
        constructor() {
            this.sessions = new Map();
            this.__timer = new Map();
        }

        getID(length: number) {
            return randomBytes(length).toString('hex');
        }

        async get(sid: string) {
            if (!this.sessions.has(sid)) return undefined;
            // We are decoding data coming from our Store, so, we assume it was sanitized before storing
            return JSON.parse(this.sessions.get(sid));
        }

        async set(sid =  this.getID(24), session: any, maxAge: number) {
            // Just a demo how to use maxAge and some cleanup
            if (this.sessions.has(sid) && this.__timer.has(sid)) {
                const __timeout = this.__timer.get(sid);
                if (__timeout) clearTimeout(__timeout);
            }

            if (maxAge) {
                this.__timer.set(sid, setTimeout(() => this.destroy(sid), maxAge));
            }
            try {
                this.sessions.set(sid, JSON.stringify(session));
            } catch (err) {
                console.log('Set session error:', err);
            }

            return sid;
        }

        destroy(sid: string) {
            this.sessions.delete(sid);
            this.__timer.delete(sid);
        }
    }
    KoaApp.keys = ['koa2', 'socketio', 'koa-session'];
    const sessionOpt = {
        store: new Store(),
        key: '9,fn4&m4la'
    };
    KoaApp.use(KoaSession2(sessionOpt));
    let spy1 = sinon.spy(KoaCtx.cookies, 'get');
    let spy2 = sinon.spy(sessionOpt.store, 'get');
    const ioMiddleware = HandleKoaSession(KoaApp, sessionOpt);
    let socket: any = {
        request: {},
        reponse: {},
        handshake: {
            headers: {
                cookie: 'true=U3m-ZiUIGqU0JcLEAAAF; 4lKSd^Qma*3=twsVN6rKPz5CJhra9pOn8nczyFww_SN5; 4lKSd^Qma*3.sig=Lnv3NfZtqXArCKbqEM0oucyuMe0; koa:sess=0N1Gwg6wHCmm8bjomEm-PQorSGrFaDQN; koa:sess.sig=DyP5wWdGPFKrHeSWzBoo8UcO4n8',
            }
        }
    };
    let md = ioMiddleware(socket, () => {});
    assert(spy1.withArgs('9,fn4&m4la').calledOnce);
    assert(spy1.withArgs('9,fn4&m4la').returned('1234'));
    spy1.restore();
    let s = await socket.session;
    assert(spy2.withArgs('1234').calledOnce);
    spy2.restore();

    let next = sinon.spy();
    let socket2 = { handshake: {
        headers: {}
    } };
    let md2 = ioMiddleware(socket2, next);
    assert(next.calledOnce);
    t.is('no cookie', next.getCall(0).args[0].message, 'should throw no cookie');
    next.reset();
    t.pass();
});