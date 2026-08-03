import { WebSocket } from 'ws';
console.log('Connecting to Preview indexer WS...');
const ws = new WebSocket('wss://indexer.preview.midnight.network/api/v4/graphql/ws', {
  headers: { 'Sec-WebSocket-Protocol': 'graphql-transport-ws' }
});
ws.on('open', () => { console.log('OPEN - connection established'); ws.close(); });
ws.on('error', (e) => { console.log('ERROR:', e.message); });
ws.on('close', (c,r) => { console.log('CLOSE:', c); process.exit(0); });
setTimeout(() => { console.log('TIMEOUT - no response in 10s'); process.exit(1); }, 10000);
