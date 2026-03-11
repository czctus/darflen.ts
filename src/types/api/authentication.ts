import { APIResponse } from "./request.js";

export type APILoginResponse = APIResponse<APILoginResponseData>;
export interface APILoginResponseData {
    token: string;
    id: string;
    username: string;
}