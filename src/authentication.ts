import querystring from "querystring";
import debug from "debug";

import { debugNamespace, urlPaths } from "./constants.js";
import { httpclient, isErrorResponse } from "./misc.js";
import { APILoginResponse } from "./types/api/authentication.js";

const log = debug(`${debugNamespace}:authentication`);

interface RegisterParams {
    email: string,
    username: string,
    password: string,
    referralCode?: string,
    birthdate: {
        day: number,
        month: number,
        year: number
    } | Date
}

/**
 * login to darflen and get a token
 * @param email 
 * @param password 
 * @returns token
 */
export async function authenticate(email: string, password: string): Promise<string>;
export async function authenticate(params: { email: string, password: string }): Promise<string>;
export async function authenticate(...params: [string, string] | [{ email: string, password: string }]): Promise<string> {
    let email: string, password: string;
    if (params.length === 1) {
        email = params[0].email;
        password = params[0].password;
    } else {
        email = params[0];
        password = params[1];
    }

    if (!email || !password) throw new Error("email and password are required!");

    const response = await httpclient.request<APILoginResponse>({
        url: urlPaths.routes.login,
        method: "POST",
        params: {
            email,
            password
        }
    })

    if (isErrorResponse(response.data)) {
        log("failed to authenticate with email %s: %s", email, response.data.message);
        throw new Error(response.data.message);
    } else {
        if (!response.data.token) throw new Error("no token was returned!");
        log("successfully authenticated with email %s. username is %s", email, response.data.username);
        return response.data.token;
    }
}

/**
 * register a new account on darflen and get a token
 * @param email 
 * @param username
 * @param password
 * @param referralCode
 * @param birthdate date of birth, can be a Date object or a object containing day, month, and year
 * @returns token
 */
export async function register(params: RegisterParams): Promise<string> {
    const { email, username, password, referralCode, birthdate } = params;
    if (!email || !username || !password || !birthdate) throw new Error("email, username, password and birthdate are required!");

    const formattedBirthdate = birthdate instanceof Date ? birthdate : new Date(birthdate.year, birthdate.month - 1, birthdate.day);

    const response = await httpclient.request<APILoginResponse>({
        url: urlPaths.routes.register,
        method: "POST",
        body: querystring.stringify({
            email,
            username,
            password,
            referralCode,
            day: formattedBirthdate.getDate(),
            month: formattedBirthdate.getMonth() + 1,
            year: formattedBirthdate.getFullYear()
        }),
    });

    if (isErrorResponse(response.data)) {
        log("failed to register with email %s: %s", email, response.data.message);
        throw new Error(response.data.message);
    } else {
        if (!response.data.token) throw new Error("no token was returned!");
        log("successfully registered with email %s. username is %s", email, response.data.username);
        return response.data.token;
    }
}