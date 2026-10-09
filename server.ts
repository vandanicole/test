import express from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import net from 'net';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);

// Configurable UUID - can be set via env var or defaults to the app's default UUID
const SERVER_UUID = (process.env.UUID || 'a89c3ef1-285b-4221-a53d-8869c943fbe2').replace(/-/g, '').toLowerCase();

// API endpoint to check server status and Railway outgoing IP
app.get('/api/status', async (req, res) => {
  try {
    const ipRes = await fetch('https://api.ipify.org?format=json');
    const ipData = (await ipRes.json()) as { ip: string };
    res.json({
      status: 'online',
      railwayIp: ipData.ip,
      uuid: process.env.UUID || 'a89c3ef1-285b-4221-a53d-8869c943fbe2',
      vlessActive: true,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    res.json({
      status: 'online',
      railwayIp: 'available',
      uuid: process.env.UUID || 'a89c3ef1-285b-4221-a53d-8869c943fbe2',
      vlessActive: true,
      error: err.message,
    });
  }
});

// Create WebSocket server for VLESS proxying
const wss = new WebSocketServer({ noServer: true });

function formatUuid(buf: Buffer): string {
  return buf.toString('hex').toLowerCase();
}

wss.on('connection', (ws: WebSocket, req) => {
  let isHeaderParsed = false;
  let targetSocket: net.Socket | null = null;
  const earlyDataBuffer: Buffer[] = [];

  ws.on('message', (data: Buffer | ArrayBuffer | Buffer[], isBinary: boolean) => {
    const chunk = Buffer.isBuffer(data) ? data : Buffer.from(data as ArrayBuffer);

    if (!isHeaderParsed) {
      if (chunk.length < 18) {
        ws.close();
        return;
      }

      // VLESS Protocol Parser
      const version = chunk[0];
      const clientUuid = formatUuid(chunk.subarray(1, 17));

      // Optional UUID validation (allow either match or default)
      if (SERVER_UUID && clientUuid !== SERVER_UUID) {
        console.warn(`[VLESS] Invalid UUID received: ${clientUuid}`);
        ws.close();
        return;
      }

      const optLen = chunk[17];
      let cursor = 18 + optLen;

      if (cursor >= chunk.length) {
        ws.close();
        return;
      }

      const command = chunk[cursor]; // 1: TCP, 2: UDP
      cursor += 1;

      if (command !== 1 && command !== 2) {
        ws.close();
        return;
      }

      const port = chunk.readUInt16BE(cursor);
      cursor += 2;

      const addrType = chunk[cursor];
      cursor += 1;

      let address = '';
      if (addrType === 1) {
        // IPv4
        address = chunk.subarray(cursor, cursor + 4).join('.');
        cursor += 4;
      } else if (addrType === 2) {
        // Domain
        const domainLen = chunk[cursor];
        cursor += 1;
        address = chunk.subarray(cursor, cursor + domainLen).toString('utf-8');
        cursor += domainLen;
      } else if (addrType === 3) {
        // IPv6
        const ipv6Parts = [];
        for (let i = 0; i < 16; i += 2) {
          ipv6Parts.push(chunk.readUInt16BE(cursor + i).toString(16));
        }
        address = ipv6Parts.join(':');
        cursor += 16;
      } else {
        ws.close();
        return;
      }

      // Send VLESS response header (version 0, 0 addon length)
      ws.send(Buffer.from([version, 0]), { binary: true });
      isHeaderParsed = true;

      // Extract raw payload remaining in the first packet
      const rawPayload = chunk.subarray(cursor);

      // Connect from Railway container to the target host
      targetSocket = net.connect({ host: address, port }, () => {
        if (rawPayload.length > 0) {
          targetSocket?.write(rawPayload);
        }
        // Flush any buffered early data
        while (earlyDataBuffer.length > 0) {
          const item = earlyDataBuffer.shift();
          if (item) targetSocket?.write(item);
        }
      });

      targetSocket.on('data', (remoteData) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(remoteData, { binary: true });
        }
      });

      targetSocket.on('error', (err) => {
        targetSocket?.destroy();
        ws.close();
      });

      targetSocket.on('close', () => {
        ws.close();
      });
    } else {
      // Subsequent data packets
      if (targetSocket && !targetSocket.destroyed) {
        targetSocket.write(chunk);
      } else {
        earlyDataBuffer.push(chunk);
      }
    }
  });

  ws.on('close', () => {
    targetSocket?.destroy();
  });

  ws.on('error', () => {
    targetSocket?.destroy();
  });
});

// Handle HTTP upgrade for WebSocket
server.on('upgrade', (request, socket, head) => {
  const url = new URL(request.url || '', `http://${request.headers.host}`);
  // Match any path starting with /ws
  if (url.pathname.startsWith('/ws')) {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  } else {
    socket.destroy();
  }
});

// Production static file serving or Vite in dev
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';
  const PORT = Number(process.env.PORT) || 3000;

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] Running on http://0.0.0.0:${PORT}`);
    console.log(`[VLESS] WebSocket endpoint active at /ws/*`);
  });
}

startServer();
