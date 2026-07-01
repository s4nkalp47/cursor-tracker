# cursor-tracker

A Figma-style live cursor presence tracker built with Node.js, TypeScript, and the WebSocket protocol. Every connected client broadcasts their mouse position in real time; all other clients render it as a colored dot on an HTML canvas.

Built to demonstrate high-frequency WebSocket message handling, server-side broadcast logic, and decoupled render loops — patterns that show up in collaborative tools, multiplayer games, and real-time dashboards.

---

## Features

- Each client is assigned a unique ID and color on connect
- Mouse position is throttled to ~30 sends/sec before hitting the wire
- Coordinates are normalized to a 0–1 range so cursors land correctly across different screen sizes
- Canvas render loop runs on `requestAnimationFrame`, decoupled from network message timing
- Disconnected clients are removed from all peers instantly via a `leave` broadcast

---

## Tech Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **WebSocket server**: [`ws`](https://github.com/websockets/ws)
- **Client**: Vanilla JS + HTML Canvas API (no framework)

---

## Project Structure

```
cursor-tracker/
├── src/
│   ├── types.ts       # Shared ClientMessage / ServerMessage protocol types
│   ├── server.ts      # WebSocket server: connection, broadcast, presence
│   └── client.ts      # Browser client: sender, message handler, render loop
├── public/
│   ├── index.html     # Canvas host page
│   └── client.js      # Compiled client output (from tsc)
├── tsconfig.json
└── package.json
```

---

## Getting Started

**Install dependencies**
```bash
npm install
```

**Compile the client**
```bash
npx tsc
```

**Start the WebSocket server** (terminal 1)
```bash
npx tsx src/server.ts
```

**Serve the client** (terminal 2)
```bash
npx serve public
```

Open `http://localhost:3000` in two browser tabs. Move your mouse in one — a colored dot appears in the other.

---

## How It Works

### Protocol

Three message types cross the wire, defined in `types.ts`:

```ts
// Server → client on connect
{ type: 'init'; id: string; color: string }

// Server → all other clients on mousemove
{ type: 'cursor'; id: string; x: number; y: number; color: string }

// Server → all remaining clients on disconnect
{ type: 'leave'; id: string }
```

### Throttle

Raw `mousemove` events fire hundreds of times per second. The client checks elapsed time since the last send and drops any event that arrives within 33ms of the previous one (~30 sends/sec max). This keeps the socket from being flooded without making cursor movement feel laggy.

### Coordinate Normalization

Raw pixel coordinates are divided by canvas dimensions before sending (`x / canvas.width`, `y / canvas.height`), producing values in the 0–1 range. Recipients multiply back by their own canvas dimensions — so a cursor at 40% across a 1920px screen lands at 40% across a 1280px screen too.

### Render Loop

The `onmessage` handler only writes into a local `Map<id, {x, y, color}>`. A separate `requestAnimationFrame` loop reads that map and redraws every frame, independent of when messages arrive. This decouples frame rate from network jitter and is the same pattern used in game engines and collaborative editors.

---

## Possible Extensions

- **Cursor labels** — send a username on connect, render it with `ctx.fillText` next to each dot
- **Lerp smoothing** — interpolate between last-known and current position each frame to eliminate jumpiness between throttled updates
- **Reconnection handling** — automatically reconnect if the WebSocket drops
- **Dockerize** — single `docker-compose up` to start both server and static file serving
- **Deploy** — run the server on an EC2 instance, serve the client via S3 or nginx
