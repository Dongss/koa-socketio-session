const Koa = require('koa');
const session = require('koa-generic-session');
const Store = require('koa-generic-session/lib/memory_store');
const redisStore = require('koa-redis');
const koaSocketioSession = require('../build/index').HandleKoaGenericSession;
const { randomBytes } = require('crypto');

const app = new Koa();

app.keys = ['koa2', 'socketio', 'koa-generic-session'];

const sessionOpt = {
    store: new Store(),
    key: '4lKSd^Qma*3',
};

app.use(session(sessionOpt));

app.use(async (ctx, next) => {
    if (ctx.request.path === '/ajax/set_session') {
        return await next();
    }
    if (!ctx.session || !ctx.session.logined) {
        ctx.status = 401;
        return;
    }
    await next();
});

app.use(async ctx => {
    switch(ctx.request.path) {
        case '/ajax/set_session':
            ctx.session.userName = ctx.request.query.userName;
            ctx.session.logined = ctx.request.query.logined;
            ctx.body = 'welcome';
            break;
        case '/ajax/get_session':
            let s = ctx.session;
            console.log('xhr get', s);
            ctx.body = JSON.stringify(s);
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

io.use((socket, next) => {
    let s = socket.session;
    if (!s || !s.logined) {
        return next(new Error('unauthorized'));
    }
    return next();
});

io.on('connection', (socket) => {
    console.log('connection:', socket.session);

    socket.on('message', (m) => {
        console.log('message', m);
    });

    socket.on('get', () => {
       console.log('get:', socket.session);
    });

    socket.on('set', () => {
        console.log('before set:', socket.session);
        socket.session = {name: 2222, logined: true};
        console.log('after set:', socket.session);
    });

    socket.use((p, next) => {
        let s = socket.session;
        if (!s || !s.logined) {
            return next(new Error('unauthorized'));
        }
        return next();
    });
});

io.on('error', (error) => {
    console.log('error', error);
});