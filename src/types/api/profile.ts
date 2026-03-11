import { APIResponse } from "./request.js"

export type APIProfileResponse = APIResponse<APIProfileData>;
export interface APIProfileImageData {
    thumbnail: string;
    medium?: string;
    large?: string;
    small?: string; // todo, fact check this. i dunno if the api actually returns this.
}

export interface APIProfileLinkData {
    title: string;
    /** can be https, http, mailto, or tel */
    url: string;
}

export interface APIProfileStatsData {
    posts: number;
    followers: number;
    following: number;
    loves: number;
    communities: number;
}

export interface APIProfileMiscellaneousData {
    administrator: boolean;
    user_verified: boolean;
    user_bug_hunter: boolean;
    user_banned: boolean;
    /** seconds since unix epoch */
    creation_time: number;
}

export interface APIProfileUserData<FromProfile = true> { 
    username: string;
    display_name: string;
    description: string;
    images: {
        banner: APIProfileImageData;
        avatar: APIProfileImageData;
    }
    // odd bug! api won't send links unless its directly from the profile endpoint
    // example: if you get profile data from a post, it won't include links, but if you get it from the profile endpoint, it will. so we have to make this conditional!
    links?: FromProfile extends true ? APIProfileLinkData[] : APIProfileLinkData[] | undefined; 
    status: "active" | "offline" | "inactive";
}

export interface APIProfileData<FromProfile = true> {
    id: string;
    profile: APIProfileUserData<FromProfile>;
    stats: APIProfileStatsData;
    miscellaneous: APIProfileMiscellaneousData;
}