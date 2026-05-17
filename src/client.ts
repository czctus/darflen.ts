import { authenticate } from "./authentication.js";
import { httpclient } from "./misc.js";
import { Posts } from "./namespaces/posts.js";
import { Users } from "./namespaces/profile.js";
import { OwnedProfile, Profile } from "./structures/profile.js";
import { urlPath } from "./utils/paths.js";
import { version } from "./version.js";
import { debugLoggers } from "./utils/debug.js";

import type { APIProfileData } from "./types/api/profile.js";

const log = debugLoggers.client;

export class DarflenClient {
    private http = httpclient.inherit();
    private _user?: OwnedProfile;

    public posts = new Posts(this, this.http);
    public users = new Users(this, this.http);

    /** was an token passed OR by setting `client.token` */

    get agent() { return this.http.defaultProperties.headers["User-Agent"]; }
    get version() { return version; }
    get authenticated() { return !!this._user; }
    get user(): OwnedProfile | never {
        // log("trying to get user profile. %o", this);

        if (!this.authenticated) throw new Error("not authenticated");
        return this._user!;
    }

    private authenticate(t: string) {
        this.setAuthorizationHeader(t);
        return this.http.get<APIProfileData>(urlPath.user.myself()).then(profile => {
            this._user = Profile.create(profile.data, this.http, this, true); // this kinda suxxxxxx but it works for now. maybe refactor later idk
        });
    }

    private deauthenticate() {
        this.setAuthorizationHeader();
        this._user = undefined;
    }

    private setAuthorizationHeader(t?: string) {
        this.http.defaultProperties = {
            ...this.http.defaultProperties,
            headers: {
                ...this.http.defaultProperties.headers,
                authorization: t ? `Bearer ${t}` : ""
            }
        }
    }

    /** set the token. if email and password is passed, it generates a new token */
    public async login(email: string, password: string): Promise<void>
    public async login(token: string): Promise<void>
    public async login(t: string, password?: string) {
        let token;

        if (password) {
            log("generating token. email: %s, password: %s", t, "*".repeat(password.length));
            token = await authenticate(t, password);
        } else {
            if (t.startsWith("Bearer ")) { token = t.split(" ")[1]; } else token = t;
        }

        return await this.authenticate(token!);
    }

    /** invalidates the current token + sets you to offline */
    public async logout() {
        await this.http.request({
            url: urlPath.auth.logout(),
            method: "POST"
        }, true, true);
        this.deauthenticate();
    }
}