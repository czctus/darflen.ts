import { PrimitiveAudience } from "../api/post.js";

export type NoPollPacket = Omit<BasePacket, "poll">; 
export interface BasePacket {
    text?: string;
    media?: ({ data: Blob, filename: string } | Blob)[];
    audience?: PrimitiveAudience; 
    /** what community to post to. must be authenticated */
    community?: string;
    /** id of the post to repost */
    repost?: string;
    poll?: CreatePoll; 
}

export interface CreatePoll {
    /** min 2, max 8 */
    choices: string[];
    /** in days. cannot be a decimal. min 1, max 14 */
    expires: number;
}