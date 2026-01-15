# Architecture Documentation

This document provides a comprehensive overview of the CodeReview Bot system architecture, including design decisions, component interactions, and deployment considerations.

## Table of Contents

1. [System Overview](#system-overview)
2. [High-Level Architecture](#high-level-architecture)
3. [Component Details](#component-details)
4. [Data Flow](#data-flow)
5. [Security Architecture](#security-architecture)
6. [API Design](#api-design)
7. [Frontend Architecture](#frontend-architecture)
8. [Deployment Architecture](#deployment-architecture)
9. [Performance Considerations](#performance-considerations)
10. [Future Considerations](#future-considerations)

---

## System Overview

CodeReview Bot is a web application that provides AI-powered code review functionality. Users submit code snippets through a web interface, and the system returns detailed feedback on code quality, style, and potential improvements.

### Key Characteristics

- **Type**: Full-stack web application
- **Architecture Pattern**: Client-Server with REST API
- **Primary Language**: JavaScript/TypeScript
- **AI Integration**: AWS Bedrock with Anthropic Claude

---

## High-Level Architecture

```
+-----------------------------------------------------------------------------+
|                              CLIENT LAYER                                   |
|  +---------------------------------------------------------------------+    |
|  |                    React SPA (Vite)                                 |    |
|  |  +--------------+  +--------------+  +--------------+               |    |
|  |  | CodeEditor   |  | ReviewPanel  |  | Components   |               |    |
|  |  | Component    |  | Component    |  | (Header,     |               |    |
|  |  |              |  |              |  |  Selector)   |               |    |
|  |  +--------------+  +--------------+  +--------------+               |    |
|  +---------------------------------------------------------------------+    |
+-----------------------------------------------------------------------------+
                                      |
                                      | HTTPS/HTTP
                                      | (JSON)
                                      v
+-----------------------------------------------------------------------------+
|                              SERVER LAYER                                   |
|  +---------------------------------------------------------------------+    |
|  |                    Express.js Server                                |    |
|  |  +--------------+  +--------------+  +--------------+               |    |
|  |  | Security     |  | API Routes   |  | Error        |               |    |
|  |  | Middleware   |  | (/api/*)     |  | Handlers     |               |    |
|  |  | - Helmet     |  |              |  |              |               |    |
|  |  | - CORS       |  |              |  |              |               |    |
|  |  | - Rate Limit |  |              |  |              |               |    |
|  |  +--------------+  +--------------+  +--------------+               |    |
|  +---------------------------------------------------------------------+    |
+-----------------------------------------------------------------------------+
                                      |
                                      | HTTPS
                                      | (AWS SDK)
                                      v
+-----------------------------------------------------------------------------+
|                          EXTERNAL SERVICES                                  |
|  +---------------------------------------------------------------------+    |
|  |                    AWS Bedrock                                      |    |
|  |  +--------------+                                                   |    |
|  |  | Claude 3     |                                                   |    |
|  |  | (Haiku/      |                                                   |    |
|  |  |  Sonnet/     |                                                   |    |
|  |  |  Opus)       |                                                   |    |
|  |  +--------------+                                                   |    |
|  +---------------------------------------------------------------------+    |
+-----------------------------------------------------------------------------+
```

---

## Component Details

### Frontend Components

#### Application Structure

```
client/
├── src/
│   ├── main.jsx                  # Application entry point
│   ├── App.jsx                   # Root component, state management
│   ├── App.css                   # Application-level styles
│   ├── index.css                 # Global styles, CSS variables
│   └── components/
│       ├── Header.jsx            # Navigation and branding
│       ├── Header.css
│       ├── CodeEditor.jsx        # Code input with line numbers
│       ├── CodeEditor.css
│       ├── LanguageSelector.jsx  # Language dropdown
│       ├── LanguageSelector.css
│       ├── ReviewPanel.jsx       # AI review display
│       └── ReviewPanel.css
├── public/
│   └── favicon.svg               # Application icon
├── index.html                    # HTML template
├── vite.config.js                # Vite configuration
└── package.json                  # Dependencies
```

#### Component Hierarchy

```
App
├── Header
├── Main Content
│   ├── Editor Section
│   │   ├── Section Header
│   │   │   └── LanguageSelector
│   │   ├── CodeEditor
│   │   └── Action Bar (Buttons)
│   └── Review Section
│       ├── Section Header
│       └── ReviewPanel
└── Footer
```

#### State Management

The application uses React's built-in hooks for state management:

| State | Type | Purpose |
|-------|------|---------|
| `code` | string | User's input code |
| `language` | string | Selected programming language |
| `review` | object/null | API response with review data |
| `loading` | boolean | Loading state indicator |
| `error` | string/null | Error message display |

### Backend Components

#### Server Structure

```
server/
├── index.js                  # Main server file
└── package.json              # Dependencies
```

#### Middleware Stack

```
Request -> Helmet -> CORS -> Rate Limiter -> JSON Parser -> Route Handler -> Response
```

| Middleware | Purpose |
|------------|---------|
| Helmet | Sets security-related HTTP headers |
| CORS | Controls cross-origin resource sharing |
| Rate Limiter | Prevents API abuse (10 req/min default) |
| JSON Parser | Parses request bodies (1MB limit) |

---

## Data Flow

### Code Review Request Flow

```
+----------+     +----------+     +----------+     +----------+
|  User    |     |  React   |     |  Express |     |   AWS    |
|  Input   |---->|  Client  |---->|  Server  |---->| Bedrock  |
+----------+     +----------+     +----------+     +----------+
                                        |                |
                                        |                |
                                        v                v
                                  +----------+     +----------+
                                  | Validate |     | Claude   |
                                  | Sanitize |     | Generate |
                                  +----------+     +----------+
                                        |                |
                                        |<---------------+
                                        |
                                        v
+----------+     +----------+     +----------+
|  Display |<----|  Parse   |<----|  Return  |
|  Review  |     | Markdown |     |   JSON   |
+----------+     +----------+     +----------+
```

### Request Processing Steps

1. **User Input**: User pastes code and selects language
2. **Client Validation**: Basic input validation (non-empty)
3. **API Request**: POST to `/api/review` with code and language
4. **Server Validation**: Sanitize input, validate length
5. **AI Processing**: Send to AWS Bedrock with system prompt
6. **Response Handling**: Parse response, return to client
7. **Display**: Render markdown with syntax highlighting

---

## Security Architecture

### Defense in Depth

```
+---------------------------------------------------------------+
|                     Layer 1: Network                          |
|  - HTTPS enforcement (production)                             |
|  - CORS origin validation                                     |
+---------------------------------------------------------------+
                              |
                              v
+---------------------------------------------------------------+
|                     Layer 2: Application                      |
|  - Helmet security headers                                    |
|  - Rate limiting                                              |
|  - Input size limits                                          |
+---------------------------------------------------------------+
                              |
                              v
+---------------------------------------------------------------+
|                     Layer 3: Input Validation                 |
|  - Input sanitization (control characters)                    |
|  - Language whitelist validation                              |
|  - Maximum code length enforcement                            |
+---------------------------------------------------------------+
                              |
                              v
+---------------------------------------------------------------+
|                     Layer 4: Secrets Management               |
|  - AWS credentials via IAM profiles                           |
|  - Environment variables for config                           |
|  - Never exposed to client                                    |
+---------------------------------------------------------------+
```

### Security Headers (via Helmet)

| Header | Purpose |
|--------|---------|
| X-DNS-Prefetch-Control | Controls DNS prefetching |
| X-Frame-Options | Prevents clickjacking |
| X-Content-Type-Options | Prevents MIME sniffing |
| Strict-Transport-Security | Enforces HTTPS |
| X-XSS-Protection | Enables XSS filter |
| Referrer-Policy | Controls referrer information |

### Input Validation Rules

| Validation | Rule | Error Response |
|------------|------|----------------|
| Code presence | Required, must be string | 400 Bad Request |
| Code length | Max 50,000 characters | 400 Bad Request |
| Code content | Not empty/whitespace only | 400 Bad Request |
| Language | Whitelist of allowed values | Defaults to "other" |
| Control chars | Stripped from input | N/A (sanitized) |

---

## API Design

### Endpoints

#### GET /api/health

Health check endpoint for monitoring.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "version": "1.0.0",
  "aiProvider": "AWS Bedrock (Claude)",
  "model": "anthropic.claude-3-haiku-20240307-v1:0"
}
```

#### POST /api/review

Submit code for AI review.

**Request:**
```json
{
  "code": "function add(a, b) { return a+b; }",
  "language": "javascript"
}
```

**Response (Success):**
```json
{
  "success": true,
  "review": "**Feedback:**\n1. Missing spaces...",
  "usage": {
    "promptTokens": 150,
    "completionTokens": 300,
    "totalTokens": 450
  },
  "requestId": "req_1705312200_abc123"
}
```

**Response (Error):**
```json
{
  "error": "Code is required and must be a string",
  "requestId": "req_1705312200_abc123"
}
```

### Error Codes

| Status | Meaning | Common Causes |
|--------|---------|---------------|
| 400 | Bad Request | Invalid input, missing code |
| 403 | Forbidden | CORS origin not allowed |
| 404 | Not Found | Invalid endpoint |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Error | AWS credentials issues, server errors |

---

## Frontend Architecture

### Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.x | UI framework |
| Vite | 6.x | Build tool and dev server |
| react-markdown | 9.x | Markdown rendering |
| react-syntax-highlighter | 15.x | Code highlighting |

### CSS Architecture

The application uses CSS custom properties (variables) for theming:

```css
:root {
  /* Color System */
  --bg-primary: #0a0a0f;
  --accent-primary: #6366f1;
  --text-primary: #f8fafc;

  /* Typography */
  --font-mono: 'JetBrains Mono', monospace;
  --font-sans: 'Outfit', sans-serif;

  /* Spacing */
  --radius-md: 12px;
}
```

### Accessibility Features

- Semantic HTML elements
- ARIA labels and roles
- Keyboard navigation support
- Color contrast compliance
- Screen reader announcements (`aria-live`)

---

## Deployment Architecture

### Development Environment

```
+---------------------------------------------------------------+
|                     Local Development                         |
|                                                               |
|  +---------------+         +---------------+                  |
|  | Vite Dev      | :5332   | Express Dev   | :5331            |
|  | Server        |-------->| Server        |                  |
|  | (HMR enabled) |  proxy  |               |                  |
|  +---------------+         +---------------+                  |
|                                   |                           |
|                                   v                           |
|                            +---------------+                  |
|                            | AWS Bedrock   |                  |
|                            | (Claude)      |                  |
|                            +---------------+                  |
+---------------------------------------------------------------+
```

### Production Environment

```
+---------------------------------------------------------------+
|                     Production Setup                          |
|                                                               |
|  +---------------+         +---------------+                  |
|  | CDN / Static  |         | Node.js       |                  |
|  | Host          |-------->| Server        |                  |
|  | (Vercel,      |  HTTPS  | (Express)     |                  |
|  |  Netlify)     |         |               |                  |
|  +---------------+         +---------------+                  |
|        |                          |                           |
|        |                          v                           |
|        |                   +---------------+                  |
|        |                   | AWS Bedrock   |                  |
|        |                   | (Claude)      |                  |
|        |                   +---------------+                  |
|        v                                                      |
|  +---------------------------------------------------+        |
|  | Static Assets (React build output)                |        |
|  | - index.html                                      |        |
|  | - assets/*.js (bundled)                           |        |
|  | - assets/*.css                                    |        |
|  +---------------------------------------------------+        |
+---------------------------------------------------------------+
```

### Environment Configuration

| Environment | Rate Limit | CORS | Logging |
|-------------|------------|------|---------|
| Development | Disabled | Permissive | Verbose |
| Production | 10 req/min | Strict origin | Errors only |

---

## Performance Considerations

### Frontend Optimizations

- **Code Splitting**: Vite automatically splits chunks
- **Tree Shaking**: Unused code eliminated in build
- **Lazy Loading**: Heavy components can be lazily loaded
- **CSS Variables**: Efficient theming without JS

### Backend Optimizations

- **Rate Limiting**: Prevents resource exhaustion
- **Request Size Limits**: 1MB max request body
- **Streaming**: AWS Bedrock SDK supports streaming (future)
- **Connection Pooling**: Express handles connections efficiently

### Caching Strategy

| Resource | Cache Duration | Strategy |
|----------|----------------|----------|
| Static assets | 1 year | Immutable with hash |
| HTML | No cache | Always fresh |
| API responses | No cache | Real-time data |

---

## Future Considerations

### Potential Enhancements

1. **Authentication**: Add user accounts for history tracking
2. **Database**: Store review history (PostgreSQL/MongoDB)
3. **Streaming**: Stream AI responses for better UX
4. **Multiple Models**: Support different Claude model selection
5. **Custom Rules**: User-defined review guidelines
6. **Team Features**: Shared review settings
7. **IDE Extensions**: VS Code, JetBrains integrations
8. **Webhooks**: GitHub/GitLab PR integration

### Scaling Considerations

```
                    +-------------------+
                    |  Load Balancer    |
                    +---------+---------+
                              |
         +--------------------+--------------------+
         |                    |                    |
         v                    v                    v
+------------------+ +------------------+ +------------------+
|  Server Node 1   | |  Server Node 2   | |  Server Node N   |
+------------------+ +------------------+ +------------------+
         |                    |                    |
         +--------------------+--------------------+
                              |
                    +---------+---------+
                    |  Redis Cache      |
                    |  (Rate Limits)    |
                    +-------------------+
```

---

## Appendix

### Technology Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Frontend Framework | React | Industry standard, large ecosystem |
| Build Tool | Vite | Fast HMR, excellent DX |
| Backend Framework | Express | Mature, flexible, well-documented |
| AI Provider | AWS Bedrock (Claude) | Secure AWS integration, powerful models |
| Styling | CSS + Variables | No build overhead, good DX |

### References

- [AWS Bedrock Documentation](https://docs.aws.amazon.com/bedrock/)
- [Anthropic Claude Documentation](https://docs.anthropic.com/)
- [Express.js Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [React Documentation](https://react.dev)
- [OWASP Security Guidelines](https://owasp.org/www-project-web-security-testing-guide/)
