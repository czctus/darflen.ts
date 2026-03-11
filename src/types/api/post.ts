import { APIProfileData } from "./profile.js";
import { APIResponse } from "./request.js";

export type APIPostResponse = APIResponse<{ post: APIPostData }>;
export type APIPostMedia = APIPostImageData | APIPostVideoData | APIPostAudioData;

export interface APIPostImageData {
    type: "image";
    thumbnail: string;
    medium?: string;
    large?: string;
    small?: string; // todo, fact check this. i dunno if the api actually returns this.
}

export interface APIPostVideoData {
    type: "video";
    file: string;
    thumbnail: string;
}

export interface APIPostAudioData {
    type: "audio";
    file: string;
}

export interface APIPostStatsData {
    /** likes */
    loves: number;
    reposts: number;
    /** replies */
    comments: number;
    views: number;
}

export interface APIPostPollData {
    options: Array<{
        option: string;
        votes: number;
    }>;
    /** seconds since unix epoch */
    time: number;
    /** total amount of votes */
    votes: number;
}

export interface APIPostMiscellaneousData {
    /** seconds since unix epoch */
    creation_time: number;
}

export interface APIPostData {
    /** post id */
    id: string;
    content: string;
    files: APIPostMedia[];
    audience: "public" | "followers" | "private" | "unlisted";
    edited: boolean;
    pinned: boolean;
    /** whether or not this post can be replied to */
    locked: boolean;
    stats: APIPostStatsData;
    poll?: APIPostPollData;
    miscellaneous: APIPostMiscellaneousData;
    author: APIProfileData<false>;
}