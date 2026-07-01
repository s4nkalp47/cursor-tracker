// ---- Canvas setup ----
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);
const cursors = new Map();
let myId = null;
// ---- WebSocket connection ----
const ws = new WebSocket('ws://localhost:8080');
ws.addEventListener('message', (event) => {
    const msg = JSON.parse(event.data);
    switch (msg.type) {
        case 'init':
            myId = msg.id;
            break;
        case 'cursor':
            cursors.set(msg.id, { x: msg.x, y: msg.y, color: msg.color });
            break;
        case 'leave':
            cursors.delete(msg.id);
            break;
    }
});
// ---- Throttled sender ----
// TODO 2: write a throttle function. Something like:
//   let lastSent = 0;
//   function sendCursor(x: number, y: number) {
//     const now = Date.now();
//     if (now - lastSent < 33) return;  // ~30 sends/sec
//     lastSent = now;
//     ... build ClientMessage, JSON.stringify, ws.send ...
//   }
let lastSent = 0;
function sendCursor(x, y) {
    const now = Date.now();
    if (now - lastSent < 33)
        return;
    lastSent = now;
    if (ws.readyState !== WebSocket.OPEN)
        return;
    const msg = { type: 'cursor', x, y };
    ws.send(JSON.stringify(msg));
}
canvas.addEventListener('mousemove', (e) => {
    const x = e.clientX / canvas.width;
    const y = e.clientY / canvas.height;
    sendCursor(x, y);
});
// ---- Render loop ----
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const [id, cursor] of cursors) {
        if (id === myId)
            continue;
        const x = cursor.x * canvas.width;
        const y = cursor.y * canvas.height;
        ctx.beginPath();
        ctx.arc(x, y, 10, 0, Math.PI * 2);
        ctx.fillStyle = cursor.color;
        ctx.fill();
    }
    requestAnimationFrame(draw);
}
requestAnimationFrame(draw);
export {};
