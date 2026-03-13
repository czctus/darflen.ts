import debug from "debug";

import { Subclass } from "./utils/subclass.js";
import { APIProfileData } from "../types/api/profile.js";
import { HTTP } from "./utils/http.js";
import { debugNamespace } from "../constants.js";

const log = debug(`${debugNamespace}:users`)

/** the user is not authenticated at all */
class Profile {
    get username() { return this.data.profile.username; };
    get displayName() { return this.data.profile.display_name; };

    get description() { return this.data.profile.description; };
    get stats() { return this.data.stats; };

    constructor(
        /** the raw profile data from the api */
        public readonly data: APIProfileData,
        protected readonly http?: HTTP
    ) { }
}

/** the authenticated user is not this user, but can interact! */
class AuthenticatedProfile extends Profile {
    /** **toggle** */
    public async follow() {
        await this.http!.post(`/users/${this.data.id}/follow`);
    }

    /** **toggle** */
    public async block() {
        await this.http!.post(`/users/${this.data.id}/block`);
    }
}

/** the authenticated user IS this user */
class OwnedProfile extends Profile { // we do not extend authenticatedprofile, as those methods are not available to the profile owner. bad dx if showb.
    /** update your profile */
    public async update(options: {
        displayName?: string;
        description?: string;
        banner?: ArrayBuffer | Blob;
        icon?: ArrayBuffer | Blob;
    }) {
        const form = new FormData();

        const blobBanner = options.banner instanceof ArrayBuffer ? new Blob([options.banner]) : (options.banner as Blob | undefined);
        const blobIcon = options.icon instanceof ArrayBuffer ? new Blob([options.icon]) : (options.icon as Blob | undefined);

        if (options.displayName) form.append("display_name", options.displayName);
        if (options.description) form.append("description", options.description);
        if (blobBanner) form.append("banner", blobBanner, "banner.png");
        if (blobIcon) form.append("icon", blobIcon, "icon.png");

        await this.http!.post(`/settings/customize`, form);
    }
}

export class Users extends Subclass {
    private generateProfileInstance(data: APIProfileData) {
        if (this.client.user?.id === data.id) {
            return new OwnedProfile(data, this.http);
        } else if (this.client.authenticated) {
            return new AuthenticatedProfile(data, this.http);
        } else return new Profile(data);
    }

    public async get(username: string) {
        
    }
}