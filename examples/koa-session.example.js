const Koa = require('koa');
const session = require('koa-session');
const koaSocketioSession = require('../build/index').HandleKoaSession;
const { randomBytes } = require('crypto');

const app = new Koa();

// session store
class Store {
    constructor() {
        this.sessions = new Map();
        this.__timer = new Map();
    }

    getID(length) {
        return randomBytes(length).toString('hex');
    }

    async get(sid) {
        if (!this.sessions.has(sid)) return undefined;
        return JSON.parse(this.sessions.get(sid));
    }

    async set(sid =  this.getID(24), session, maxAge) {
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

    destroy(sid) {
        this.sessions.delete(sid);
        this.__timer.delete(sid);
    }
}

app.keys = ['koa2', 'socketio', 'koa-session'];

const sessionOpt = {
    store: new Store(),
    // key: '4lKSd^Qma*3',
    maxAge: 86400000,
    overwrite: true,
    httpOnly: true,
    signed: true, 
};
app.use(session(sessionOpt, app));

app.use(async (ctx, next) => {
    if (ctx.request.path === '/ajax/set_session') {
        return await next();
    }
    if (!ctx.session || !ctx.session.logined) {
        ctx.status = 401;
        return;
    }
});

app.use(async ctx => {
    switch(ctx.request.path) {
        case '/ajax/set_session':
            ctx.session = ctx.request.query;
            ctx.body = 'welcome';
            break;
        default:
            ctx.status = 404;
            break;
    }
});

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
    console.log('connection');

    socket.on('message', async (m) => {
        console.log('message', m);
        let s = await socket.getSession();
        console.log(s);
    });

    socket.use(async (p, next) => {
        let s = await socket.getSession();
        if (!s || !s.logined) {
            return next(new Error('unauthorized'));
        }
        return next();
    });
});

io.on('error', (error) => {
    console.log('error', error);
});
