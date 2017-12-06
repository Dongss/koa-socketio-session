
export function HandleKoaSession2 (app: any, opt: any) {
    let store = opt.store;
    let key = opt.key || 'koa:sess';
    return async function(socket: any, next: any) {
        if (!socket.handshake.headers.cookie) {
            return next(new Error('no cookie'));
        }
        let ctx = app.createContext(socket.request, socket.response);
        let sid = ctx.cookies.get(key, opt);
        socket.getSession = () => {
            return store.get(sid);
        };
        return next();
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
        socket.getSession = () => {
            return store.get(prefix + sid);
        };
        return next();
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
        socket.getSession = () => {
            return store.get(sid);
        };
        return next();
    };
}