import {WebSocket, WebSocketServer} from "ws";
import { randomUUID } from 'crypto';
import type {ClientMessage, ServerMessage} from './types';

const wss = new WebSocketServer({ port: 8080});
const PALETTE = ['#e24b4a', '#378add', '#639922', '#d4537e', '#ba7517'];

const clients = new Map<string, {ws: WebSocket; color: string}>();

wss.on('connection', (ws) => {
    const id = randomUUID();
    const color = PALETTE[clients.size % PALETTE.length]!;
    clients.set(id, { ws, color });

    ws.on('error', console.error);

    const initMsg: ServerMessage = {type: 'init', id, color};
    ws.send(JSON.stringify(initMsg));

    ws.on('message', (raw) => {
        const cltMsg : ClientMessage = JSON.parse(raw.toString());
        const serverMsg : ServerMessage = {type: 'cursor', id, x: cltMsg.x,y: cltMsg.y, color};
        const serverString : string = JSON.stringify(serverMsg);
        for(const [clientId, client] of clients){
            if(clientId === id) continue;
            if(client.ws.readyState === WebSocket.OPEN){
                client.ws.send(serverString);
            }
        }
    });

    ws.on('close',() => {
        clients.delete(id);
        const leftMsg : ServerMessage = {type: 'leave',id};
        const leftString : string = JSON.stringify(leftMsg);
        for(const [clientId, client] of clients){
            if(client.ws.readyState === WebSocket.OPEN){
                client.ws.send(leftString);
            }
        }
    });
})

