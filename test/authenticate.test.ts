import assert from "node:assert";

import { DarflenClient, authenticate } from "darflen.ts";

describe("Authenticate", function () {
  let client: DarflenClient;
  let token: string;

  const email = process.env.DARFLEN_EMAIL!;
  const password = process.env.DARFLEN_PASSWORD!;

  function login() {
    if (token!) {
      return client.login(token);
    } else return client.login(email, password)
  }

  beforeEach(async function () {
    client = new DarflenClient();
    if (!email || !password) {
      console.warn("skipping because there is no email or password provided in environment variables");
      this.skip();
    } // we can't test authentication if credentials are not provided
  });

  describe("login", function () {
    it("should generate a token", function () {
      return authenticate(email, password).then((generatedToken) => {
        assert.ok(generatedToken, "token should be generated");
        token = generatedToken;
      }).catch((err) => {
        assert.fail("authentication failed, error: " + err);
      })
    });

    it("should login with valid credentials", function () {
      return login().then(() => {
        assert.ok(client.authenticated, "client should be authenticated after login");
      });
    });

    it("should fail with invalid credentials", function () {
      return client.login("invalid_token").then(() => {
        assert.fail("login should have failed with invalid token");
      }).catch((err) => {
        assert.ok(err, "error should be thrown for invalid token");
      });
    })
  });
  describe("logout", function () {
    it("should logout successfully", function () {
      return login().then(() => {
        return client.logout().then(() => {
          assert.ok(!client.authenticated, "client should not be authenticated after logout");
        }).catch((err) => {
          assert.fail("logout should have succeeded, but failed with error: " + err);
        });
      }).catch(() => {
        assert.fail("authentication failed, cannot test logout");
      })
    });
  })
});
