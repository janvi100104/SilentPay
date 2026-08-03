import WebSocket from 'ws';

const urls = [
  'wss://indexer.preview.midnight.network/api/v4/graphql/ws',
  'wss://indexer.preview.midnight.network/api/v4/graphql',
  'wss://indexer.preview.midnight.network/graphql/ws',
  'wss://indexer.preview.midnight.network/ws',
  'wss://indexer.preview.midnight.network/graphql',
];

for (const url of urls) {
  console.log(`\nTrying: ${url}`);
  try {
    const ws = new WebSocket(url, { protocol: 'graphql-transport-ws' });
    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => { ws.close(); resolve('TIMEOUT'); }, 5000);
      ws.on('open', () => { 
        clearTimeout(timer);
        console.log('  OPEN!');
        ws.send(JSON.stringify({ type: 'ConnectionInit', payload: {} }));
      });
      ws.on('message', (data) => { 
        clearTimeout(timer);
        console.log('  MSG:', data.toString().slice(0, 200));
        ws.close();
        resolve('OK');
      });
      ws.on('error', (e) => { clearTimeout(timer); console.log('  ERROR:', e.message); resolve('ERROR'); });
      ws.on('close', (c) => { clearTimeout(timer); console.log('  CLOSE:', c); resolve('CLOSE'); });
    });
  } catch(e) {
    console.log('  EXCEPTION:', e.message);
  }
}
process.exit(0);
