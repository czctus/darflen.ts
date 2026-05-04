import assert from "node:assert";

import { DarflenClient } from "darflen.ts";

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

describe("Profile", async function () {
    const client = new DarflenClient();

    const email = process.env.DARFLEN_EMAIL!;
    const password = process.env.DARFLEN_PASSWORD!;
    before(async function () {
        if (!email || !password) {
            console.warn("skipping because there is no email or password provided in environment variables");
            this.skip();
        } else {
            await client.login(email, password).catch(() => {
                console.warn("skipping because the client failed to authenticate with provided credentials");
                this.skip();
            });
        }
    });

    beforeEach(function () {
        if (!client.authenticated) {
            this.skip();
        }
    })

    describe("update", function () {
        it("should update the profile's display name and description", async function () {
            const originalDisplayName = client.user.data.profile.display_name;
            const originalDescription = client.user.data.profile.description;

            const newDisplayName = `pimento ${crypto.randomUUID().slice(0, 5)}`;
            const newDescription = `hello, i am ${newDisplayName}`;

            await client.user!.update({
                displayName: newDisplayName,
                description: newDescription
            });

            assert.strictEqual(client.user.data.profile.display_name, newDisplayName, "display name should be updated");
            assert.strictEqual(client.user.data.profile.description, newDescription, "description should be updated");

            // revert changes
            await client.user.update({
                displayName: originalDisplayName,
                description: originalDescription
            });
        });

        it("should set us to online", async function () {
            await client.user.ping();
            await client.user.refresh(); // ping only optimistically updates the status field

            assert.strictEqual(client.user.data.profile.status, "active", "status should be online");
        });

        it("should update our username", async function () {
            const originalUsername = client.user.data.profile.username;
            const newUsername = `${crypto.randomUUID().slice(0, 5)}`;

            await client.user.changeUsername(newUsername, password);
            assert.strictEqual(client.user.data.profile.username, newUsername, "username should be updated");

            // revert changes

            await sleep(5000); // darflen gets mad if we change the username back too quickly
            await client.user.changeUsername(originalUsername, password);
        });
    });
});