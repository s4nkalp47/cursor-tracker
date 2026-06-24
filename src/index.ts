import { WebSocket,WebSocketServer } from 'ws';

interface ExtWebSocket extends WebSocket{
    isAlive? : boolean;
}

const wss = new WebSocketServer({ port: 8080});

wss.on('connection', function connection(ws){
    ws.on('error', console.error);

    ws.on('message', function message(data){
        console.log('received: %s', data);
    });

    ws.send('something');
});

