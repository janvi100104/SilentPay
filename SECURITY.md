# Security Policy

## Reporting a vulnerability

If you discover a security vulnerability in SilentPay, please report it responsibly. **Do not open a public GitHub issue.**

Instead, email **team@silentpay.dev** with:

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

You should receive an acknowledgment within **48 hours**. We will work with you to understand and address the issue before any public disclosure.

## Scope

This security policy applies to:

- The SilentPay application (frontend and API routes)
- The Compact payroll contract
- Midnight network integration and wallet handling
- Database access patterns and input validation

## Out of scope

- Third-party services (Midnight Network infrastructure, PostgreSQL, Vercel)
- Social engineering attacks
- Issues in dependencies (report those upstream)

## Security practices

SilentPay follows these security practices:

- **No secrets in code** — wallet seeds, private keys, and `.env` files are never committed
- **Input validation** — all API inputs are validated with Zod schemas
- **Case-insensitive wallet matching** — prevents address spoofing via case variation
- **Principle of least privilege** — database queries use specific field selection
- **CI enforcement** — tests run on every push to `main`

## Wallet and key security

- Never commit `.midnight-state.json` to public repositories
- Never commit `.midnight-wallet-state/` directories
- Never share wallet seeds or private keys
- Use environment variables for all secrets
- Rotate any compromised keys immediately

## Disclosure timeline

When a vulnerability is reported:

1. **Acknowledgment** — within 48 hours
2. **Triage** — within 5 business days
3. **Fix development** — timeline depends on severity
4. **Public disclosure** — after the fix is deployed

We ask that you do not publicly disclose the issue until we have had a chance to address it.

## Contact

- Security reports: **team@silentpay.dev**
- General issues: [GitHub Issues](https://github.com/janvi100104/SilentPay/issues)
