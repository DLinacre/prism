# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | ✅ Currently supported |

## Reporting a Vulnerability

If you discover a security vulnerability within Prism, please follow these steps:

1. **Do NOT** create a public GitHub issue for the vulnerability.
2. Navigate to the [Security Advisories](https://github.com/DLinacre/prism/security/advisories) page.
3. Click "Report a vulnerability" to submit a private report.
4. Provide detailed information about the vulnerability:
   - Description of the issue
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

## Response Timeline

- **Initial Response:** Within 24-48 hours
- **Assessment:** Within 1 week
- **Fix Deployment:** As soon as possible based on severity
- **Public Disclosure:** After fix is deployed (typically within 30 days)

## Security Best Practices (For Users)

- Use strong, unique passwords
- Enable two-factor authentication where available
- Keep your Prism installation up to date
- Review access permissions regularly
- Report any suspicious activity immediately

## Security Features

Prism implements the following security measures:

- **Password Hashing:** bcrypt with salt rounds
- **Authentication:** JWT tokens with HTTP-only cookies
- **Input Validation:** Server-side validation on all endpoints
- **SQL Injection Prevention:** Parameterized queries via SQLite
- **CORS:** Configured to restrict origins

Thank you for helping keep Prism and its users safe! 🔒
