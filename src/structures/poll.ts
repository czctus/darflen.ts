import { APIPostPollData } from "../types/api/post.js";

import { HTTP } from "../utils/http.js";
import { urlPath } from "../utils/paths.js";
import { Post } from "./post.js";

export class PollChoice {
    get data() { return this._data };
    
    get text() { return this._data.option };
    get votes() { return this._data.votes };

    public async vote() {
        const form = new FormData();
        form.append("option", this._index.toString());

        await this.http.post(urlPath.polls.vote(this._post.data.id), form)
    }

    constructor(
        private _data: APIPostPollData["options"][number],
        private _post: Post,
        private _index: number,
        private http: HTTP,
    ) { }
}

export class Poll {
    private _choices: PollChoice[] = [];
    private _data: APIPostPollData;

    get data() { return this._data };
    get choices() { return this._choices };

    static create(
        post: Post,
        http: HTTP
    ) {
        return new Poll(post, http);
    }

    constructor(
        private _post: Post,
        private http: HTTP,
    ) {
        if (!this._post.data.poll) throw new Error("post does not contain a poll");
        this._data = this._post.data.poll!; // we just checked that this exists, so we can safely assert that it is not undefined
        this._choices = this._data.options.map((option, index) => new PollChoice(option, this._post, index, this.http));
    }
}