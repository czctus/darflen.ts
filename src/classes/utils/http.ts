import axios, { AxiosResponse } from "axios";
import debug from "debug";

import { debugNamespace } from "../../constants.js";

const log = debug(`${debugNamespace}:http`);

interface DefaultProperties {
    headers: Record<string, string>
    baseURL?: URL
}

interface HTTPResponse<R = unknown> {
    status: number;
    statusText: string;
    headers: Record<string, string>;
    data: R;
    raw: AxiosResponse;
}

export class HTTP {
    private _childrenClients: HTTP[] = [];
    private _defaultProperties: DefaultProperties = {
        headers: {}
    }

    public async request<R = unknown>(params: {
        method: string,
        url: string | URL, // if url is relative, it will be resolved against the baseURL
        headers?: Record<string, string>,
        body?: unknown,
        params?: Record<string, string> // query parameters
    }): Promise<HTTPResponse<R>> {
        const url = new URL(params.url, this._defaultProperties.baseURL);
        const headers = { ...this._defaultProperties.headers, ...params.headers };
        const response = await axios({
            method: params.method,
            url: url.toString(),
            headers,
            data: params.body,
            params: params.params,
            validateStatus: () => true,
        });

        log("%s %s -> %d %s", params.method, url.toString(), response.status, response.statusText);
        
        return {
            status: response.status,
            statusText: response.statusText,
            headers: response.headers as Record<string, string>,
            data: response.data,
            raw: response
        };
    };

    public get<R = unknown>(url: string | URL, headers?: Record<string, string>, params?: Record<string, string>) {
        return this.request<R>({ method: "GET", url, headers, params });
    }
    public post<R = unknown>(url: string | URL, body?: unknown, headers?: Record<string, string>, params?: Record<string, string>) {
        return this.request<R>({ method: "POST", url, headers, body, params });
    }

    /** creates an http instance, which inherits the default properties */
    public inherit() {
        const client = new HTTP(this._defaultProperties);
        log(`created child http client with default properties: %o`, this._defaultProperties);
        this._childrenClients.push(client);
        return client;
    }

    get defaultProperties() { return this._defaultProperties; }
    set defaultProperties(props: DefaultProperties) {
        this._defaultProperties = props;
        log(`props were updated, updating %d child clients`, this._childrenClients.length);
        for (const child of this._childrenClients) {
            child.defaultProperties = {
                headers: { ...this._defaultProperties.headers, ...child.defaultProperties.headers }, // child can override parent headers, but not the other way around
                baseURL: child.defaultProperties.baseURL || this._defaultProperties.baseURL
            };
        }
    }

    constructor(defaults?: DefaultProperties) {
        this._defaultProperties = {
            ...defaults,
            headers: { ...this._defaultProperties.headers, ...defaults?.headers }
        };
    }
}