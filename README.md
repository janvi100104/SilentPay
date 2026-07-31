# SilentPay

[![CI](https://github.com/janvi100104/SilentPay/actions/workflows/ci.yml/badge.svg)](https://github.com/janvi100104/SilentPay/actions/workflows/ci.yml)

SilentPay is a privacy-first payroll application built with Next.js and Midnight. It lets an employer manage employees, create payroll, and let eligible employees claim payments without publishing individual payment amounts on-chain.

- Repository: [github.com/janvi100104/SilentPay](https://github.com/janvi100104/SilentPay)
- Live demo: **Not available yet**
- Network: Midnight local devnet by default, with Preview and Preprod configuration

## Product idea

SilentPay addresses the problem of transparent blockchain payroll: public payment records can expose salaries, bonuses, and contractor compensation forever. The product uses Midnight private witnesses and zero-knowledge proofs to make payroll execution verifiable while keeping each employee's allocation confidential. The longer-term product can support salaries, bonuses, contractor payments, revenue shares, vesting, and DAO contributor rewards with privacy as the default.

The full product proposal is in [`docs/01-product-requirements.md`](docs/01-product-requirements.md). It is currently a draft and still needs to be submitted for approval.

## Current functionality

- Next.js dashboard for companies, employees, payroll, claims, and history
- PostgreSQL-backed application metadata through Prisma
- Compact payroll contract with `createPayroll` and `claimPayment` circuits
- Local Midnight devnet using Docker Compose
- Midnight Preview and Preprod network configuration
- Jest coverage for contract structure, validation, employee, payroll, and claim flows

## UI screenshots

The current application UI includes the following views:

| Landing page | Dashboard |
| --- | --- |
| ![SilentPay landing page](<docs/screenshots/Screenshot%202026-08-01%20001109.png>) | ![SilentPay dashboard](<docs/screenshots/Screenshot%202026-08-01%20001133.png>) |

| Employees | Payroll |
| --- | --- |
| ![Employee management](<docs/screenshots/Screenshot%202026-08-01%20001226.png>) | ![Payroll management](<docs/screenshots/Screenshot%202026-08-01%20001204.png>) |

| Claims | History |
| --- | --- |
| ![Payment claims](<docs/screenshots/Screenshot%202026-08-01%20001149.png>) | ![Payroll and claim history](<docs/screenshots/Screenshot%202026-08-01%20001041.png>) |

## Privacy model

SilentPay separates public ledger state from private witness data. The privacy guarantee described here applies to the Midnight contract; application metadata in PostgreSQL must still be protected with normal database and application access controls.

### Public state

The contract deliberately discloses:

- Payroll identifier, employer address, and payroll month
- Number of employees in the payroll
- Number of claims processed
- The fact that a contract, transaction, and validity proof exist

This public state lets an observer verify that a payroll was created and that claims were processed without publishing the payroll amounts.

### Private witness

The contract uses private witness callbacks for employee allocations:

- `getAllocation(employeeAddress)` checks the caller's private allocation
- `markClaimed(employeeAddress)` updates private claim state
- Allocation amounts, eligibility details, and whether a particular address has a positive allocation are not written to public ledger fields

The `claimPayment` circuit proves that an eligible allocation exists, marks it as claimed, and increments the public claim counter. It does not disclose the amount in the public ledger.

### What an observer can and cannot learn

| Observer can learn | Observer cannot learn from the contract |
| --- | --- |
| Payroll metadata listed above | An employee's salary or payment amount |
| Public claim count and transaction/proof activity | The allocation of another employee |
| Contract and wallet addresses that are intentionally disclosed | Private witness values or the complete payroll total |

This model does not hide information that an employer, employee, wallet provider, or application administrator voluntarily reveals outside the contract. Never commit wallet seeds, private keys, `.env` files, or generated deployment state.

## Setup and local usage

### Requirements

- Node.js 22 or newer
- npm
- Docker with Docker Compose v2
- PostgreSQL 16 or another compatible PostgreSQL instance
- Compact compiler CLI compatible with the generated contract artifacts

### Install the application

```bash
git clone https://github.com/janvi100104/SilentPay.git
cd SilentPay
npm ci
cp .env.example .env.local
npx prisma generate
npx prisma db push
npm run dev
```

Open `http://localhost:3000` after the development server starts. Set `DATABASE_URL` in `.env.local` if PostgreSQL is not running at the default local connection. For a disposable local database, run:

```bash
docker run --name silentpay-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=silentpay \
  -p 5432:5432 \
  -d postgres:16
```

### Compile and deploy the Midnight contract

Start the local Midnight devnet, compile the payroll contract, and deploy it with:

```bash
docker compose up -d --wait
npm run compile
npm run midnight:deploy
```

The deployment command prints the contract address and stores network-specific deployment state in `.midnight-state.json`, which is gitignored. To run the full setup orchestrator, including database setup:

```bash
npm run midnight:setup
```

If PostgreSQL is already configured and only the Midnight services are needed:

```bash
npm run midnight:setup -- --skip-db
```

After deployment, inspect the network and address with:

```bash
npm run midnight:network
npm run midnight:cli
```

The local devnet uses a well-known genesis seed with pre-minted development funds. Never use that seed on Preview, Preprod, Mainnet, or any network holding real value.

### Networks

| Network | Purpose | Funding |
| --- | --- | --- |
| `undeployed` | Local Docker devnet | Genesis wallet is pre-funded |
| `preview` | Public Midnight Preview network | Use the configured Preview faucet |
| `preprod` | Public Midnight Preprod network | Use the configured Preprod faucet |

Switch the active network with `npm run midnight:network -- preview` or `npm run midnight:network -- undeployed`. Public-network wallet seeds and deployment records are stored in `.midnight-state.json`; back up any seed that controls funds you care about.

## Tests and verification

Run the automated tests with:

```bash
npm test -- --runInBand
```

The current local verification result is **5 test suites passed and 42 tests passed**. The repository also contains an end-to-end check for a deployed local contract:

```bash
npm run test:e2e
```

Compile output currently confirms two contract circuits:

```text
Compiling 2 circuits:
```

The circuits are `createPayroll` and `claimPayment`. A deployment run prints the deployed address in the form:

```text
✅ Contract deployed successfully!
   Address: <network-specific-address>
```

The UI screenshots above are included in `docs/screenshots/`. Screenshots of the compile output, test output, and deployed address are separate submission evidence and still belong under `docs/evidence/`; do not use fabricated addresses or output.

## Available scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the Next.js development server |
| `npm run build` | Build the Next.js application |
| `npm run compile` | Compile `contracts/payroll.compact` |
| `npm run midnight:setup` | Start services, compile, configure the database, and deploy |
| `npm run midnight:deploy` | Deploy the compiled payroll contract |
| `npm run midnight:cli` | Inspect status, balance, deployment, and network state |
| `npm run midnight:network` | Show or switch the active Midnight network |
| `npm run midnight:check-balance` | Print the wallet's tNIGHT and DUST balances |
| `npm run test` | Run Jest tests |
| `npm run test:e2e` | Check a deployed contract and read its state |
| `npm run lint` | Run ESLint; existing generated and application lint issues remain to be cleaned up |
| `npm run clean` | Remove generated contract and local Midnight state |

## Project structure

```text
contracts/payroll.compact       Compact payroll contract
src/app/                        Next.js pages and API routes
src/features/                   Employee, payroll, and claim UI
src/services/                   Application and Midnight services
src/midnight/                   Network, wallet, setup, and deploy scripts
src/**/__tests__/               Jest tests
docs/                           Product, architecture, schema, and implementation documents
docker-compose.yml              Local Midnight node, indexer, and proof server
```

## License

This project is licensed under the MIT License.
