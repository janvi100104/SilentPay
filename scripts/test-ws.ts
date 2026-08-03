import { WebSocket } from 'ws';
(globalThis as any).WebSocket = WebSocket;

async function testSRS() {
  try {
    const res = await fetch('http://srs.midnight.network');
    console.log('SRS reachable:', res.status);
  } catch (e: any) {
    console.log('SRS fetch error:', e.message);
  }
  
  try {
    const ws = new WebSocket('ws://127.0.0.1:9944');
    ws.on('open', () => {
      console.log('Node WS connected');
      ws.send(JSON.stringify({ id: 1, jsonrpc: '2.0', method: 'system_health', params: [] }));
    });
    ws.on('message', (data) => {
      console.log('Node WS response:', data.toString().slice(0, 200));
      ws.close();
    });
    ws.on('error', (e: any) => console.log('Node WS error:', e.message));
    setTimeout(() => { ws.terminate(); process.exit(0); }, 5000);
  } catch (e: any) {
    console.log('Node WS error:', e.message);
  }
}

testSRS();
