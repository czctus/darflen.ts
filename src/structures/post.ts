import { APIPostData } from "../types/api/post.js";
import { BasePacket, NoPollPacket } from "../types/lib/posts.js";

import { Profile } from "../structures/profile.js";
import { MediaFile } from "../utils/media.js";
import { darflenSite } from "../constants.js";
import { HTTP } from "../utils/http.js";
import { DarflenClient } from "../client.js";
import { urlPath } from "../utils/paths.js";
import { DarflenURL } from "../misc.js";
import { Poll } from "./poll.js";
import { debugLoggers } from "../utils/debug.js";

const log = debugLoggers.posts;

/** a darflen post */
export class Post {
    private _author!: Profile; // it is initialized in the constructor (by calling setData), but we need to tell typescript that 
    private _data!: APIPostData; // ^^^
    private _media: MediaFile[] = [];
    private _poll?: Poll;

    private setData(data: APIPostData) {
        this._data = data;
        this._media = data.files.map((f) => MediaFile.create(f, this.http));
        this._author = this.client.users.get(data.author);
        if (data.poll) this._poll = Poll.create(this, this.http);
    }

    public isOwned(): this is OwnedPost {
        if (this.client.authenticated && this.client.user.id === this.author.id) return true
        else return false;
    }

    public isAuthenticated(): this is AuthenticatedPost {
        return this.client.authenticated;
    }

    /** updates the post data */
    public async refresh(): Promise<void> {
        this.setData(await this.client.posts.getRaw(this.data.id).then((d) => {
            log(`refreshed post with id %s...`, d.id);
            return d;
        }));
    }

    public reposts() { return this.client.posts.getReposts(this.data.id) }

    get id() { return this.data.id };
    get data() { return this._data };
    get author() { return this._author };
    get deleted() { return this._deleted };
    get media() { return this._media };
    get poll() { return this._poll };

    get audience() { return this.data.audience };
    get edited() { return this.data.edited };
    get pinned() { return this.data.pinned };
    /** if true, this means the post cannot be interacted with */
    get locked() { return this.data.locked };

    /** the post's statistics */
    get stats() { return this.data.stats };
    get content() { return this.data.content };

    get createdAt() { return this._createdDate };

    static create(
        data: APIPostData,
        http: HTTP,
        client: DarflenClient
    ) {
        if (client.authenticated && client.user.id === data.author.id) {
            return new OwnedPost(data, http, client);
        } else if (client.authenticated) {
            return new AuthenticatedPost(data, http, client);
        } else return new Post(data, http, client);
    }

    constructor(
        data: APIPostData,
        protected readonly http: HTTP,
        protected readonly client: DarflenClient,
        protected _deleted = false,

        protected readonly _createdDate = new Date(data.miscellaneous.creation_time * 1000),
    ) {
        this.setData(data);
    }
}

/** should be used only if logged in */
export class AuthenticatedPost extends Post {
    /** toggle love on/off */
    public async toggleLove(refresh: boolean = true) { // todo, move to posts namespace 
        //this.testInteraction();
        await this.client.posts.toggleLove(this.data.id);
        if (refresh) await this.refresh();
    }

    /** 
     * loads the html page, which counts as a view.
     * 
     * most interactions will also count as a view, such as replying or loving, so this is redundant in most cases. 
     */
    public async view() {
        //this.testInteraction();
        await this.http.get(DarflenURL(darflenSite, urlPath.post.data(this.data.id)));
    }

    public repost(params: BasePacket): Promise<OwnedPost> {
        return this.client.posts.create({
            ...params,
            repost: this.data.id
        });
    }
}

export class OwnedPost extends AuthenticatedPost {
    /** toggles pin off/on */
    public async togglePin() {
        await this.client.posts.togglePin(this.data.id);
        this.data.pinned = !this.data.pinned; // confidently update the pinned status since we know it worked.
    }

    /** deletes the post */
    public async delete() {
        await this.client.posts.delete(this.data.id);
        this._deleted = true;
    }

    /** edits the post */
    public async edit(text: string): Promise<void>;
    public async edit(params: NoPollPacket): Promise<void>;
    public async edit(textOrParams: string | NoPollPacket) {
        const params = typeof textOrParams === "string" ? { text: textOrParams } : textOrParams;

        await this.client.posts.edit(this.data.id, {
            audience: this.data.audience,
            text: this.data.content,
            ...params
        });
        await this.refresh();
    }
}