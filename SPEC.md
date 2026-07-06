# Feature Roadmap

Features for the Claude Code developer agent to implement, one per run.

## Features

- [x] **Health endpoint** — `GET /api/health` returns `{ "status": "ok", "uptime": <seconds> }`
- [ ] **Dashboard page** — `GET /` returns a styled HTML page (not JSON) showing the app name, a live clock, and links to all available API endpoints as clickable cards
- [ ] **Greeting endpoint** — `POST /api/greet` accepts `{ "name": "..." }` and returns `{ "greeting": "Hello, <name>!" }`
- [ ] **Echo endpoint** — `POST /api/echo` returns the request body back as JSON with a `receivedAt` timestamp
- [ ] **Stats endpoint** — `GET /api/stats` returns `{ "totalRequests": <count>, "routes": [...] }` tracking request counts