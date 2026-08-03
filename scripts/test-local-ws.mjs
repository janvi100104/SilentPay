// Check local devnet WS
import WebSocket from 'ws';

console.log('Local devnet WS (no protocol):');
const ws1 = new WebSocket('ws://127.0.0.1:8088/api/v4/graphql/ws');
ws1.on('open', () => { console.log('  OPEN!'); ws1.close(); });
ws1.on('error', (e) => console.log('  ERROR:', e.message));
ws1.on('close', (c) => console.log('  CLOSE:', c));
await new Promise(r => setTimeout(r, 3000));

console.log('\nLocal devnet WS (graphql-transport-ws):');
const ws2 = new WebSocket('ws://127.0.0.1:8088/api/v4/graphql/ws', ['graphql-transport-ws']);
ws2.on('open', () => { console.log('  OPEN!'); ws2.send(JSON.stringify({ type: 'ConnectionInit', payload: {} })); });
ws2.on('message', (d) => { console.log('  MSG:', d.toString().slice(0,200)); ws2.close(); });
ws2.on('error', (e) => console.log('  ERROR:', e.message));
ws2.on('close', (c) => console.log('  CLOSE:', c));
await new Promise(r => setTimeout(r, 3000));

console.log('\nLocal devnet WS (graphql-ws):');
const ws3 = new WebSocket('ws://127.0.0.1:8088/api/v4/graphql/ws', ['graphql-ws']);
ws3.on('open', () => { console.log('  OPEN!'); ws3.send(JSON.stringify({ type: 'ConnectionInit', payload: {} })); });
ws3.on('message', (d) => { console.log('  MSG:', d.toString().slice(0,200)); ws3.close(); });
ws3.on('error', (e) => console.log('  ERROR:', e.message));
ws3.on('close', (c) => console.log('  CLOSE:', c));
await new Promise(r => setTimeout(r, 3000));

process.exit(0);
