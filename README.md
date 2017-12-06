# koa-socketio-session

[![Build Status](https://travis-ci.org/Dongss/koa-socketio-session.svg?branch=master)](https://travis-ci.org/Dongss/koa-socketio-session)
[![Coverage Status](https://coveralls.io/repos/github/Dongss/koa-socketio-session/badge.svg?branch=master)](https://coveralls.io/github/Dongss/koa-socketio-session?branch=master)
[![Dependency Status](https://dependencyci.com/github/Dongss/koa-socketio-session/badge)](https://dependencyci.com/github/Dongss/koa-socketio-session)


A [socket.io](https://socket.io/docs/) middleware to share session from Koa app.

Get session by a method: `let mySession = await socket.getSession();`

## Require

* Koa2
* Node 7.6 or greater for async/await support

## Supported Koa session middlewares

* [koa-session](https://github.com/koajs/session)
* [koa-generic-session](https://github.com/koajs/generic-session)
* [koa-session2](https://github.com/Secbone/koa-session2)

## Install

`npm install koa-socketio-session --save`

## Usage

### koa-session

[koa-session](https://github.com/koajs/session)

`const koaSocketioSession = require('koa-socketio-session').HandleKoaSession;`

koaSocketioSession(app, opt)

* opt, see [koa-session options](https://github.com/koajs/session#options), `store` is required in opt

[example](https://github.com/Dongss/koa-socketio-session/tree/master/examples/koa-session.example.js)

```
const Koa = require('koa');
const session = require('koa-session');
const koaSocketioSession = require('koa-socketio-session').HandleKoaSession;
const app = new Koa();

// session store
class Store {
    async get(sid) {
        // ...
    }

    async set(sid =  this.getID(24), session, maxAge) {
        // ...
    }

    destroy(sid) {
        // ...
    }
}

app.keys = ['koa2', 'socketio', 'koa-session'];

const sessionOpt = {
    store: new Store(),
    key: '4lKSd^Qma*3',
};
app.use(session(sessionOpt, app));

const server = app.listen(3000, () => {
    console.log('server listen on 3000');
});

const io = require('socket.io')(server, {
    path: '/websocket',
    cookie: true
});

io.use(koaSocketioSession(app, sessionOpt));

io.use(async (socket, next) => {
    let s = await socket.getSession();
    if (!s || !s.logined) {
        return next(new Error('unauthorized'));
    }
    return next();
});

io.on('connection', (socket) => {
    let s = await socket.getSession();
    console.log(s);
    socket.use(async (p, next) => {
        let s = await socket.getSession();
        if (!s || !s.logined) {
            return next(new Error('unauthorized'));
        }
        return next();
    });
});

```

### koa-generic-session

[koa-generic-session](https://github.com/koajs/generic-session)

`const koaSocketioSession = require('koa-socketio-session').HandleKoaGenericSession;`

koaSocketioSession(app, opt)

* opt, see [koa-generic-session options](https://github.com/koajs/generic-session#options), `store` is required in opt

[example](https://github.com/Dongss/koa-socketio-session/tree/master/examples/koa-generic-session.example.js)

```
const Koa = require('koa');
const session = require('koa-generic-session');
// const Store = require('koa-generic-session/lib/memory_store');
const redisStore = require('koa-redis');
const koaSocketioSession = require('koa-socketio-session').HandleKoaGenericSession;

const app = new Koa();

app.keys = ['koa2', 'socketio', 'koa-generic-session'];

const sessionOpt = {
    store: new redisStore(),
    key: '4lKSd^Qma*3',
};

app.use(session(sessionOpt));

const server = app.listen(3000, () => {
    console.log('server listen on 3000');
});

const io = require('socket.io')(server, {
    path: '/websocket',
    cookie: true
});

io.use(koaSocketioSession(app, sessionOpt));

io.use(async (socket, next) => {
    let s = await socket.getSession();
    if (!s || !s.logined) {
        return next(new Error('unauthorized'));
    }
    return next();
});

io.on('connection', (socket) => {
    let s = await socket.getSession();
    console.log(s);
    socket.use(async (p, next) => {
        let s = await socket.getSession();
        if (!s || !s.logined) {
            return next(new Error('unauthorized'));
        }
        return next();
    });
});

```

### koa-session2

[koa-session2](https://github.com/Secbone/koa-session2)

`const koaSocketioSession = require('koa-socketio-session').HandleKoaSession2;`

koaSocketioSession(app, store, key)

* opt, see [koa-session2 options](https://github.com/Secbone/koa-session2#options), `store` is required in opt

[example](https://github.com/Dongss/koa-socketio-session/tree/master/examples/koa-session2.example.js)

```
const Koa = require('koa');
const session = require('koa-session2');
const koaSocketioSession = require('koa-socketio-session').HandleKoaSession2;
const app = new Koa();

// session store
class Store {
    constructor() {
    }

    async get(sid) {
        // ...
    }

    async set(session, { sid =  this.getID(24), maxAge } = {}) {
        // ...
    }

    destroy(sid) {
        // ...
    }
}

app.keys = ['koa2', 'socketio', 'koa-session2'];

const sessionOpt = {
    store: new Store(),
    key: '4lKSd^Qma*3',
};
app.use(session(sessionOpt));

const server = app.listen(3000, () => {
    console.log('server listen on 3000');
});

const io = require('socket.io')(server, {
    path: '/websocket',
    cookie: true
});

io.use(koaSocketioSession(app, sessionOpt));

io.use(async (socket, next) => {
    let s = await socket.getSession();
    if (!s || !s.logined) {
        return next(new Error('unauthorized'));
    }
    return next();
});

io.on('connection', (socket) => {
    let s = await socket.getSession();
    console.log(s);
    socket.use(async (p, next) => {
        let s = await socket.getSession();
        if (!s || !s.logined) {
            return next(new Error('unauthorized'));
        }
        return next();
    });
});
```

## Test

`npm test`