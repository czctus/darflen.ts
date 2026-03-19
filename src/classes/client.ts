import { authenticate } from "../authentication.js";
import { urlPaths } from "../constants.js";
import { httpclient } from "../misc.js";
import { APIProfileData } from "../types/api/profile.js";
import { Posts } from "./posts.js";
import { OwnedProfile, Users } from "./profile.js";

export class DarflenClient {
    private http = httpclient.inherit();
    
    public posts = new Posts(this, this.http);
    public users = new Users(this, this.http);
    
    /** was an token passed OR by setting `client.token` */
    public authenticated = false;
    /** IF authenticated, this will contain the authenticated user's profile */
    public user?: OwnedProfile;

    private authenticate(t: string) {
        this.setAuthorizationHeader(t);
        return this.http.get<APIProfileData>(urlPaths.routes.myself).then(profile => {
            if (profile.status === 200) {
                this.user = new OwnedProfile(profile.data, this.http);
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

    /** set the token. if email and password is passed, it generates a new token */
    public async login(email: string, password: string): Promise<void>
    public async login(token: string): Promise<void>
    public async login(t: string, password?: string) { // todo i don't understand what i did in this function. perhaps fix it...
        let token;

        if (password) token = await authenticate(t, password) 
        if (t.startsWith("Bearer ")) token=token!.split(" ")[0];
        return await this.authenticate(token!);
    }
}