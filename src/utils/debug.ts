import { debugNamespace } from "../constants.js";

const isBrowser = typeof window !== "undefined" || (typeof process === "undefined" || !process.version);

const debugLit = "debug";
const debug = isBrowser ? null : await import(debugLit).then((m) => m.default).catch(() => null); // we do this because i don't want webworkers/browsers to bundle it..

const create = (namespace: string) => {
    if (isBrowser || !debug) return () => { };

    return (...args: unknown[]) => {
        const debugFn = debug(`${debugNamespace}:${namespace}`);
        debugFn(...(args as Parameters<typeof debugFn>));
    };
};

export const debugLoggers = {
    client: create("client"),
    http: create("http"),
    posts: create("posts"),
    profiles: create("profiles"),
    authentication: create("authentication"),
};