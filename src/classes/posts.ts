import debug from "debug";

import { isErrorResponse } from "../misc.js";
import { APIPostData, APIPostResponse } from "../types/api/post.js";
import { HTTP } from "./utils/http.js";
import { debugNamespace } from "../constants.js";
import { Subclass } from "./utils/subclass.js";

const log = debug(`${debugNamespace}:posts`);

/** a darflen post */
class Post {
    public isOwned(): this is OwnedPost {
        const isOwned = this instanceof OwnedPost;
        log(`do we own this post? %s`, isOwned ? "yes" : "no");
        return isOwned;
    }

    public isAuthenticated(): this is AuthenticatedPost {
        const isAuth = this instanceof AuthenticatedPost;
        log(`are we authorized to interact with this post? %s`, isAuth ? "yes" : "no");
        return isAuth;
    }

    get loves() {
        return this.data.stats.loves;
    }

    get replies() {
        return this.data.stats.comments;
    }

    constructor(
        public readonly data: APIPostData,
        protected readonly http?: HTTP,
        protected readonly testInteraction: (shouldThrow?: boolean) => { ok: boolean, error: string | null } = (shouldThrow: boolean = true) => {
            if (shouldThrow) throw new Error("no http instance was provided");
            return { ok: false, error: "no http instance was provided" }
        },
    ) {
        log("created post %s", data.id);
    }
}

/** should be used only if logged in */
class AuthenticatedPost extends Post {
    /** toggle love on/off */
    public async love() {
        //this.testInteraction();
        await this.http!.post(`/posts/${this.data.id}/love`);
    }

    /** 
     * loads the html page, which counts as a view.
     * 
     * most interactions will also count as a view, such as replying or loving..
     */
    public async view() {
        //this.testInteraction();
        await this.http!.get(`https://darflen.com/posts/${this.data.id}/view`);
    }
}

class OwnedPost extends AuthenticatedPost {
    /** deletes the post. no undo! */
    public async delete() {
        //this.testInteraction();
        await this.http!.post(`/posts/${this.data.id}/delete`);
    }
}

/** subclass group for posts */
export class Posts extends Subclass {
    private testInteraction(shouldThrow: boolean = true): { ok: boolean, error: string | null } {
        const response = {
            ok: this.http !== undefined &&
                this.http.defaultProperties.headers["authorization"] !== undefined,
            error:
                this.http === undefined ? "no http instance was provided" :
                    this.http.defaultProperties.headers["authorization"] === undefined ? "not authenticated!" :
                        null
        }

        if (shouldThrow && !response.ok) {
            throw new Error(response.error!);
        }

        return response
    }

    private generatePostInstance(data: APIPostData): Post {
        if (this.client.user?.id === data.author.id) {
            return new OwnedPost(data, this.http, this.testInteraction);
        } else if (this.client.authenticated) {
            return new AuthenticatedPost(data, this.http, this.testInteraction);
        } else return new Post(data, this.http, this.testInteraction);
    }

    /** fetches a post by its ID */
    public async get(id: string): Promise<Post>
    public async get(data: APIPostData): Promise<Post>
    public async get(idOrRaw: string | APIPostData): Promise<Post> {
        const response =
            typeof idOrRaw === "string" ?
                await this.http!.get<APIPostResponse>(`/posts/${idOrRaw}`).then((d) => {
                    if (isErrorResponse(d.data)) {
                        throw new Error(`got http ${d.status}, ${d.data.message} (${d.data.status})`);
                    } else {
                        return d.data.post;
                    }
                }) :
                idOrRaw

        return this.generatePostInstance(response);
    }
}