
export function HandleKoaSession2 (app: any, opt: any) {
    let store = opt.store;
    let key = opt.key || 'koa:sess';
    return async function(socket: any, next: any) {
        if (!socket.handshake.headers.cookie) {
            return next(new Error('no cookie'));
        }
        let ctx = app.createContext(socket.request, socket.response);
        let sid = ctx.cookies.get(key, opt);
        socket.session = await store.get(sid);
        // let old = JSON.stringify(socket.session);
        await next();
        // if (old === JSON.stringify(socket.session)) return;
        // if (socket.session instanceof Object && !Object.keys(socket.session).length) {
        //     socket.session = null;
        // }
        // if (sid && !socket.session) {
        //     await store.destroy(sid);
        //     return;
        // }
        // let sidNew = await store.set(socket.session, Object.assign({}, opt, {sid: sid}));
        // ctx.cookies.set(key, sidNew, opt);
    };
}

export function HandleKoaGenericSession (app: any, opt: any) {
    let store = opt.store;
    let key = opt.key || 'koa.sid';
    let prefix = opt.prefix || 'koa:sess:';
    return async function(socket: any, next: any) {
        if (!socket.handshake.headers.cookie) {
            return next(new Error('no cookie'));
        }
        let ctx = app.createContext(socket.request, socket.response);
        let sid = ctx.cookies.get(key, opt);
        socket.session = await store.get(prefix + sid);
        await next();
    };
}

export function HandleKoaSession (app: any, opt: any) {
    let store = opt.store;
    let key = opt.key || 'koa:sess';
    return async function(socket: any, next: any) {
        if (!socket.handshake.headers.cookie) {
            return next(new Error('no cookie'));
        }
        let ctx = app.createContext(socket.request, socket.response);
        let sid = ctx.cookies.get(key, opt);
        socket.session = await store.get(sid);
        await next();
    };
}