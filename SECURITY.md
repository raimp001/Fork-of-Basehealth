# Security Policy

## HIPAA & Patient Data

BaseHealth handles Protected Health Information (PHI). We take security and privacy extremely seriously. All contributors must follow HIPAA-compliant practices.

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| main    | :white_check_mark: |

## Reporting a Vulnerability

**Do NOT open a public GitHub issue for security vulnerabilities.**

Use [GitHub's private vulnerability reporting](https://github.com/raimp001/basehealth-core/security/advisories/new) to report confidentially.

### What to Include

- Description of the vulnerability
- Steps to reproduce
- Potential impact (especially any PHI/patient data risk)
- Suggested fix (optional)

### Response Timeline

- **Acknowledgement**: Within 24 hours (healthcare urgency)
- **Assessment**: Within 72 hours
- **Fix**: Within 14 days for Critical/High, 90 days for Medium/Low

## Security Best Practices for Contributors

### PHI & Patient Data
- **Never** commit real patient data, test PHI, or medical records
- Use synthetic/fake data in all tests and examples
- Ensure PHI scrubbing is active before any LLM calls
- Follow HIPAA minimum-necessary principle

### Secrets & Credentials
- **Never** commit API keys, database URLs, or tokens
- Use `.env.local` locally (already in `.gitignore`)
- Use Vercel/GitHub Secrets for deployments
- Rotate any accidentally committed key immediately

### Dependencies
- Keep dependencies up to date (Dependabot is enabled)
- Review and merge Dependabot PRs promptly — 27+ open alerts exist
- Run `npm audit` before releases
- Do NOT use `npm audit --force` to suppress warnings

### Authentication
- All patient/provider routes must be behind authentication middleware
- JWT secrets must be strong and rotated regularly
- Never expose admin routes without authentication

### API Security
- Validate and sanitise all inputs
- Rate limiting is required on all public endpoints
- Never log PHI or PII
- Use HTTPS for all external calls

## Known Security Controls

| Control | Status |
|---------|--------|
| `.gitignore` blocks `.env` and secrets | Enabled |
| Dependabot vulnerability alerts | Enabled |
| GitHub Secret Scanning + Push Protection | Enabled |
| Branch protection on `main` | Enabled |
| CI security workflow (npm-audit, Gitleaks, CodeQL) | Enabled |
| PHI scrubbing before LLM calls | Implemented |
| Input validation and rate limiting | Implemented |
| HIPAA compliance documentation | See HIPAA_COMPLIANCE.md |

## Acknowledgements

Thank you to everyone who responsibly discloses security issues in a healthcare platform.
