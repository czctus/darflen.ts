import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

import { DarflenError } from "./error.js";
import { Code } from "../enums.js";
import { debugLoggers } from "./debug.js";

const log = debugLoggers.http;

interface DefaultProperties {
    headers: Record<string, string>
    baseURL?: URL
}

interface HTTPResponse<R = unknown> {
    error?: unknown;
    status: number;
    statusText: string;
    headers: Record<string, string>;
    data: R;
    raw: AxiosResponse;
}

interface HTTPRequestParams {
    method: string,
    url: string | URL,
    headers?: Record<string, string>,
    body?: unknown,
    params?: Record<string, string>,
    axiosConfig?: Omit<AxiosRequestConfig, "method" | "url" | "headers" | "data" | "params">,
}

export class HTTP {
    private _childrenClients: HTTP[] = [];
    private _defaultProperties: DefaultProperties = {
        headers: {}
    }

    private isErrorShape(value: unknown): value is { message: string } {
        return (
            typeof value === "object" &&
            value !== null &&
            typeof (value as any).message === "string"
        );
    }

    private isDetailedErrorShape(
        value: unknown
    ): value is { message: string; status: number } {
        return (
            typeof value === "object" &&
            value !== null &&
            typeof (value as any).message === "string" &&
            typeof (value as any).status === "number" &&
            (value as any).status !== Code.Success
        );
    }

    private getErrorFromResponse(response: AxiosResponse): DarflenError | Error | AggregateError {
        const { data, status, headers } = response;

        if (!data || typeof data !== "object") {
            const type = headers["Content-Type"] ?? typeof data;
            return new Error(`unexpected ${type} response: ${data}`);
        }

        if (this.isErrorShape(data)) {
            return new DarflenError(data.message, status);
        }

        const errors = Object.values(data)
            .filter(this.isDetailedErrorShape)
            .map(e => new DarflenError(e.message, e.status));

        if (errors.length > 0) {
            return new AggregateError(
                errors,
                `Multiple errors occurred: ${errors.map(e => e.message).join(", ")}`
            );
        }

        return new Error(`unexpected error response: ${JSON.stringify(data)}`);
    }

    public async request<R = unknown>(params: HTTPRequestParams, throwOnError = true, moreLogging = false): Promise<HTTPResponse<R>> {
        const url = new URL(params.url, this._defaultProperties.baseURL);

        const headers = { ...this._defaultProperties.headers, ...params.headers };
        const response = await axios({
            method: params.method,
            url: url.toString(),
            headers,
            data: params.body,
            params: params.params,
            validateStatus: () => true,
            ...params.axiosConfig
        });

        const iserror =
            (response.status >= 400 && response.status < 600)
            || response.status === 0
            || (
                response.data &&
                typeof response.data === "object" &&
                "code" in response.data &&
                (response.data as any).code !== Code.Success
            );

        const error = iserror ? this.getErrorFromResponse(response) : undefined;

        log(`%s %s. authenticated? %s -> %s`,
            params.method,
            url.toString(),
            this._defaultProperties.headers["authorization"] ? "yes" : "no",
            response.statusText,
        );

        if (moreLogging) log(`response: '%o', body: '%o'`, response.data, params.body);
        if (error) log(`got error response: %o`, { status: response.status, data: response.data });
        if (throwOnError && error) throw error;

        return {
            error,
            status: response.status,
            statusText: response.statusText,
            headers: response.headers as Record<string, string>,
            data: response.data,
            raw: response
        };
    }

    public get<R = unknown>(url: string | URL, headers?: Record<string, string>, params?: Record<string, string>) {
        return this.request<R>({ method: "GET", url, headers, params }, true, true);
    }

    public post<R = unknown>(url: string | URL, body?: unknown, headers?: Record<string, string>, params?: Record<string, string>) {
        return this.request<R>({ method: "POST", url, headers, body, params }, true, true);
    }

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
                headers: { ...this._defaultProperties.headers, ...child.defaultProperties.headers },
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