import type { DarflenClient } from "../client.js";
import type { HTTP } from "./http.js";

export class Namespace {
    constructor(
        protected readonly client: DarflenClient,
        protected readonly http: HTTP,
    ) { };
}