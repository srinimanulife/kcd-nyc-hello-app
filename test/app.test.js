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

  it("includes sidebar HTML structure", async () => {
    const req = mockReq("GET", "/");
    const res = mockRes();
    await app.handle(req, res);
    assert.strictEqual(res.statusCode, 200);
    // Verify sidebar div is present
    assert.ok(res.body.includes("class=\"sidebar\""));
    // Verify sidebar header with rocket emoji
    assert.ok(res.body.includes("class=\"sidebar-header\""));
    assert.ok(res.body.includes("🚀 KCD NYC"));
    // Verify sidebar navigation
    assert.ok(res.body.includes("class=\"sidebar-nav\""));
    assert.ok(res.body.includes("class=\"nav-link\""));
    // Verify all nav links are present
    assert.ok(res.body.includes(">Home</a>"));
    assert.ok(res.body.includes(">Health</a>"));
    assert.ok(res.body.includes(">Greet</a>"));
    assert.ok(res.body.includes(">Echo</a>"));
    // Verify status indicator
    assert.ok(res.body.includes("class=\"status-indicator\""));
    assert.ok(res.body.includes("System Online"));
  });

  it("includes sidebar CSS styling", async () => {
    const req = mockReq("GET", "/");
    const res = mockRes();
    await app.handle(req, res);
    assert.strictEqual(res.statusCode, 200);
    // Verify sidebar CSS properties
    assert.ok(res.body.includes("position: fixed"));
    assert.ok(res.body.includes("width: 220px"));
    assert.ok(res.body.includes("background: #1e293b"));
    assert.ok(res.body.includes("z-index: 2000"));
    // Verify nav-link hover styling (gold color)
    assert.ok(res.body.includes("#f59e0b"));
    // Verify status indicator animation
    assert.ok(res.body.includes("animation: pulse"));
  });

  it("includes responsive CSS for sidebar", async () => {
    const req = mockReq("GET", "/");
    const res = mockRes();
    await app.handle(req, res);
    assert.strictEqual(res.statusCode, 200);
    // Verify responsive breakpoint hides sidebar on screens < 900px
    assert.ok(res.body.includes("@media (max-width: 900px)"));
    assert.ok(res.body.includes(".sidebar {"));
    assert.ok(res.body.includes("display: none"));
    // Verify body margin-left added to accommodate sidebar
    assert.ok(res.body.includes("margin-left: 220px"));
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

describe("GET /api/stats", () => {
  it("returns 200 with correct JSON structure", async () => {
    const req = mockReq("GET", "/api/stats");
    const res = mockRes();
    await app.handle(req, res);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.headers["Content-Type"], "application/json");
    const body = JSON.parse(res.body);
    assert.ok(body.hasOwnProperty("totalRequests"));
    assert.ok(body.hasOwnProperty("routes"));
  });

  it("validates totalRequests is a number", async () => {
    const req = mockReq("GET", "/api/stats");
    const res = mockRes();
    await app.handle(req, res);
    const body = JSON.parse(res.body);
    assert.strictEqual(typeof body.totalRequests, "number");
    assert.ok(body.totalRequests >= 0);
  });

  it("validates routes array contains objects with route and requests fields", async () => {
    const req = mockReq("GET", "/api/stats");
    const res = mockRes();
    await app.handle(req, res);
    const body = JSON.parse(res.body);
    assert.ok(Array.isArray(body.routes));
    body.routes.forEach((route) => {
      assert.ok(route.hasOwnProperty("route"));
      assert.ok(route.hasOwnProperty("requests"));
      assert.strictEqual(typeof route.route, "string");
      assert.strictEqual(typeof route.requests, "number");
    });
  });

  it("totalRequests equals sum of all route counts", async () => {
    // Make some requests to various endpoints to populate counts
    await app.handle(mockReq("GET", "/api/health"), mockRes());
    await app.handle(mockReq("POST", "/api/greet", { name: "Test" }), mockRes());

    const req = mockReq("GET", "/api/stats");
    const res = mockRes();
    await app.handle(req, res);
    const body = JSON.parse(res.body);

    const calculatedSum = body.routes.reduce((sum, route) => sum + route.requests, 0);
    assert.strictEqual(body.totalRequests, calculatedSum);
  });

  it("tracks request counts correctly after making requests to various endpoints", async () => {
    // Reset request counts for a clean test
    app.requestCounts = {};

    // Make specific requests
    await app.handle(mockReq("GET", "/api/health"), mockRes());
    await app.handle(mockReq("GET", "/api/health"), mockRes());
    await app.handle(mockReq("POST", "/api/greet", { name: "Alice" }), mockRes());

    const req = mockReq("GET", "/api/stats");
    const res = mockRes();
    await app.handle(req, res);
    const body = JSON.parse(res.body);

    // Verify specific route counts
    const healthRoute = body.routes.find((r) => r.route === "GET /api/health");
    const greetRoute = body.routes.find((r) => r.route === "POST /api/greet");

    assert.ok(healthRoute);
    assert.strictEqual(healthRoute.requests, 2);
    assert.ok(greetRoute);
    assert.strictEqual(greetRoute.requests, 1);
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
