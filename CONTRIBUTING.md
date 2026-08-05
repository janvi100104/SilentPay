# Contributing to SilentPay

Thanks for your interest in contributing to SilentPay! This document explains how to get started.

## Table of contents

- [Code of conduct](#code-of-conduct)
- [Getting started](#getting-started)
- [Development workflow](#development-workflow)
- [Pull request process](#pull-request-process)
- [Coding standards](#coding-standards)
- [Testing](#testing)
- [Commit messages](#commit-messages)
- [Reporting bugs](#reporting-bugs)

## Code of conduct

This project follows our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you agree to uphold it.

## Getting started

1. Fork the repository
2. Clone your fork:

```bash
git clone https://github.com/<your-username>/SilentPay.git
cd SilentPay
```

3. Install dependencies:

```bash
npm ci
cp .env.example .env.local
npx prisma generate
npx prisma db push
```

4. Start the dev server:

```bash
npm run dev
```

## Development workflow

1. Create a branch from `main`:

```bash
git checkout -b feat/your-feature-name
```

2. Make your changes
3. Run tests and lint:

```bash
npm test -- --runInBand
npm run lint
```

4. Commit your changes
5. Push and open a pull request

## Pull request process

1. Update the README if you add features or change setup steps
2. Ensure all tests pass (`npm test -- --runInBand`)
3. Ensure the CI pipeline passes on GitHub
4. Request a review from a maintainer
5. Address review feedback

PRs should target the `main` branch. Keep PRs focused — one feature or fix per PR.

## Coding standards

- **TypeScript** is used throughout the project
- **Tailwind CSS v4** for styling
- **Zod** for input validation schemas
- **Prisma** for database access
- Follow the existing code style — check neighboring files for patterns
- Do not add comments unless requested
- Do not commit secrets, private keys, wallet seeds, or `.env` files

## Testing

Run the full test suite before submitting:

```bash
npm test -- --runInBand
```

When adding features:
- Add tests for new API routes or services
- Update existing tests if behavior changes
- Run `npm run test:coverage` to check coverage

The test suite covers:
- Contract structure and compilation
- Zod schema validation
- Employee and payroll services
- Claim flow end-to-end

## Commit messages

Use clear, descriptive commit messages:

```
feat: add CSV payroll import
fix: prevent duplicate claims for same payroll
docs: update setup instructions
test: add edge case for empty employee list
refactor: extract wallet validation to shared util
```

Prefix with `feat`, `fix`, `docs`, `test`, `refactor`, or `chore`.

## Reporting bugs

Open a [GitHub issue](https://github.com/janvi100104/SilentPay/issues) with:
- What you expected to happen
- What actually happened
- Steps to reproduce
- Your environment (OS, Node.js version, browser)

## Security

Do **not** open a public issue for security vulnerabilities. See [SECURITY.md](SECURITY.md) for responsible disclosure instructions.
