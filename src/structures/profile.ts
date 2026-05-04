import { APIProfileData } from "../types/api/profile.js";

import { DarflenClient } from "../client.js";
import { HTTP } from "../utils/http.js";
import { urlPath } from "../utils/paths.js";
import { Form } from "../utils/form.js";
import { ImageMediaFile, MediaFile } from "../utils/media.js";

/** the user is not authenticated at all */
export class Profile {
    private _data!: APIProfileData;
    private _media?: {
        avatar: ImageMediaFile;
        banner: ImageMediaFile;
    };

    get data() { return this._data; };
    get media() { return this._media!; };
    get id() { return this.data.id; };

    get username() { return this.data.profile.username; };
    get displayName() { return this.data.profile.display_name; };
    get description() { return this.data.profile.description; };
    get status() { return this.data.profile.status; };
    get links() { return this.data.profile.links; }

    get stats() { return this.data.stats; };
    get miscellaneous() { return this.data.miscellaneous; };

    private setData(data: APIProfileData) {
        this._data = data;
        this._media = {
            avatar: MediaFile.create<ImageMediaFile>({
                type: "image",
                ...data.profile.images.icon
            }, this.http),
            banner: MediaFile.create<ImageMediaFile>({
                type: "image",
                ...data.profile.images.banner
            }, this.http)
        }
    }

    public async refresh() {
        this.setData(await this.client.users.getRaw(this.id));
    }

    public isOwned(): this is OwnedProfile {
        if (this.client.authenticated && this.client.user.id === this.id) return true
        else return false;
    }

    public isAuthenticated(): this is AuthenticatedProfile {
        return this.client.authenticated;
    }

    public async getPosts() {
        return await this.client.posts.getUserPosts(this.username);
    }

    static create(
        data: APIProfileData,
        http: HTTP,
        client: DarflenClient,
        owned: true // this is primarily used for just the client.user thing
    ): OwnedProfile
    static create(
        data: APIProfileData,
        http: HTTP,
        client: DarflenClient
    ): AuthenticatedProfile
    static create(
        data: APIProfileData,
        http: HTTP,
        client: DarflenClient,
        owned = false
    ) {
        if (owned || (client.authenticated && client.user.id === data.id)) { // check owned first, since client.user throws if not authenticated
            return new OwnedProfile(data, http, client);
        } else if (client.authenticated) {
            return new AuthenticatedProfile(data, http, client);
        } else return new Profile(data, http, client);
    }

    constructor(
        /** the raw profile data from the api */
        data: APIProfileData,
        protected readonly http: HTTP,
        protected readonly client: DarflenClient
    ) {
        this.setData(data);
    }
}

/** the authenticated user is not this user, but can interact! */
export class AuthenticatedProfile extends Profile {
    /**
     * Follow this user.
     * 
     * @remarks
     * - **Permission**: you must be authenticated to use this function. 
     * - **Toggle**: if you already follow this user, it will unfollow them instead, and vice versa.
     * 
     * @example
     * ```ts
     * const user = await client.users.get("some-user");
     * await user.follow();
     * ```
     * 
     * @throws {DarflenError} if the user is blocking you/you are blocking the user.
     * 
     * @since 1.0.0
     * @returns {Promise<void>}
     **/
    public async follow(): Promise<void> {
        await this.client.users.follow(this.data.profile.username);
    }

    /**
     * Block this user *(evil...)*
     * 
     * @remarks
     * - **Permission**: you must be authenticated to use this function.
     * - **Toggle**: if you already block this user, it will unblock them instead, and vice versa.
     * 
     * @example
     * ```ts
     * const user = await client.users.get("some-user");
     * await user.block();
     * ```
     * 
     * @since 1.0.0
     * @returns {Promise<void>}
     **/
    public async block(): Promise<void> {
        await this.client.users.block(this.data.profile.username);
    }
}

/** the authenticated user IS this user */
export class OwnedProfile extends Profile {
    // this class does not extend authenticatedprofile, because all of the functions exposed on there cannot be used on your own profile
    // also if we showed it, it would be bad dx...

