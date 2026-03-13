import { DarflenClient } from "../client.js";
import { HTTP } from "./http.js";

export class Subclass {
    constructor(
        protected readonly client: DarflenClient,
        protected readonly http: HTTP,
    ) { };
}