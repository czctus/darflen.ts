import { HTTP } from "./classes/utils/http.js";
import { urlPaths } from "./constants.js";
import { APIFailResponse, APIResponse } from "./types/api/request.js";

const userAgent = "darflen.ts";

export const httpclient = new HTTP({
    headers: {
        "User-Agent": userAgent
    },
    baseURL: new URL(`https://${urlPaths.root}`)
});

export function isErrorResponse<T, U>(response: APIResponse<T, U>): response is APIFailResponse<U> {
    return 'status' in response;
}