/**
 * Full setup orchestrator for SilentPay.
 *
 * Runs everything in order:
 *   1. Start Docker devnet (node + indexer + proof-server)
 *   2. Compile the Compact contract
 *   3. Set up PostgreSQL database
 *   4. Deploy the contract on-chain
 *
 * Usage:
 *   npx tsx src/midnight/setup.ts [--skip-docker] [--skip-db] [--skip-deploy]
 */
import { execSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', '..');

const args = process.argv.slice(2);
const skipDocker = args.includes('--skip-docker');
const skipDb = args.includes('--skip-db');
const skipDeploy = args.includes('--skip-deploy');

function run(cmd: string, label: string): void {
  console.log(`\n▶ ${label}`);
  try {
    execSync(cmd, { cwd: ROOT, stdio: 'inherit' });
  } catch (err) {
    console.error(`\n❌ Failed: ${label}`);
    process.exit(1);
  }
}

function fileExists(p: string): boolean {
  return fs.existsSync(path.join(ROOT, p));
}

async function main() {
  console.log('\n╔══════════════════════════════════════════╗');
  console.log('║   SilentPay — Full Setup                 ║');
  console.log('╚══════════════════════════════════════════╝\n');

  // 1. Docker devnet
  if (!skipDocker) {
    if (!fileExists('docker-compose.yml')) {
      console.error('❌ docker-compose.yml not found');
      process.exit(1);
    }

    // Check if Docker is running
    try {
      execSync('docker info', { stdio: 'ignore' });
    } catch {
      console.error('❌ Docker is not running. Please start Docker Desktop or Docker Engine.');
      console.error('   Then re-run: npx tsx src/midnight/setup.ts');
      process.exit(1);
    }

    run('docker compose up -d --wait', 'Starting Midnight devnet (node + indexer + proof-server)');

    // Verify services are up
    console.log('\n▶ Verifying services...');
    try {
      const nodeRes = execSync('curl -sf -H "Content-Type: application/json" -d \'{"id":1,"jsonrpc":"2.0","method":"chain_getBlockHash","params":[1]}\' http://localhost:9944', { encoding: 'utf-8' });
      if (nodeRes.includes('result')) {
        console.log('  ✅ Node: OK');
      }
    } catch {
      console.error('  ❌ Node not responding on port 9944');
      process.exit(1);
    }

    try {
      execSync('curl -sf http://localhost:8088/api/v4/graphql', { encoding: 'utf-8' });
      console.log('  ✅ Indexer: OK');
    } catch {
      console.error('  ⚠ Indexer may still be starting (this is usually fine)');
    }

    console.log('  ✅ Proof server: listening on port 6300');
  } else {
    console.log('\n⏭ Skipping Docker (--skip-docker)');
  }

  // 2. Compile contract
  if (!fileExists('contracts/managed/payroll/contract/index.js')) {
    run('npm run compile', 'Compiling payroll contract');
  } else {
    console.log('\n⏭ Contract already compiled (contracts/managed/payroll/ exists)');
  }

  // 3. Database setup
  if (!skipDb) {
    // Check if PostgreSQL is available
    const dbUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/silentpay?schema=public';
    const dbName = dbUrl.match(/\/([^/?]+)/)?.[1] || 'silentpay';

    try {
      execSync(`pg_isready`, { stdio: 'ignore' });
    } catch {
      console.error('\n⚠ PostgreSQL not found or not running.');
      console.error('  Options:');
      console.error('  1. Install PostgreSQL and create the database');
      console.error('  2. Use Docker: docker run -d --name silentpay-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=silentpay -p 5432:5432 postgres:16');
      console.error(`  3. Skip with --skip-db\n`);

      if (!skipDeploy) {
        console.error('  Database is required for the app. Exiting.');
        process.exit(1);
      }
    }

    run('npx prisma generate', 'Generating Prisma client');
    run('npx prisma db push', 'Pushing schema to database');
  } else {
    console.log('\n⏭ Skipping database (--skip-db)');
  }

  // 4. Deploy contract
  if (!skipDeploy) {
    run('npx tsx src/midnight/deploy.ts', 'Deploying contract to Midnight');
  } else {
    console.log('\n⏭ Skipping deploy (--skip-deploy)');
  }

  // Done
  console.log('\n╔══════════════════════════════════════════╗');
  console.log('║   ✅ Setup complete!                     ║');
  console.log('╠══════════════════════════════════════════╣');
  console.log('║                                          ║');
  console.log('║   Next steps:                            ║');
  console.log('║   1. npm run dev       → Start the app   ║');
  console.log('║   2. Open localhost:3000                 ║');
  console.log('║   3. Connect Lace Wallet                 ║');
  console.log('║   4. Add employees → Create payroll      ║');
  console.log('║                                          ║');
  console.log('╚══════════════════════════════════════════╝\n');
}

main().catch(async (err) => {
  console.error('\n❌ Setup failed:', err.message);
  process.exit(1);
});
