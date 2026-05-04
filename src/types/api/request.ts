/** the base interface for all api responses. all endpoints have these values */
export interface APIBaseResponse {
    /** the status of the api response. 
     * @see Status */
    code: string;
}

/** a successful api response */
export type APISuccessResponse<T> = APIBaseResponse & T

/** a failed api response */
export type APIFailResponse<T = object> = APIBaseResponse & {
    /** the error message returned by the api */
    message: string;
    /** http status code */
    status: number;
} & T

export type AggregatedResponse<K extends string> = {
    [P in K]: { status: string; message: string };    
}

/** either a successful or failed api response */
export type APIResponse<T, U = unknown> = APISuccessResponse<T> | APIFailResponse<U>;