// Test Preview indexer HTTP
const resp = await fetch('https://indexer.preview.midnight.network/api/v4/graphql', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ query: '{ __typename }' })
});
console.log('Status:', resp.status);
const body = await resp.text();
console.log('Body:', body.slice(0, 500));
