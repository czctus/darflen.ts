import { urlPaths } from "../constants.js";
import { httpclient } from "../misc.js";
import { APIProfileData } from "../types/api/profile.js";
import { Posts } from "./posts.js";

export class DarflenClient {
    private http = httpclient.inherit();
    
    public posts = new Posts(this, this.http);
    
    /** was an token passed OR by setting `client.token` */
    public authenticated = false;
    /** IF authenticated, this will contain the authenticated user's profile */
    public profile?: APIProfileData;

    private authenticate(t: string) {
        this.setAuthorizationHeader(t);
        return this.http.get<APIProfileData>(urlPaths.routes.myself).then(profile => {
            if (profile.status === 200) {
                this.profile = profile.data;
                this.authenticated = true;
            } else {
                throw new Error(`authorization token might be wrong.. got status ${profile.status}`);
            }
        });
    }

    private setAuthorizationHeader(t: string) {
        this.http.defaultProperties = {
            ...this.http.defaultProperties,
            headers: {
                ...this.http.defaultProperties.headers,
                authorization: `Bearer ${t}`
            }
        }
    }

    /** set the token. will also set */
    public login(t: string) {
        if (t.startsWith("Bearer ")) t=t.split(" ")[0];
        return this.authenticate(t);
    }
}