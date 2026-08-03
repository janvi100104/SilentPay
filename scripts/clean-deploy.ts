import * as fs from 'fs';
const state = JSON.parse(fs.readFileSync('.midnight-state.json', 'utf8'));
delete state.deployments.undeployed;
fs.writeFileSync('.midnight-state.json', JSON.stringify(state, null, 2));
console.log('Cleared undeployed deployment');
