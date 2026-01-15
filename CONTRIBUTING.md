# Contributing to CodeReview Bot

First off, thank you for considering contributing to CodeReview Bot! It's people like you that make this project better for everyone.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Commit Messages](#commit-messages)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

## Getting Started

1. Fork the repository on GitHub
2. Clone your fork locally
3. Set up the development environment (see below)
4. Create a branch for your changes
5. Make your changes
6. Push to your fork and submit a pull request

## Development Setup

### Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher
- Git
- AWS account with Bedrock access (for testing)

### Installation

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/CodeReviewBot.git
cd CodeReviewBot

# Add upstream remote
git remote add upstream https://github.com/ersachinsaurav/CodeReviewBot.git

# Install dependencies
npm run install:all

# Copy environment file
cp .env.example .env

# Configure AWS credentials
aws configure --profile personal

# Start development servers
npm run dev
```

### Project Structure

```
CodeReviewBot/
├── client/               # React frontend (Vite)
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── App.jsx       # Main application
│   │   └── index.css     # Global styles
│   └── package.json
├── server/               # Express backend
│   ├── index.js          # API server
│   └── package.json
├── docs/                 # Documentation
│   ├── ARCHITECTURE.md   # System architecture
│   └── DEPLOYMENT.md     # Deployment guide
├── screenshots/          # Application screenshots
└── package.json          # Root package.json
```

## How to Contribute

### Types of Contributions

We welcome many types of contributions:

- **Bug fixes**: Found a bug? Fix it!
- **Features**: Have an idea? Implement it!
- **Documentation**: Help improve our docs
- **Tests**: Help improve test coverage
- **Code review**: Review open pull requests
- **Design**: Help improve the UI/UX

### First Time Contributors

Look for issues labeled:
- `good first issue` - Great for newcomers
- `help wanted` - We need your help!
- `documentation` - Help improve docs

## Pull Request Process

1. **Create an Issue First**
   - For significant changes, open an issue to discuss
   - Reference the issue in your PR

2. **Branch Naming**
   ```
   feature/description    # New features
   fix/description        # Bug fixes
   docs/description       # Documentation
   refactor/description   # Code refactoring
   ```

3. **Before Submitting**
   - [ ] Code follows the project style guide
   - [ ] All tests pass
   - [ ] No linting errors
   - [ ] Documentation updated if needed
   - [ ] Commit messages follow conventions

4. **PR Description Template**
   ```markdown
   ## Description
   Brief description of changes

   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Documentation update
   - [ ] Refactoring

   ## Related Issues
   Fixes #123

   ## Testing Done
   Describe testing performed

   ## Screenshots (if applicable)
   ```

5. **Review Process**
   - Maintainers will review your PR
   - Address any requested changes
   - Once approved, your PR will be merged

## Coding Standards

### JavaScript/React

- Use ES6+ features
- Prefer functional components with hooks
- Use meaningful variable and function names
- Keep components focused and small
- Comment complex logic

```javascript
// Good
function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// Bad
function calc(i) {
  let t = 0;
  for (let x of i) t += x.p;
  return t;
}
```

### CSS

- Use CSS custom properties (variables)
- Follow BEM-like naming for component styles
- Mobile-first responsive design
- Prefer CSS over JavaScript for animations

```css
/* Good */
.review-panel {
  background: var(--bg-card);
}

.review-panel-loading {
  display: flex;
}

/* Bad */
.rp {
  background: #16161e;
}
```

### API Design

- Use RESTful conventions
- Return consistent response formats
- Include proper error handling
- Document all endpoints

## Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
type(scope): description

[optional body]

[optional footer]
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Code style (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

### Examples

```
feat(api): add rate limiting to review endpoint

fix(ui): resolve CodeEditor line number alignment

docs(readme): update installation instructions

refactor(server): extract validation into utility functions
```

## Reporting Bugs

### Before Submitting

1. Check existing issues to avoid duplicates
2. Ensure you're using the latest version
3. Collect relevant information

### Bug Report Template

```markdown
## Bug Description
Clear description of the bug

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. See error

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- OS: [e.g., macOS 14.0]
- Browser: [e.g., Chrome 120]
- Node version: [e.g., 18.19.0]

## Screenshots
If applicable

## Additional Context
Any other relevant information
```

## Suggesting Features

### Feature Request Template

```markdown
## Feature Description
Clear description of the feature

## Problem It Solves
What problem does this address?

## Proposed Solution
How should it work?

## Alternatives Considered
Other approaches you've thought about

## Additional Context
Mockups, examples, etc.
```

## Questions?

If you have questions, feel free to:

1. Open a GitHub Discussion
2. Check existing documentation
3. Review closed issues for similar topics

Thank you for contributing!
