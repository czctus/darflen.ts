import { httpclient } from "../misc.js";
import { Posts } from "./posts.js";

export class DarflenClient {
    private http = httpclient.inherit();
    
    public posts = new Posts(this, this.http);

    constructor(token: string)
    constructor(options: { token: string })
    constructor(tokenOrOptions: string | { token: string }) {
        const defaults = this.http.defaultProperties;

        if (typeof tokenOrOptions === "string") {
            defaults.headers["authorization"] = `Bearer ${tokenOrOptions}`;
        } else {
            defaults.headers["authorization"] = `Bearer ${tokenOrOptions.token}`;
        }

        this.http.defaultProperties = defaults;
    }
}