// Check the faucet API for Preview
const walletAddress = 'mn_addr_preview1ts073zl6xyp9ragecxh79t97wqpsvu4pzddh9x4l6dg9rggd38cselcd6v';

console.log('Checking faucet API...');

// Try common faucet API patterns
const endpoints = [
  { url: 'https://faucet.preview.midnight.network/api/faucet', method: 'POST', body: JSON.stringify({ address: walletAddress }) },
  { url: 'https://faucet.preview.midnight.network/faucet', method: 'POST', body: JSON.stringify({ address: walletAddress }) },
  { url: `https://faucet.preview.midnight.network/api/faucet?address=${walletAddress}`, method: 'GET' },
  { url: `https://faucet.preview.midnight.network/api/v1/faucet/${walletAddress}`, method: 'POST' },
];

for (const ep of endpoints) {
  console.log(`\n${ep.method} ${ep.url}`);
  try {
    const opts = { method: ep.method, headers: { 'Content-Type': 'application/json' } };
    if (ep.body) opts.body = ep.body;
    const resp = await fetch(ep.url, opts);
    console.log(`  Status: ${resp.status}`);
    const text = await resp.text();
    console.log(`  Body: ${text.slice(0, 300)}`);
  } catch (e) {
    console.log(`  Error: ${e.message}`);
  }
}

// Also try the Notion-linked endpoint patterns from common Midnight docs
console.log('\n--- Checking known faucet tx for DUST ---');
const txId = '00f327a2b1db51e47a03e4ab760b4d2098cd98710b3559d8c82f1b25246ba0c768';
try {
  const resp = await fetch(`https://faucet.preview.midnight.network/api/tx/${txId}`);
  console.log(`Status: ${resp.status}`);
  const text = await resp.text();
  console.log(`Body: ${text.slice(0, 500)}`);
} catch(e) {
  console.log(`Error: ${e.message}`);
}
