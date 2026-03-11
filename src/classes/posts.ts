import debug from "debug";

import { DarflenClient } from "../index.js";
import { isErrorResponse } from "../misc.js";
import { APIPostData, APIPostResponse } from "../types/api/post.js";
import { HTTP } from "./utils/http.js";
import { debugNamespace } from "../constants.js";

const log = debug(`${debugNamespace}:posts`);

/** a darflen post */
export class Post {
    /** toggle love on/off */
    public async love() {
        this.testInteraction();
        await this.http!.post(`/posts/${this.data.id}/love`);
    }

    /** 
     * loads the html page, which counts as a view.
     * 
     * most interactions will also count as a view, such as replying or loving..
     */
    public async view() {
        this.testInteraction();
        await this.http!.get(`https://darflen.com/posts/${this.data.id}/view`);
    }

    public isOwned(): this is OwnedPost {
        const isOwned = this instanceof OwnedPost;
        log(`do we own this post? %o`, isOwned);
        return isOwned;
    }

    get loves() {
        return this.data.stats.loves;
    }

    get replies() {
        return this.data.stats.comments;
    }

    constructor(
        public data: APIPostData,
        protected http?: HTTP,
        protected testInteraction: (shouldThrow?: boolean) => { ok: boolean, error: string | null } = (shouldThrow: boolean = true) => {
            if (shouldThrow) throw new Error("no http instance was provided");
            return { ok: false, error: "no http instance was provided" }
        },
    ) {
        log("created post %s", data.id);
    }
}

export class OwnedPost extends Post {
    /** deletes the post. no undo! */
    public async delete() {
        this.testInteraction();
        await this.http!.post(`/posts/${this.data.id}/delete`);
    }
}

/** subclass group for posts */
export class Posts {
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

    /** fetches a post by its ID */
    public async get(id: string): Promise<Post> {
        const response = await this.http.get<APIPostResponse>(`/posts/${id}`)
        if (isErrorResponse(response.data)) {
            throw new Error(`got http ${response.status}, ${response.data.message} (${response.data.status})`);
        }
        return new Post(response.data.post, this.http, this.testInteraction);
    }

    constructor(
        private client: DarflenClient,
        private http: HTTP,
    ) { }
}