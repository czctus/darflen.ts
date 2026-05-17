import { HTTP } from "./utils/http.js";
import { darflenRoot } from "./constants.js";
import { version } from "./version.js"; // this will not be found unless you ran `npm run build` at least once! this is intentional.

import type { APIFailResponse, APIResponse } from "./types/api/request.js";

const isBrowser = typeof window !== "undefined" || (typeof process === "undefined" || !process.version);

export function BuildUserAgent(config?: { projectName?: string, projectVersion?: string }): string | undefined {
    if (isBrowser) return undefined;

    const parent = `${config?.projectName ?? "unknown"}/${config?.projectVersion ?? "0.0.0"}`;
    const library = `darflen/${version}`;
    const node = `Node/${process.version.replace("v", "")}`;
    const url = `(+https://github.com/czctus/darflen.ts)`;

    return `${parent} ${library} ${node} ${url}`;
}

const userAgent = BuildUserAgent();

export const httpclient = new HTTP({
    headers: userAgent ? { "User-Agent": userAgent } : {},
    baseURL: new URL(`https://${darflenRoot}`)
});

export function isErrorResponse<T, U>(response: APIResponse<T, U>): response is APIFailResponse<U> {
    return 'status' in response;
}

export function DarflenURL(baseUrl: string, path: string): URL
export function DarflenURL(path: string): URL
export function DarflenURL(pathOrBase: string, path?: string): URL {
    const base = path ? pathOrBase : `https://${darflenRoot}`;
    const p = path ? path : pathOrBase;
    return new URL(p, base);
}