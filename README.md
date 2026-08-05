<div align="center">

# SilentPay

**Privacy-first payroll on the Midnight Network**

[![CI](https://github.com/janvi100104/SilentPay/actions/workflows/ci.yml/badge.svg)](https://github.com/janvi100104/SilentPay/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D22-brightgreen)](https://nodejs.org/)
[![Midnight](https://img.shields.io/badge/built%20on-Midnight-purple)](https://midnight.network/)

SilentPay lets employers run payroll and employees claim payments without publishing individual salary amounts on-chain. Zero-knowledge proofs verify each claim while keeping allocations confidential.

[Live demo](https://drive.google.com/file/d/1LjeJZlQXUr8PIbZ-9vMTtl3r6Yn7pFW9/view?usp=sharing) · [Report bug](https://github.com/janvi100104/SilentPay/issues) · [Request feature](https://github.com/janvi100104/SilentPay/issues)

</div>

---

## Why SilentPay?

On a transparent blockchain, every payment is permanent and public. Salaries, bonuses, and contractor fees become visible to anyone. SilentPay solves this by running payroll on Midnight, where:

- Payroll creation and claim counts are publicly verifiable.
- Individual payment amounts remain hidden.
- Employees prove eligibility with a ZK circuit — no amount is disclosed on-chain.

## Features

- **Privacy-preserving payroll** — create payroll with private allocations; only metadata is public
- **ZK claim flow** — `claimPayment` circuit proves eligibility without revealing amounts
- **Wallet integration** — Lace wallet connect/disconnect on Midnight networks
- **Full dashboard** — manage employees, create payrolls, view claims and history
- **Multiple networks** — Preview, Preprod, and local Docker devnet
- **42 automated tests** — contract, validation, service, and end-to-end coverage

## Screenshots

The application flow — from landing to payroll execution and employee claiming:

| Hero | Add Employees |
|------|---------------|
| ![Hero](docs/screenshots/Hero.png) | ![Add Employees](<docs/screenshots/Add%20Employees.png>) |

| Employees | Create Payroll |
|-----------|----------------|
| ![Employees](docs/screenshots/Employees.png) | ![Create Payroll](<docs/screenshots/Create%20Payroll.png>) |

| Payroll | Employee Claim Tab |
|---------|--------------------|
| ![Payroll](docs/screenshots/Payroll.png) | ![Employee Claim Tab](<docs/screenshots/Employee%20Claim%20Tab.png>) |

| Employee History | Employee Dashboard |
|------------------|--------------------|
| ![Employee History](<docs/screenshots/Employee%20History.png>) | ![Employee Dashboard](<docs/screenshots/Employee%20Dashboard.png>) |

| Claims | Employer Dashboard |
|--------|--------------------|
| ![Claims](docs/screenshots/Claims.png) | ![Employer Dashboard](<docs/screenshots/Employer%20Dashboard.png>) |

## Quick start

### Prerequisites

| Requirement | Version |
|-------------|---------|
| Node.js | 22+ |
| PostgreSQL | 16+ |
| Docker | with Compose v2 |
| Compact compiler | `~/.local/bin/compact` |

### Install and run

```bash
git clone https://github.com/janvi100104/SilentPay.git
cd SilentPay
npm ci
cp .env.example .env.local
npx prisma generate
npx prisma db push
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

<details>
<summary>Quick database with Docker</summary>

```bash
docker run --name silentpay-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=silentpay \
  -p 5432:5432 \
  -d postgres:16
```

Then set `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/silentpay` in `.env.local`.

</details>

### Compile and deploy the contract

```bash
compact compile contracts/payroll.compact contracts/managed/payroll
npm run midnight:deploy
```

<details>
<summary>Deploy to local devnet instead</summary>

```bash
docker compose up -d --wait
npm run midnight:deploy -- undeployed
```

</details>

### Run tests

```bash
npm test -- --runInBand
```

Or with coverage:

```bash
npm run test:coverage
```

End-to-end check against the live contract:

```bash
npm run test:e2e
```

## Deployed contracts

| Network | Contract Address | Deployer Wallet Address |
|---------|------------------|-------------------------|
| Preview | `972fbdf9ad5adcb3bd363d6528cf68dadf960b2fc962e5f619bb94a452f5fd8a` | `mn_addr_preview1ts073zl6xyp9ragecxh79t97wqpsvu4pzddh9x4l6dg9rggd38cselcd6v` |
| Local devnet | `57f93e63fa0a26312da02aa05110b9f2add249322c81933428a15d89677f617b` | `mn_addr_undeployed1h3ssm5ru2t6eqy4g3she78zlxn96e36ms6pq996aduvmateh9p9sk96u7s` |

## Demo video

[![Watch the demo](https://img.shields.io/badge/Watch-Demo-red)](https://drive.google.com/file/d/1LjeJZlQXUr8PIbZ-9vMTtl3r6Yn7pFW9/view?usp=sharing)

[Full demo video on Google Drive](https://drive.google.com/file/d/1LjeJZlQXUr8PIbZ-9vMTtl3r6Yn7pFW9/view?usp=sharing)

## Evidence

| Compile output | Test output | Deployed address |
|----------------|-------------|------------------|
| ![Compile output](<docs/evidence/Screenshot%202026-08-04%20000028.png>) | ![Test output](<docs/evidence/Screenshot%202026-08-04%20002653.png>) | ![Deployed address](<docs/evidence/Screenshot%202026-08-04%20002748.png>) |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the development server |
| `npm run build` | Production build |
| `npm run compile` | Compile the Compact contract |
| `npm run midnight:deploy` | Deploy to the active Midnight network |
| `npm run midnight:network` | Show or switch the active network |
| `npm run midnight:check-balance` | Print tNIGHT and DUST balances |
| `npm run midnight:cli` | Inspect deployment and network state |
| `npm run test` | Run all tests |
| `npm run test:coverage` | Tests with coverage report |
| `npm run test:e2e` | End-to-end contract verification |
| `npm run lint` | Run ESLint |
| `npm run clean` | Remove generated artifacts |

## Architecture

```
contracts/
  payroll.compact               # Compact payroll contract (createPayroll + claimPayment)
  managed/payroll/              # Compiled artifacts (JS, keys, zkir)
src/
  app/                          # Next.js pages and API routes
    api/claim/                  # Claim API — wires claimPayment circuit
    api/payroll/                # Payroll API — deploys contract
  features/                     # UI components (employee, payroll, claim)
  services/                     # Application services
  midnight/                     # Network config, wallet, deploy scripts
  __tests__/                    # Contract and validation tests
docs/                           # Product, architecture, and schema docs
scripts/e2e-check.ts            # End-to-end verification
docker-compose.yml              # Local Midnight node, indexer, proof server
```

## Privacy model

SilentPay separates public ledger state from private witness data.

**Public:** payroll ID, employer address, month, employee count, claim count, contract addresses.

**Private:** allocation amounts, eligibility details, whether a specific address has a positive allocation.

The `claimPayment` circuit proves an eligible allocation exists, marks it claimed, and increments the public counter — without disclosing the amount.

| An observer can learn | An observer cannot learn |
|-----------------------|--------------------------|
| Payroll metadata | Individual salary or payment amount |
| Claim count and proof activity | Another employee's allocation |
| Publicly disclosed addresses | Private witness values |

> This model does not hide information voluntarily revealed outside the contract. Never commit wallet seeds, private keys, `.env` files, or deployment state.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## Security

To report vulnerabilities, see [SECURITY.md](SECURITY.md).

## License

This project is licensed under the [MIT License](LICENSE).