    /** 
     * Update your profile information.
     * 
     * @param options the profile fields to update
     * @param options.displayName your new display name (not unique)
     * @param options.description your new profile description
     * @param options.banner your new profile banner image (accepted formats: png, jpg, gif, etc.)
     * @param options.icon your new profile icon image (accepted formats: png, jpg, gif, etc.)
     * @remarks
     * - **Permission**: you must be authenticated to use this function, and the profile being updated must be your own.
     * - **Partial updates**: you can provide any subset of the above fields to update only those fields.
     * - **Refreshing**: after the update is successful, the profile data on this instance will be automatically refreshed to reflect the changes.
     * 
     * @example
     * ```ts
     * await client.user.update({
     *   displayName: "new Display Name",
     *   description: "new profile description",
     * });
     * ```
     * 
     * @example
     * ```ts
     * import { openAsBlob } from 'node:fs';
     * 
     * const profile = await openAsBlob("./puppy.png");
     * const banner = await openAsBlob("./kittens.png");
     * 
     * await client.user!.update({
     *   icon: profile,
     *   banner: banner,
     * });
     * ```
     * 
     * @since 1.0.0
     * @returns {Promise<void>}
     **/ // todo list accepted formats for banner/icon. we know obviously png, jpg, and gif. what else?
    public async update(options: {
        displayName?: string;
        description?: string;
        banner?: ArrayBuffer | Blob;
        icon?: ArrayBuffer | Blob;
    }): Promise<void> {
        const form = new Form();

        const blobBanner = options.banner instanceof ArrayBuffer ? new Blob([options.banner]) : (options.banner as Blob | undefined);
        const blobIcon = options.icon instanceof ArrayBuffer ? new Blob([options.icon]) : (options.icon as Blob | undefined);

        async function appendBlankBlob(name: string) {
            await form.append(name, new Blob(), { filename: "" }); // darflen expects blank filename
        }

        await form.append("display-name", options.displayName ?? this.data.profile.display_name);
        await form.append("description", options.description ?? this.data.profile.description);

        for (const [key, value] of Object.entries({ banner: blobBanner, icon: blobIcon })) {
            if (value && value instanceof Blob) await form.append(key, value, { filename: `${key}.png` });
            else await appendBlankBlob(key);
        }

        await this.http.post(urlPath.settings.customization(), form.build(), form.headers());
        await this.client.user.refresh();
    }

    /**
     * Ping the darflen server to set your status to online.
     * 
     * Be aware that darflen will automatically set you to inactive after a certain amount of time, then set you to offline.  
     * 
     * @remarks
     * - **Permission**: you must be authenticated to use this function.
     * 
     * @example
     * ```ts
     * client.user.ping();
     * ```
     * 
     * @since 1.0.0
     * @returns {Promise<void>}
     **/ // todo find the timing for this
    public async ping(): Promise<void> {
        await this.http.post(urlPath.user.activity());
        this.data.profile.status = "active"; // we can optimistically update this since we know it will work, and it saves an api call for the user
    }

    /** 
     * Update the username of your profile.
     * 
     * @param newUsername the new username you want to set (must be unique)
     * @param password the current password of your account, required to confirm the username change
     * 
     * @remarks
     * - **Permission**: you must be authenticated to use this function, and the profile being updated must be your own.
     * - **Refreshing**: after the update is successful, the profile data on this instance will be automatically refreshed to reflect the changes.
     * - **Note**: changing your username does in fact change your profile ID as well, and it is not reversible (even if you change it back..)
     * 
     * @example
     * ```ts
     * await client.user.changeUsername("new-unique-username", "currentPassword123");
     * ```
     * 
     * @throws {DarflenError} if the new username is already taken by another user, or if the provided password is incorrect.
     * 
     * @since 1.0.0
     * @returns {Promise<void>}
     */
    public async changeUsername(newUsername: string, password: string): Promise<void> {
        const form = new FormData();
        form.append("username", newUsername);
        form.append("password", password);

        await this.http.post(urlPath.auth.updateUsername(), form);
        await this.refresh();
    }

    /**
     * Update the password of your account.
     * 
     * @param oldPassword the current password of your account, required to confirm the password change
     * @param newPassword the new password you want to set
     * 
     * @remarks
     * - **Permission**: you must be authenticated to use this function, and the profile being updated must be your own.
     * 
     * @example
     * ```ts
     * await client.user.changePassword("currentPassword123", "newSecurePassword456");
     * ```
     * 
     * @throws {DarflenError} if the provided old password is incorrect.
     * 
     * @since 1.0.0
     * @returns {Promise<void>}
     */
    public async changePassword(oldPassword: string, newPassword: string): Promise<void> {
        const form = new FormData();
        form.append("old_password", oldPassword);
        form.append("new_password", newPassword);
        form.append("confirm_password", newPassword); // darflen requires the new password to be confirmed

        await this.http.post(urlPath.auth.updatePassword(), form);
    }
}