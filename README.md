# SilentPay

[![CI](https://github.com/janvi100104/SilentPay/actions/workflows/ci.yml/badge.svg)](https://github.com/janvi100104/SilentPay/actions/workflows/ci.yml)

SilentPay is a privacy-first payroll application built with Next.js and Midnight. It lets an employer manage employees, create payroll, and let eligible employees claim payments without publishing individual payment amounts on-chain.

- Repository: [github.com/janvi100104/SilentPay](https://github.com/janvi100104/SilentPay)
- Live demo: [Watch on Google Drive](https://drive.google.com/file/d/1LjeJZlQXUr8PIbZ-9vMTtl3r6Yn7pFW9/view?usp=sharing)
- Network: Midnight Preview network (deployed), with local devnet and Preprod configuration available

## Product idea

SilentPay addresses the problem of transparent blockchain payroll: public payment records can expose salaries, bonuses, and contractor compensation forever. The product uses Midnight private witnesses and zero-knowledge proofs to make payroll execution verifiable while keeping each employee's allocation confidential. The longer-term product can support salaries, bonuses, contractor payments, revenue shares, vesting, and DAO contributor rewards with privacy as the default.

The full product proposal is in [`docs/01-product-requirements.md`](docs/01-product-requirements.md). It is currently a draft and still needs to be submitted for approval.

## Current functionality

- Next.js dashboard for companies, employees, payroll, claims, and history
- PostgreSQL-backed application metadata through Prisma
- Compact payroll contract with `createPayroll` and `claimPayment` circuits
- `claimPayment` circuit wired end-to-end: allocation loaded from DB, ZK proof executed on-chain, result recorded
- Midnight Preview network deployment (active)
- Local Midnight devnet using Docker Compose
- Lace wallet connect/disconnect support
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

## Evidence

| Compile output | Test output | Deployed address |
| --- | --- | --- |
| ![Compile output](<docs/evidence/Screenshot%202026-08-04%20000028.png>) | ![Test output](<docs/evidence/Screenshot%202026-08-04%20002653.png>) | ![Deployed address](<docs/evidence/Screenshot%202026-08-04%20002748.png>) |

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

The Compact compiler must be installed (`~/.local/bin/compact`). Compile the payroll contract and deploy to the Preview network:

```bash
compact compile contracts/payroll.compact contracts/managed/payroll
npm run midnight:deploy
```

The deployment command registers for DUST generation, waits for balance, and stores the contract address in `.midnight-state.json`. To deploy to a local devnet instead:

```bash
docker compose up -d --wait
npm run midnight:deploy -- undeployed
```

After deployment, inspect the network and address with:

```bash
npm run midnight:network
npm run midnight:cli
npm run midnight:check-balance
```

The local devnet uses a well-known genesis seed with pre-minted development funds. Never use that seed on Preview, Preprod, Mainnet, or any network holding real value.

### Networks

| Network | Purpose | Funding |
| --- | --- | --- |
| `preview` | Public Midnight Preview network (active deployment) | Use the [Preview faucet](https://faucet.preview.midnight.network/) |
| `undeployed` | Local Docker devnet | Genesis wallet is pre-funded |
| `preprod` | Public Midnight Preprod network | Use the configured Preprod faucet |

Switch the active network with `npm run midnight:network -- preview` or `npm run midnight:network -- undeployed`. Public-network wallet seeds and deployment records are stored in `.midnight-state.json`; back up any seed that controls funds you care about.

## Tests and verification

Run the automated tests with:

```bash
npm test -- --runInBand
```

**5 test suites, 42 tests passed.** The test suite covers:

- Contract structure and syntax validation
- Zod schema validation for all API inputs
- Employee service CRUD operations
- Payroll service lifecycle and claim recording
- Claim flow end-to-end (including `proofVerified` status tracking)

The end-to-end check reconnects to the deployed contract and reads its on-chain state:

```bash
npm run test:e2e
```

Compile output confirms two contract circuits:

```text
Compiling 2 circuits:
```

The circuits are `createPayroll` and `claimPayment`. The `claimPayment` circuit is wired from the frontend API route through to the on-chain contract — employee allocations are loaded from the database, fed into the contract witnesses, and the ZK proof is executed on-chain.

The UI screenshots above are included in `docs/screenshots/`. Screenshots of the compile output, test output, and deployed address are in `docs/evidence/` — do not use fabricated addresses or output.

### Deployed contract addresses

| Network | Address |
| --- | --- |
| Preview (active) | `972fbdf9ad5adcb3bd363d6528cf68dadf960b2fc962e5f619bb94a452f5fd8a` |
| Local devnet | `57f93e63fa0a26312da02aa05110b9f2add249322c81933428a15d89677f617b` |

## Available scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the Next.js development server |
| `npm run build` | Build the Next.js application |
| `npm run compile` | Compile `contracts/payroll.compact` |
| `npm run midnight:deploy` | Deploy the compiled payroll contract to the active network |
| `npm run midnight:cli` | Inspect status, balance, deployment, and network state |
| `npm run midnight:network` | Show or switch the active Midnight network |
| `npm run midnight:check-balance` | Print the wallet's tNIGHT and DUST balances |
| `npm run test` | Run Jest tests |
| `npm run test:e2e` | End-to-end check: reconnect to deployed contract, read on-chain state |
| `npm run lint` | Run ESLint |
| `npm run clean` | Remove generated contract and local Midnight state |

## Project structure

```text
contracts/payroll.compact           Compact payroll contract (createPayroll + claimPayment)
contracts/managed/payroll/         Compiled contract artifacts (JS, keys, zkir)
src/app/                           Next.js pages and API routes
src/app/api/claim/                 Claim API — wires claimPayment circuit with DB allocations
src/app/api/payroll/               Payroll API — deploys contract with private allocations
src/features/                      Employee, payroll, and claim UI components
src/services/                      Application services (employee, payroll, midnight)
src/midnight/                      Network config, wallet, deploy, and CLI scripts
src/__tests__/                     Contract and validation tests
src/services/__tests__/            Service-level tests (claim flow, payroll, employee)
docs/                              Product, architecture, schema, and implementation docs
docs/screenshots/                  UI screenshots
scripts/e2e-check.ts               End-to-end contract verification script
docker-compose.yml                 Local Midnight node, indexer, and proof server
```

## License

This project is licensed under the MIT License.
