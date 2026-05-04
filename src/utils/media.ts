import { APIPostAudioData, APIPostImageData, APIPostMedia, APIPostVideoData } from "../types/api/post.js";

import { HTTP } from "./http.js";

export abstract class MediaFile {
    protected fetchMedia(url: string): Promise<Blob> {
        return this.http.request<Blob>({
            method: "GET",
            url,
            axiosConfig: {
                responseType: "blob"
            }
        }).then(res => res.data);
    }

    public isAudio(): this is AudioMediaFile {
        return this.data.type === "audio";
    }

    public isVideo(): this is VideoMediaFile {
        return this.data.type === "video";
    }

    public isImage(): this is ImageMediaFile {
        return this.data.type === "image";
    }

    abstract fetch(...args: unknown[]): Promise<Blob>;

    static create<T extends MediaFile = MediaFile>(data: APIPostMedia, http: HTTP): T {
        let instance: MediaFile;
        switch (data.type) {
            case "audio":
                instance = new AudioMediaFile(data, http);
                break;
            case "video":
                instance = new VideoMediaFile(data, http);
                break;
            case "image":
                instance = new ImageMediaFile(data, http);
                break;
            default:
                throw new Error(`unsupported media type: ${(data as APIPostMedia).type}`);
        }
        return instance as T;
    }

    constructor(
        public readonly data: APIPostMedia,
        protected readonly http: HTTP
    ) { }
}

export class AudioMediaFile extends MediaFile {
    declare public readonly data: APIPostAudioData;

    /** fetches the audio file */
    public fetch(): Promise<Blob> {
        return this.fetchMedia(this.data.file);
    }
}

export class VideoMediaFile extends MediaFile {
    declare public readonly data: APIPostVideoData;

    /** fetches the video file */
    public fetch(type: "thumbnail" | "video" = "video"): Promise<Blob> {
        const prop = type === "video" ? "file" : "thumbnail";
        return this.fetchMedia(this.data[prop]);
    }
}

export class ImageMediaFile extends MediaFile {
    declare public readonly data: APIPostImageData;

    /** fetches the image file */
    public fetch(type: "thumbnail" | "large" | "medium" = "large"): Promise<Blob> {
        return this.fetchMedia(this.data[type] ?? this.data.thumbnail);
    }
}