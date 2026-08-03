import WebSocket from 'ws';
console.log('Testing with graphql-transport-ws subprotocol...');
const ws = new WebSocket('wss://indexer.preview.midnight.network/api/v4/graphql/ws', {
  protocol: 'graphql-transport-ws'
});
ws.on('open', () => { 
  console.log('OPEN - sending ConnectionInit');
  ws.send(JSON.stringify({ type: 'ConnectionInit', payload: {} }));
});
ws.on('message', (data) => { 
  console.log('MSG:', data.toString().slice(0, 200)); 
  ws.close(); 
});
ws.on('error', (e) => { console.log('ERROR:', e.message); });
ws.on('close', (c,r) => { console.log('CLOSE:', c); process.exit(0); });
setTimeout(() => { console.log('TIMEOUT - no response in 15s'); process.exit(1); }, 15000);
