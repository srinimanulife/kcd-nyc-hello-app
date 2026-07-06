const { describe, it } = require("node:test");
const assert = require("node:assert");
const app = require("../src/app");

// Helper to create mock req/res
function mockReq(method, url) {
  return { method, url };
}

function mockRes() {
  const res = {
    statusCode: null,
    headers: {},
    body: "",
    writeHead(code, headers) {
      res.statusCode = code;
      res.headers = headers;
    },
    end(data) {
      res.body = data;
    },
  };
  return res;
}

describe("GET /", () => {
  it("returns hello message", async () => {
    const req = mockReq("GET", "/");
    const res = mockRes();
    await app.handle(req, res);
    assert.strictEqual(res.statusCode, 200);
    const body = JSON.parse(res.body);
    assert.strictEqual(body.message, "Hello from KCD New York!");
  });
});

describe("GET /api/health", () => {
  it("returns status ok and uptime", async () => {
    const req = mockReq("GET", "/api/health");
    const res = mockRes();
    await app.handle(req, res);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.headers["Content-Type"], "application/json");
    const body = JSON.parse(res.body);
    assert.strictEqual(body.status, "ok");
    assert.strictEqual(typeof body.uptime, "number");
    assert.ok(body.uptime >= 0);
  });

  it("uptime increases over time", async () => {
    const req1 = mockReq("GET", "/api/health");
    const res1 = mockRes();
    await app.handle(req1, res1);
    const body1 = JSON.parse(res1.body);
    const uptime1 = body1.uptime;

    await new Promise((resolve) => setTimeout(resolve, 100));

    const req2 = mockReq("GET", "/api/health");
    const res2 = mockRes();
    await app.handle(req2, res2);
    const body2 = JSON.parse(res2.body);
    const uptime2 = body2.uptime;

    assert.ok(uptime2 >= uptime1);
  });
});

describe("Unknown route", () => {
  it("returns 404", async () => {
    const req = mockReq("GET", "/nope");
    const res = mockRes();
    await app.handle(req, res);
    assert.strictEqual(res.statusCode, 404);
  });
});
