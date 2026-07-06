const app = {
  routes: {},
  startTime: Date.now(),

  get(path, handler) {
    this.routes[`GET ${path}`] = handler;
  },

  post(path, handler) {
    this.routes[`POST ${path}`] = handler;
  },

  async handle(req, res) {
    const key = `${req.method} ${req.url.split("?")[0]}`;
    const handler = this.routes[key];

    if (!handler) {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Not found" }));
      return;
    }

    try {
      let body = "";
      if (req.method === "POST") {
        body = await new Promise((resolve) => {
          req.on("data", (chunk) => {
            body += chunk;
          });
          req.on("end", () => {
            resolve(body);
          });
        });
        req.body = body ? JSON.parse(body) : {};
      }
      await handler(req, res);
    } catch (err) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Internal server error" }));
    }
  },
};

// --- Routes ---

const dashboardHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>KCD NYC Hello App</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 20px;
    }

    .container {
      max-width: 900px;
      width: 100%;
    }

    .header {
      text-align: center;
      color: white;
      margin-bottom: 40px;
    }

    .header h1 {
      font-size: 3em;
      font-weight: 700;
      margin-bottom: 10px;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }

    .clock {
      font-size: 1.3em;
      font-weight: 300;
      letter-spacing: 2px;
      margin-top: 15px;
      padding: 15px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .banner {
      width: 100%;
      background: linear-gradient(90deg, #fbbf24 0%, #f59e0b 50%, #fbbf24 100%);
      padding: 16px 20px;
      text-align: center;
      font-size: 1.2em;
      font-weight: 600;
      color: #78350f;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
      letter-spacing: 0.5px;
    }

    .wrapper {
      margin-top: 70px;
    }

    .metrics-panel {
      background: #0f766e;
      border-radius: 12px;
      padding: 30px;
      margin-top: 30px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 25px;
    }

    .metric-card {
      text-align: center;
      color: white;
    }

    .metric-label {
      font-size: 0.9em;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #a7f3d0;
      margin-bottom: 10px;
    }

    .metric-value {
      font-size: 2.5em;
      font-weight: 700;
      color: white;
      font-family: 'Monaco', 'Courier New', monospace;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }

    .endpoints {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-top: 30px;
    }

    .card {
      background: white;
      border-radius: 12px;
      padding: 25px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
      transition: all 0.3s ease;
      text-decoration: none;
      color: inherit;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .card:hover {
      transform: translateY(-5px);
      box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
    }

    .card.health {
      border-top: 4px solid #d97706;
    }

    .card.greet {
      border-top: 4px solid #f59e0b;
    }

    .card.echo {
      border-top: 4px solid #ea580c;
    }

    .card.stats {
      border-top: 4px solid #b45309;
    }

    .card h3 {
      font-size: 1.3em;
      margin-bottom: 10px;
      color: #1f2937;
    }

    .card p {
      font-size: 0.95em;
      color: #6b7280;
      line-height: 1.5;
      margin-bottom: 15px;
    }

    .card-method {
      display: inline-block;
      font-size: 0.75em;
      font-weight: 700;
      letter-spacing: 1px;
      padding: 5px 10px;
      border-radius: 4px;
      margin-bottom: 10px;
      width: fit-content;
    }

    .card.health .card-method {
      background: #fed7aa;
      color: #92400e;
    }

    .card.greet .card-method {
      background: #fef3c7;
      color: #b45309;
    }

    .card.echo .card-method {
      background: #fed7aa;
      color: #7c2d12;
    }

    .card.stats .card-method {
      background: #fcd34d;
      color: #78350f;
    }

    .card-path {
      font-family: 'Monaco', 'Courier New', monospace;
      font-size: 0.85em;
      background: #f3f4f6;
      padding: 8px 12px;
      border-radius: 4px;
      color: #374151;
      overflow-x: auto;
      margin-top: auto;
    }

    @media (max-width: 600px) {
      .header h1 {
        font-size: 2em;
      }

      .endpoints {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>
<body>
  <div class="banner">Welcome to Srini KCD New York 2026! 🎉</div>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <h1>🚀 KCD NYC Hello App</h1>
        <div class="clock" id="clock">00:00:00</div>
      </div>

      <div class="metrics-panel">
        <div class="metric-card">
          <div class="metric-label">Requests Today</div>
          <div class="metric-value" id="requests-today">0</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Uptime</div>
          <div class="metric-value" id="uptime">00:00:00</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Active Users</div>
          <div class="metric-value" id="active-users">0</div>
        </div>
      </div>

    <div class="endpoints">
      <div class="card health">
        <div>
          <div class="card-method">GET</div>
          <h3>Health</h3>
          <p>Check the server status and uptime</p>
        </div>
        <div class="card-path">/api/health</div>
      </div>

      <div class="card greet">
        <div>
          <div class="card-method">POST</div>
          <h3>Greeting</h3>
          <p>Send a name and get a personalized greeting</p>
        </div>
        <div class="card-path">/api/greet</div>
      </div>

      <div class="card echo">
        <div>
          <div class="card-method">POST</div>
          <h3>Echo</h3>
          <p>Echo back your request with a timestamp</p>
        </div>
        <div class="card-path">/api/echo</div>
      </div>

      <div class="card stats">
        <div>
          <div class="card-method">GET</div>
          <h3>Statistics</h3>
          <p>View request counts and endpoint stats</p>
        </div>
        <div class="card-path">/api/stats</div>
      </div>
    </div>
  </div>
  </div>

  <script>
    const pageLoadTime = Date.now();

    function updateClock() {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      document.getElementById('clock').textContent = \`\${hours}:\${minutes}:\${seconds}\`;
    }

    function updateMetrics() {
      const requestsToday = Math.floor(Math.random() * 900) + 100;
      const activeUsers = Math.floor(Math.random() * 50) + 1;

      const elapsed = Math.floor((Date.now() - pageLoadTime) / 1000);
      const hours = String(Math.floor(elapsed / 3600)).padStart(2, '0');
      const minutes = String(Math.floor((elapsed % 3600) / 60)).padStart(2, '0');
      const seconds = String(elapsed % 60).padStart(2, '0');

      document.getElementById('requests-today').textContent = requestsToday;
      document.getElementById('uptime').textContent = \`\${hours}:\${minutes}:\${seconds}\`;
      document.getElementById('active-users').textContent = activeUsers;
    }

    updateClock();
    updateMetrics();
    setInterval(updateClock, 1000);
    setInterval(updateMetrics, 1000);
  </script>
</body>
</html>`;

app.get("/", (req, res) => {
  res.writeHead(200, { "Content-Type": "text/html" });
  res.end(dashboardHTML);
});

app.get("/api/health", (req, res) => {
  const uptime = Math.floor((Date.now() - app.startTime) / 1000);
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ status: "ok", uptime }));
});

app.post("/api/echo", (req, res) => {
  const receivedAt = new Date().toISOString();
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ ...req.body, receivedAt }));
});

app.post("/api/greet", (req, res) => {
  const name = req.body?.name;
  if (!name) {
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "name is required" }));
    return;
  }
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ greeting: `Hello, ${name}!` }));
});

module.exports = app;
