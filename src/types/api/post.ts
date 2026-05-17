import type { Audience, FeedType } from "../../enums.js";
import type { APIProfileData } from "./profile.js";
import type { APIResponse, APISuccessResponse } from "./request.js";

export type PrimitiveAudience = Audience | `${Audience}`;
export type PrimitiveFeedType = FeedType | `${FeedType}`;

export type APIPostResponse = APIResponse<{ post: APIPostData }>;
export type APISuccessfulAggregatedPostsResponse = APISuccessResponse<{ posts: APIPostData[] }>;
export type APIPostCreateResponse = APIResponse<APIPostCreateData>;
export type APIPostMedia = APIPostImageData | APIPostVideoData | APIPostAudioData;

export interface APIPostCreateData {
    post_id: string;
    user_posts: number; // represents the amount of posts the user has made, including the one just created
}

export interface APIPostImageData {
    type: "image";
    thumbnail: string;
    medium?: string;
    large?: string;
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
    audience: `${Audience}`;
    edited: boolean;
    pinned: boolean;
    /** whether or not this post can be replied to */
    locked: boolean;
    stats: APIPostStatsData;
    poll?: APIPostPollData;
    miscellaneous: APIPostMiscellaneousData;
    author: APIProfileData<false>;
}