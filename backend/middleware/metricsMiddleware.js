import promClient from "prom-client";

// Create a Registry to register the metrics
const register = new promClient.Registry();

// Add a default label which is added to all metrics
register.setDefaultLabels({
  app: "labbuddy-backend",
});

// Enable the collection of default metrics (CPU, memory, etc.)
promClient.collectDefaultMetrics({ register });

// Create custom metrics for LabBuddy
const httpRequestDuration = new promClient.Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.1, 0.5, 1, 2, 5], // Response time buckets in seconds
});

const httpRequestsTotal = new promClient.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status_code"],
});

const activeUsers = new promClient.Gauge({
  name: "active_websocket_connections",
  help: "Number of active WebSocket connections",
});

const codeExecutions = new promClient.Counter({
  name: "code_executions_total",
  help: "Total number of code executions",
  labelNames: ["language", "status"],
});

const aiRequests = new promClient.Counter({
  name: "ai_requests_total",
  help: "Total number of AI requests",
  labelNames: ["endpoint", "status"],
});

const databaseOperations = new promClient.Counter({
  name: "database_operations_total",
  help: "Total number of database operations",
  labelNames: ["operation", "collection", "status"],
});

const authAttempts = new promClient.Counter({
  name: "auth_attempts_total",
  help: "Total number of authentication attempts",
  labelNames: ["type", "status"], // type: login/register, status: success/failure
});

// Register custom metrics
register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestsTotal);
register.registerMetric(activeUsers);
register.registerMetric(codeExecutions);
register.registerMetric(aiRequests);
register.registerMetric(databaseOperations);
register.registerMetric(authAttempts);

// Middleware to collect HTTP metrics
export const metricsMiddleware = (req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route ? req.route.path : req.path;

    httpRequestDuration
      .labels(req.method, route, res.statusCode)
      .observe(duration);

    httpRequestsTotal.labels(req.method, route, res.statusCode).inc();
  });

  next();
};

export {
  register,
  activeUsers,
  codeExecutions,
  aiRequests,
  databaseOperations,
  authAttempts,
};
