import { BasePacket, NoPollPacket } from "../types/lib/posts.js";
import { APIPostCreateResponse, APIPostData, APIPostResponse, APISuccessfulAggregatedPostsResponse, PrimitiveAudience, PrimitiveFeedType } from "../types/api/post.js";
import { DefaultPageOptions } from "../types/lib/client.js";

import { urlPath } from "../utils/paths.js";
import { isErrorResponse } from "../misc.js";
import { Audience, FeedType } from "../enums.js";
import { Namespace } from "../utils/namespace.js"
import { OwnedPost, Post } from "../structures/post.js";
import { Page } from "../utils/page.js";
import { Profile } from "../structures/profile.js";
import { debugLoggers } from "../utils/debug.js";

const log = debugLoggers.posts

function generatePacket(params: BasePacket): FormData {
    const packet = new FormData();

    if (!params.text && !params.media && !params.poll) {
        throw new Error("at least one of text, media, or poll is required");
    }

    if (params.community) packet.append("group", params.community);
    if (params.text) packet.append("textarea", params.text);
    if (params.audience) packet.append("audience", params.audience);
    if (params.media) {
        params.media.forEach((m, i) => {
            const data = m instanceof Blob ? m : m.data;
            const filename = m instanceof Blob ? `media_${i}` : m.filename;
            packet.append(`files[]`, data, filename); // this is what the api expects.... seems a bit weird, but nothing we can do about it
        });
    }
    if (params.poll) {
        if (params.poll.expires > 14 || params.poll.expires < 1) {
            throw new Error("poll expires must be between 1 and 14 days");
        } else if (!Number.isInteger(params.poll.expires)) {
            throw new Error("poll expires must be an integer (is there a decimal?)");
        } else if (params.poll.choices.length > 8 || params.poll.choices.length < 2) {
            throw new Error("poll choices must be between 2 and 8");
        }

        log("we've got a poll..")

        packet.append("time", params.poll.expires.toString());
        params.poll.choices.forEach((c) => {
            log(`adding poll choice with text %s...`, c);
            packet.append(`option[]`, c); // again the api expects this format!!! 
        })
    }

    log("generated packet with the following data: %O", Array.from(packet.entries()));

    return packet;
}

/** subclass group for posts */
export class Posts extends Namespace {
    /** returns the raw post data */
    public getRaw(id: string): Promise<APIPostData> {
        return this.http.get<APIPostResponse>(urlPath.post.data(id)).then((d) => {
            if (isErrorResponse(d.data)) {
                throw new Error(`got http ${d.status}, ${d.data.message} (${d.data.status})`);
            } else {
                return d.data.post;
            }
        });
    }

    public async delete(id: string): Promise<void> {
        log(`deleting post with id %s...`, id);
        await this.http.post(urlPath.post.delete(id));
    }

    public async create(text: string): Promise<OwnedPost>;
    public async create(text: string, audience: PrimitiveAudience): Promise<OwnedPost>;
    public async create(params: BasePacket): Promise<OwnedPost>;
    public async create(textOrParams: string | BasePacket, audience?: PrimitiveAudience): Promise<OwnedPost> {
        const params = typeof textOrParams === "string" ? { text: textOrParams, audience } : textOrParams;
        const url = params.repost ? urlPath.post.repost(params.repost) : urlPath.post.create();
        const packet = generatePacket({
            audience: Audience.Public, // default
            ...params
        });

        const response = await this.http.post<APIPostCreateResponse>(url, packet).then((d) => {
            if (isErrorResponse(d.data)) {
                throw new Error(`got http ${d.status}, ${d.data.message} (${d.data.status})`);
            } else {
                return d.data.post_id;
            }
        });

        log(`created post with id %s...`, response);

        return this.get(response, true); // we created this post, so obviously we own it.
    }

    public async edit(id: string, text: string): Promise<void>;
    public async edit(id: string, params: NoPollPacket): Promise<void>;
    public async edit(id: string, textOrParams: string | NoPollPacket): Promise<void> {
        const params = typeof textOrParams === "string" ? { text: textOrParams } : textOrParams;
        const packet = generatePacket(params);

        await this.http.post(urlPath.post.edit(id), packet);

        log(`edited post with id %s...`, id);
    }

    /** fetches a post by its ID */
    public async get(id: string, owned: true): Promise<OwnedPost>;
    public async get(id: string): Promise<Post>;
    public async get(data: APIPostData, owned: true): Promise<OwnedPost>;
    public async get(data: APIPostData): Promise<Post>;
    public async get(idOrRaw: string | APIPostData): Promise<Post> { // we drop the owned param here since it is just a hint for typescript. maybe bad idea? idk..
        const response = typeof idOrRaw === "string" ? await this.getRaw(idOrRaw) : idOrRaw
        log(`fetched post with id %s, local? %s...`, response.id, typeof idOrRaw === "string" ? "no" : "yes");
        return Post.create(response, this.http, this.client);
    }

    public async getUserPosts(user: Profile, args?: DefaultPageOptions): Promise<Page<Post>>;
    public async getUserPosts(username: string, args?: DefaultPageOptions): Promise<Page<Post>>;
    public async getUserPosts(profileOrUsername: Profile | string, args?: DefaultPageOptions): Promise<Page<Post>> {
        const username = typeof profileOrUsername === "string" ? profileOrUsername : profileOrUsername.username;
        const getPosts = async (page: number) => {
            const d = await this.http.get<APISuccessfulAggregatedPostsResponse>(urlPath.user.posts(username, page, args?.limit));
            return d.data.posts.map((p) => Post.create(p, this.http, this.client));
        }

        return new Page(getPosts, await getPosts(args?.page ?? 1), args?.page ?? 1);
    }

    public async getReposts(id: string, args?: DefaultPageOptions): Promise<Page<Post>> {
        const getPosts = async (page: number) => {
            const d = await this.http.get<APISuccessfulAggregatedPostsResponse>(urlPath.post.reposts(id, page, args?.limit));   
            return d.data.posts.map((p) => Post.create(p, this.http, this.client));
        }

        return new Page(getPosts, await getPosts(args?.page ?? 1), args?.page ?? 1);
    };

    public async getFeed(feed: PrimitiveFeedType, args?: DefaultPageOptions): Promise<Page<Post>> {
        const getPosts = async (page: number) => {
            const url = feed === FeedType.Following ? urlPath.post.followingFeed(page, args?.limit) : urlPath.post.feed(feed, page, args?.limit);
            const d = await this.http.get<APISuccessfulAggregatedPostsResponse>(url);
            return d.data.posts.map((p) => Post.create(p, this.http, this.client));
        }

        return new Page(getPosts, await getPosts(args?.page ?? 1), args?.page ?? 1);
    }

    public async togglePin(id: string): Promise<void> {
        await this.http.post(urlPath.post.pin(id));
        log(`toggled pin for post with id %s...`, id);
    }

    public async toggleLove(id: string): Promise<void> {
        await this.http.post(urlPath.post.love(id));
        log(`toggled love for post with id %s...`, id);
    }
}