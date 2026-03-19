import assert from "node:assert";

import { DarflenClient } from "../dist/index.js";

const client = new DarflenClient();
await client.login(process.env.DARFLEN_TOKEN);

describe("Post", function () {
  describe("create a new post", function () {
    it("should create a new post", function () {
      client.posts
    });
  });
});