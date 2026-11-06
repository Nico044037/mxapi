const crypto = require("node:crypto");
const VERSION = "1";
const cors = "Content-Type, X-MX-Plugin-Key";

function reply(res, status, payload) {
  return res.status(status).json({
    success: status >= 200 && status < 300,
    apiVersion: VERSION,
    timestamp: new Date().toISOString(),
    ...payload
  });
}

function unavailable(res) {
  return reply(res, 503, {
    error: {
      code: "PLUGIN_NOT_CONNECTED",
      message: "The MXServers Minecraft plugin is not installed or has not connected yet."
    }
  });
}

function validKey(req) {
  const expected = process.env.MX_PLUGIN_API_KEY;
  const provided = req.headers["x-mx-plugin-key"];
  if (!expected || typeof provided !== "string") return false;
  const a = Buffer.from(expected);
  const b = Buffer.from(provided);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", cors);
  res.setHeader("Cache-Control", "no-store");
  if (req.method === "OPTIONS") return res.status(204).end();

  const path = Array.isArray(req.query.path)
    ? req.query.path.filter(Boolean).join("/")
    : String(req.query.path || "");
  if (req.method === "GET" && path === "health") {
    return reply(res, 200, {
      service: "MXServers Plugin API",
      status: "online",
      pluginConnected: false,
      pluginConfigured: Boolean(process.env.MX_PLUGIN_API_KEY),
      endpoints: {
        status: "/api/v1/servers/{serverId}/status",
        players: "/api/v1/servers/{serverId}/players",
        map: "/api/v1/servers/{serverId}/map",
        heartbeat: "/api/v1/plugin/heartbeat"
      }
    });
  }

  if (path === "plugin/heartbeat" || path === "plugin/events") {
    if (req.method !== "POST") {
      res.setHeader("Allow", "POST, OPTIONS");
      return reply(res, 405, { error: { code: "METHOD_NOT_ALLOWED", message: "Use POST." } });
    }
    if (!process.env.MX_PLUGIN_API_KEY) {
      return reply(res, 503, {
        error: {
          code: "API_KEY_NOT_CONFIGURED",
          message: "Configure MX_PLUGIN_API_KEY in the Vercel mxapi project before enabling plugin authentication."
        }
      });
    }
    if (!validKey(req)) {
      return reply(res, 401, { error: { code: "UNAUTHORIZED", message: "A valid X-MX-Plugin-Key header is required." } });
    }
    return unavailable(res);
  }

  if (req.method === "GET" && /^servers\/[^/]+\/(status|players|map)$/.test(path)) {
    return unavailable(res);
  }

  return reply(res, 404, {
    error: { code: "NOT_FOUND", message: "No API route matches this path." }
  });
};
