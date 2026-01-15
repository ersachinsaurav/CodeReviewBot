# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- User authentication and history tracking
- Support for streaming AI responses
- Custom review rule configuration
- IDE extensions (VS Code, JetBrains)

## [1.1.0] - 2026-01-15

### Changed
- **BREAKING**: Migrated from OpenAI GPT to AWS Bedrock with Claude
- Updated AI provider to use AWS Bedrock SDK
- Changed authentication from API key to AWS IAM credentials
- Default model changed to Claude 3 Haiku for on-demand usage

### Added
- AWS Bedrock integration with Claude models
- Support for multiple Claude models (Haiku, Sonnet, Opus)
- AWS credential provider chain support
- Application screenshots in documentation

### Updated
- README.md with AWS Bedrock setup instructions
- ARCHITECTURE.md with new system design
- SECURITY.md with AWS security best practices
- CONTRIBUTING.md with updated development setup

## [1.0.0] - 2026-01-15

### Added
- Initial release of CodeReview Bot
- React frontend with modern UI
- Express backend with AI integration
- Support for 15+ programming languages
- Real-time code review with AI feedback
- Security hardening (Helmet, rate limiting, input sanitization)
- Comprehensive documentation (README, ARCHITECTURE, CONTRIBUTING)
- Open source licensing (MIT)
- Code of Conduct and Security Policy
- Environment-based configuration
- Responsive design for mobile and desktop
- Syntax highlighting for code display
- Markdown rendering for AI responses
- Error handling and user feedback
- Health check endpoint for monitoring
- CORS protection with configurable origins
- Request validation and sanitization
- Token usage tracking

### Security
- AWS credentials protected via IAM profiles
- Rate limiting (10 requests/minute default)
- Input size limits (50KB max code length)
- Control character sanitization
- HTTPS enforcement in production
- Security headers via Helmet.js
- Origin validation for CORS
- Request ID tracking for debugging

### Documentation
- Detailed README with setup instructions
- Architecture documentation with diagrams
- Contributing guidelines
- Security policy
- Code of Conduct
- API documentation
- Environment configuration guide

[Unreleased]: https://github.com/ersachinsaurav/CodeReviewBot/compare/v1.1.0...HEAD
[1.1.0]: https://github.com/ersachinsaurav/CodeReviewBot/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/ersachinsaurav/CodeReviewBot/releases/tag/v1.0.0
