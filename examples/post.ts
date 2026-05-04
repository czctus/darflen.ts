import { Audience, DarflenClient } from "darflen.ts";

const client = new DarflenClient();
await client.login(process.env.EMAIL!, process.env.PASSWORD!);

const post = await client.posts.create({
    text: "This is my first post!",
    audience: Audience.Public
});

console.log(post.id);