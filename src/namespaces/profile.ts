import { APIProfileData } from "../types/api/profile.js";

import { Profile } from "../structures/profile.js";
import { urlPath } from "../utils/paths.js";
import { Namespace } from "../utils/namespace.js";
import { debugLoggers } from "../utils/debug.js";

const log = debugLoggers.profiles;

export class Users extends Namespace {
    public async getRaw(id: string, isUsername = false): Promise<APIProfileData> {
        const url = isUsername ? urlPath.user.data(id) : urlPath.user.dataById(id);
        return await this.http.get<APIProfileData>(url).then((res) => res.data);
    }

    public get(id: string, isUsername?: boolean): Promise<Profile>;
    public get(data: APIProfileData): Profile;
    public get(idOrData: string | APIProfileData, isUsername = false): Promise<Profile> | Profile {
        if (typeof idOrData === "string") {
            return this.getRaw(idOrData, isUsername).then((data) => Profile.create(data, this.http, this.client));
        } else {
            return Profile.create(idOrData, this.http, this.client);
        }
    }

    public async getByUsername(username: string) {
        return await this.getRaw(username, true);
    }

    public async follow(username: string) {
        await this.http.post(urlPath.user.follow(username));
    }

    public async block(username: string) {
        await this.http.post(urlPath.user.block(username));
    }
}