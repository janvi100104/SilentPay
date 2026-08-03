import { Transaction } from '@midnight-ntwrk/ledger-v8';
try {
  console.log('Testing Transaction.fromParts...');
  const tx = Transaction.fromParts('undeployed');
  console.log('OK: Transaction created');
} catch(e) {
  console.log('ERROR:', e.message);
  console.log('Type:', e.constructor.name);
}
