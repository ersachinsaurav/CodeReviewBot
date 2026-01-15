# Security Policy

## Supported Versions

We release patches for security vulnerabilities for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |

## Reporting a Vulnerability

We take the security of CodeReview Bot seriously. If you believe you have found a security vulnerability, please report it to us as described below.

### Please Do Not

- Open a public GitHub issue for security vulnerabilities
- Disclose the vulnerability publicly before it has been addressed

### Please Do

1. **Email us directly** at security@sachinsaurav.dev
2. Include as much information as possible:
   - Type of vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### What to Expect

- **Acknowledgment**: Within 48 hours of your report
- **Updates**: Regular updates on our progress
- **Resolution**: We aim to resolve critical issues within 7 days
- **Credit**: We will credit you in our security advisories (unless you prefer to remain anonymous)

## Security Best Practices

### For Users

1. **AWS Credentials**: Never commit AWS credentials or `.env` files
2. **IAM Policies**: Use least-privilege IAM policies for Bedrock access
3. **Updates**: Keep dependencies up to date
4. **HTTPS**: Always use HTTPS in production
5. **Rate Limiting**: Configure appropriate rate limits

### For Contributors

1. **Dependencies**: Audit dependencies before adding
2. **Input Validation**: Always validate and sanitize user input
3. **Error Messages**: Never expose sensitive information in errors
4. **Authentication**: Follow secure authentication practices

## Known Security Considerations

### AWS Credentials Protection

- AWS credentials managed via IAM profiles (not API keys in code)
- Uses AWS SDK's default credential provider chain
- Never exposed to the client
- Validated on server startup

### Rate Limiting

- Default: 10 requests per minute per IP
- Configurable via environment variables
- Prevents abuse and DoS attacks

### Input Validation

- Code length limited to 50,000 characters
- Control characters stripped from input
- Language parameter validated against whitelist

### CORS Protection

- Strict origin validation in production
- Configurable allowed origins
- Credentials support controlled

### HTTP Security Headers

Implemented via Helmet.js:
- X-Frame-Options
- X-Content-Type-Options
- Strict-Transport-Security
- X-XSS-Protection

## Security Checklist for Deployment

- [ ] Environment variables properly configured
- [ ] AWS IAM policies configured with least privilege
- [ ] HTTPS enabled
- [ ] CORS origins restricted to production domains
- [ ] Rate limiting enabled and configured
- [ ] Dependencies audited (`npm audit`)
- [ ] AWS credentials rotated regularly
- [ ] Logs monitored for suspicious activity
- [ ] Error messages sanitized

## Vulnerability Disclosure Timeline

1. **Day 0**: Vulnerability reported
2. **Day 1-2**: Acknowledgment sent, investigation begins
3. **Day 3-7**: Fix developed and tested
4. **Day 7-14**: Patch released, security advisory published
5. **Day 30+**: Full disclosure (if appropriate)

## Security Updates

Subscribe to security updates:
- Watch this repository for security advisories
- Check CHANGELOG.md for security-related updates
- Review [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for secure deployment practices

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [AWS Bedrock Security](https://docs.aws.amazon.com/bedrock/latest/userguide/security.html)
- [AWS Security Best Practices](https://aws.amazon.com/architecture/security-identity-compliance/)

## Contact

For security concerns, contact: security@sachinsaurav.dev (replace with actual contact)

Thank you for helping keep CodeReview Bot and its users safe!
