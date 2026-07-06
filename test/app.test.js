const { describe, it } = require("node:test");
const assert = require("node:assert");
const app = require("../src/app");

// Helper to create mock req/res
function mockReq(method, url, bodyData = null) {
  const listeners = {};
  const req = {
    method,
    url,
    on(event, callback) {
      listeners[event] = callback;
    },
    emit(event, data) {
      if (listeners[event]) {
        listeners[event](data);
      }
    },
  };

  // For POST requests, simulate data stream
  if (method === "POST" && bodyData !== null) {
    setImmediate(() => {
      const jsonData = JSON.stringify(bodyData);
      req.emit("data", jsonData);
      req.emit("end");
    });
  } else if (method === "POST") {
    setImmediate(() => {
      req.emit("end");
    });
  }

  return req;
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
  it("returns HTML dashboard page", async () => {
    const req = mockReq("GET", "/");
    const res = mockRes();
    await app.handle(req, res);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.headers["Content-Type"], "text/html");
    assert.ok(res.body.includes("<!DOCTYPE html>"));
    assert.ok(res.body.includes("KCD NYC Hello App"));
    assert.ok(res.body.includes("id=\"clock\""));
    assert.ok(res.body.includes("/api/health"));
    assert.ok(res.body.includes("/api/greet"));
    assert.ok(res.body.includes("/api/echo"));
    assert.ok(res.body.includes("/api/stats"));
    // Verify welcome banner is present
    assert.ok(res.body.includes("Welcome to Srini KCD New York 2026! 🎉"));
    assert.ok(res.body.includes("class=\"banner\""));
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

describe("POST /api/echo", () => {
  it("returns echo with data and timestamp", async () => {
    const req = mockReq("POST", "/api/echo", { message: "hello" });
    const res = mockRes();
    await app.handle(req, res);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.headers["Content-Type"], "application/json");
    const body = JSON.parse(res.body);
    assert.strictEqual(body.message, "hello");
    assert.ok(body.receivedAt);
    assert.ok(typeof body.receivedAt === "string");
  });

  it("returns timestamp with empty body", async () => {
    const req = mockReq("POST", "/api/echo", {});
    const res = mockRes();
    await app.handle(req, res);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.headers["Content-Type"], "application/json");
    const body = JSON.parse(res.body);
    assert.ok(body.receivedAt);
    assert.ok(typeof body.receivedAt === "string");
  });
});

describe("POST /api/greet", () => {
  it("returns greeting with valid name", async () => {
    const req = mockReq("POST", "/api/greet", { name: "Alice" });
    const res = mockRes();
    await app.handle(req, res);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.headers["Content-Type"], "application/json");
    const body = JSON.parse(res.body);
    assert.strictEqual(body.greeting, "Hello, Alice!");
  });

  it("returns 400 error when name is missing", async () => {
    const req = mockReq("POST", "/api/greet", {});
    const res = mockRes();
    await app.handle(req, res);
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.headers["Content-Type"], "application/json");
    const body = JSON.parse(res.body);
    assert.strictEqual(body.error, "name is required");
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
