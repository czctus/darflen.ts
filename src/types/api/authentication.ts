import { AggregatedResponse, APIResponse } from "./request.js";

export type APILoginResponse = APIResponse<APILoginResponseData>;
export type APILoginFailResponse = AggregatedResponse<"email" | "password">;
export interface APILoginResponseData {
    token: string;
    id: string;
    username: string;
}