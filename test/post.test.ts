import assert from "node:assert";

import { DarflenClient, Audience, OwnedPost, FeedType } from "darflen.ts";

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

describe("Posts", async function () {
    const client = new DarflenClient();

    const email = process.env.DARFLEN_EMAIL!;
    const password = process.env.DARFLEN_PASSWORD!;

    const createdPosts: OwnedPost[] = [];

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

    after(async function () {
        for (const post of createdPosts) {
            if (!post.deleted) {
                await post.delete().catch(() => {
                    console.warn("failed to delete post with id " + post.id);
                });
            }
        }
    });

    describe("create", function () {
        afterEach(async function () {
            await sleep(5000); // whateever. idk what "request is already running" is meant to mean. why send http 200 if the request is not finished??
        });

        it("should create a unlisted post with text only", function () {
            return client.posts.create("hello world", Audience.Unlisted).then((post) => {
                assert.ok(post, "post should be created");
                assert.strictEqual(post.content, "hello world", "post text should match the input");
                assert.strictEqual(post.data.audience, Audience.Unlisted, "post audience should be unlisted");

                createdPosts.push(post);
            }).catch((err) => {
                assert.fail("failed to create post with text only, error: " + err);
            });
        });

        it("should create a repost", function () {
            if (createdPosts.length === 0) {
                this.skip();
            }

            const toRepost = createdPosts[0];

            return toRepost.repost({
                text: "reposting this",
                audience: Audience.Unlisted
            }).then((post) => {
                assert.ok(post, "post should be created");
                assert.strictEqual(post.content, "reposting this", "post text should match the input");
                assert.strictEqual(post.data.audience, Audience.Unlisted, "post audience should be unlisted");
                createdPosts.push(post);
            }).catch((err) => {
                assert.fail("failed to create repost, error: " + err);
            });
        });

        it("should create a poll post", function () {
            return client.posts.create({
                text: "which is better?",
                audience: Audience.Unlisted,
                poll: {
                    choices: ["cats", "dogs"],
                    expires: 1
                }
            }).then((post) => {
                assert.ok(post, "post should be created");
                assert.strictEqual(post.content, "which is better?", "post text should match the input");
                assert.strictEqual(post.data.audience, Audience.Unlisted, "post audience should be unlisted");
                assert.ok(post.poll, "post should have a poll");
                assert.strictEqual(post.poll.choices.length, 2, "poll should have 2 choices");
                assert.strictEqual(post.poll.choices[0].text, "cats", "first poll choice should be 'cats'");
                assert.strictEqual(post.poll.choices[1].text, "dogs", "second poll choice should be 'dogs'");
                createdPosts.push(post);
            })
        })
    })

    describe("edit", function () {
        let item = createdPosts[0];

        beforeEach(function () {
            if (!createdPosts[0] || createdPosts[0].deleted) {
                if (!item) console.log("skipping because there is no post to edit");
                else console.log("skipping because the post to edit is deleted");
                this.skip();
            } else item = createdPosts[0];
        });

        it("should pin and unpin a post", function () {
            return item.togglePin().then(async () => {
                await item.refresh(); // update the post data to reflect the pinning
                assert.ok(item.pinned, "post should be pinned");
                await item.togglePin().then(() => {
                    assert.ok(!item.pinned, "post should be unpinned");
                });
            })
        });

        it("should edit a post's text", function () {
            return item.edit("edited text").then(() => {
                assert.strictEqual(item.content, "edited text", "post content should be updated to the new text");
            }).catch((err) => {
                assert.fail("failed to edit post text, error: " + err);
            });
        });
    });

    describe("get", function () {
        it("should get a post by id", function () {
            return client.posts.get("d256046016d227e9c51177c0").then((post) => { // https://darflen.com/posts/d256046016d227e9c51177c0, "Hello world!" by paradock (7963f91bfc853c5ccf23441a)
                assert.ok(post, "post should be fetched");
                assert.strictEqual(post.id, "d256046016d227e9c51177c0", "fetched post id should match the requested id");
                assert.strictEqual(post.content, "Hello world!", "post content should match the original content");
                assert.strictEqual(post.author.id, "7963f91bfc853c5ccf23441a", "post author id should match paradock's profile id");
            })
        });

        it("should get the reposts of a post", function () {
            return client.posts.getReposts("d256046016d227e9c51177c0").then((reposts) => {
                assert.ok(reposts.data.length > 0, "should be at least one repost");
            }).catch(() => {
                this.skip();
            })
        })

        describe("feed", function () {
            it("should get the recent feed", function () {
                return client.posts.getFeed(FeedType.Recent, {
                    limit: 5
                }).then((posts) => {
                    assert.ok(posts.data.length > 0, "feed should return some posts");
                    assert.ok(posts.data.length <= 5, "feed should return no more than the requested limit of posts");
                })
            });

            it("should get the loved feed", function () {
                return client.posts.getFeed(FeedType.Loves).then((posts) => {
                    const [p1, p2] = posts.data;
                    assert.ok(posts.data.length > 0, "feed should return some posts");
                    assert.ok(p1.stats.loves >= p2.stats.loves, "posts should be sorted by loves in descending order");
                })
            })
        });
    })

    describe("delete", function () {
        it("should delete a post", function () {
            if (createdPosts.length === 0) {
                this.skip();
            }

            return createdPosts[0].delete().then(() => {
                assert.ok(createdPosts[0].deleted, "post should be marked as deleted");
            }).catch((err) => {
                assert.fail("failed to delete post, error: " + err);
            });
        });
    });
});