/** the base interface for all api responses. all endpoints have these values */
export interface APIBaseResponse<T> {
    /** the status of the api response. 
     * @see Status */
    code: T;
}

/** a successful api response */
export type APISuccessResponse<T> = APIBaseResponse<string> & T

/** a failed api response */
export type APIFailResponse<T = object> = APIBaseResponse<string> & {
    /** the error message returned by the api */
    message: string;
    /** http status code */
    status: number;
} & T

/** either a successful or failed api response */
export type APIResponse<T, U = unknown> = APISuccessResponse<T> | APIFailResponse<U>;