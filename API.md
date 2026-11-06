# MXServers Plugin API

Base URL: `https://api.mxservers.online/api/v1`

The API routes and contract are being prepared for the future Minecraft plugin. **The plugin is not implemented or installed yet.** Until it connects, data endpoints return `503 PLUGIN_NOT_CONNECTED`.

## Routes

- `GET /health` — API availability and plugin connection state.
- `GET /servers/{serverId}/status` — status and player counts.
- `GET /servers/{serverId}/players` — online player list.
- `GET /servers/{serverId}/map` — configured map provider and URL.
- `POST /plugin/heartbeat` — authenticated plugin heartbeat and server registration.
- `POST /plugin/events` — authenticated plugin event ingestion (reserved).

Plugin requests must send `X-MX-Plugin-Key`. Keep this key private: configure it as the Vercel environment variable `MX_PLUGIN_API_KEY` and in the future plugin's private config. Never put it in dashboard/browser JavaScript.

## Heartbeat payload

```json
{
  "serverId": "main",
  "serverName": "MXServers SMP",
  "minecraftVersion": "1.21.8",
  "onlinePlayers": 0,
  "maxPlayers": 100,
  "players": [],
  "map": {
    "provider": "bluemap",
    "publicUrl": "https://map.mxservers.online"
  }
}
```

The current handler is a route scaffold: it checks the API key and returns an explicit not-connected response. It does not store heartbeats or player data yet. A persistent store and the plugin implementation are still required for live data.

## Responses

Responses include `success`, `apiVersion`, and `timestamp`. Errors include `error.code` and `error.message`. See `openapi.yaml` for the OpenAPI 3.1 contract.
