# Feature Roadmap

Features for the Claude Code developer agent to implement, one per run.

## Features

- [x] **Health endpoint** — `GET /api/health` returns `{ "status": "ok", "uptime": <seconds> }`
- [x] **Dashboard page** — `GET /` returns a styled HTML page (not JSON) showing the app name, a live clock, and links to all available API endpoints as clickable cards
- [x] **Gold theme** — Update the dashboard background gradient from purple (`#667eea` → `#764ba2`) to gold (`#f59e0b` → `#d97706`), and update card accent colors to match a warm gold palette
- [x] **Welcome banner** — Add a bold yellow banner across the top of the dashboard that says "Welcome to Srini KCD New York 2026! 🎉"
- [x] **Greeting endpoint** — `POST /api/greet` accepts `{ "name": "..." }` and returns `{ "greeting": "Hello, <name>!" }`
- [x] **Echo endpoint** — `POST /api/echo` returns the request body back as JSON with a `receivedAt` timestamp
- [x] **Live metrics panel** — Add a panel below the welcome banner on the dashboard showing 3 live-updating counters: "Requests Today" (random 100-999), "Uptime" (formatted as HH:MM:SS counting up from page load), and "Active Users" (random 1-50). Use a dark teal card background (`#0f766e`), white text, and update all counters every second with JavaScript. Make it visually striking so the audience can see it change in real time.
- [x] **Dark sidebar** — Add a fixed left-side navigation sidebar (width 220px) to the dashboard. Dark charcoal background (`#1e293b`), white text. At the top: a small rocket emoji followed by "KCD NYC" in bold. Below: nav links (Home, Health, Greet, Echo) styled as rounded buttons that are gold on hover (`#f59e0b`). Bottom of sidebar: a green pulsing dot followed by "System Online" in small text. The main content area should shift right by the sidebar width using `margin-left`. No backend changes needed — HTML/CSS/JS only.
- [x] **Stats endpoint** — `GET /api/stats` returns `{ "totalRequests": <count>, "routes": [...] }` tracking request counts
