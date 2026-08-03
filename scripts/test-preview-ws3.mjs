import WebSocket from 'ws';

// Try WITHOUT protocol, and also with different headers
console.log('Try 1: No subprotocol');
let ws1 = new WebSocket('wss://indexer.preview.midnight.network/api/v4/graphql/ws');
ws1.on('open', () => console.log('  OPEN!'));
ws1.on('error', (e) => console.log('  ERROR:', e.message));
ws1.on('close', (c) => console.log('  CLOSE:', c));

await new Promise(r => setTimeout(r, 3000));

console.log('\nTry 2: graphql-ws protocol');
let ws2 = new WebSocket('wss://indexer.preview.midnight.network/api/v4/graphql/ws', ['graphql-ws']);
ws2.on('open', () => { console.log('  OPEN!'); ws2.send(JSON.stringify({ type: 'ConnectionInit' })); });
ws2.on('message', (d) => console.log('  MSG:', d.toString().slice(0,200)));
ws2.on('error', (e) => console.log('  ERROR:', e.message));
ws2.on('close', (c) => console.log('  CLOSE:', c));

await new Promise(r => setTimeout(r, 3000));

console.log('\nTry 3: HTTP upgrade test');
const resp = await fetch('https://indexer.preview.midnight.network/api/v4/graphql/ws', {
  headers: { 'Upgrade': 'websocket', 'Connection': 'Upgrade' }
});
console.log('  HTTP status:', resp.status);
process.exit(0);
