/**
 * Cloudflare Worker Reverse Proxy for PXPanel
 * پشتیبانی از VLESS WebSocket و XHTTP
 */

const BACKEND_DOMAIN = "your-app-name.up.railway.app";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const upgradeHeader = request.headers.get("Upgrade");

    const targetUrl = new URL(request.url);
    targetUrl.hostname = BACKEND_DOMAIN;
    targetUrl.protocol = "https:";

    const newHeaders = new Headers(request.headers);
    newHeaders.set("Host", BACKEND_DOMAIN);
    newHeaders.set("X-Forwarded-Host", url.hostname);
    newHeaders.set("X-Real-IP", request.headers.get("CF-Connecting-IP") || "127.0.0.1");

    if (upgradeHeader && upgradeHeader.toLowerCase() === "websocket") {
      return fetch(targetUrl.toString(), {
        method: request.method,
        headers: newHeaders,
        body: request.body,
      });
    }

    try {
      const response = await fetch(targetUrl.toString(), {
        method: request.method,
        headers: newHeaders,
        body: request.method !== "GET" && request.method !== "HEAD" ? request.body : null,
        redirect: "follow",
      });
      return response;
    } catch (err) {
      return new Response("Gateway Error: " + err.message, {
        status: 502,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }
  },
};
