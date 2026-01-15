# Deployment Guide

This guide covers various deployment options for CodeReview Bot, including local development, cloud platforms, and Docker containerization.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Configuration](#environment-configuration)
- [Local Development](#local-development)
- [Production Deployment](#production-deployment)
  - [Frontend Deployment](#frontend-deployment)
  - [Backend Deployment](#backend-deployment)
- [Docker Deployment](#docker-deployment)
- [Cloud Platform Guides](#cloud-platform-guides)
  - [AWS Deployment](#aws-deployment)
  - [Vercel + Railway](#vercel--railway)
  - [Netlify + Render](#netlify--render)
- [Environment Variables Reference](#environment-variables-reference)
- [Health Checks & Monitoring](#health-checks--monitoring)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before deploying, ensure you have:

- **Node.js** 18.0.0 or higher
- **npm** 9.0.0 or higher
- **AWS Account** with Bedrock access enabled
- **AWS CLI** configured with appropriate credentials

### AWS Bedrock Setup

1. Log into AWS Console and navigate to Bedrock
2. Request access to Claude models (if not already enabled)
3. Create an IAM user/role with Bedrock permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel",
        "bedrock:InvokeModelWithResponseStream"
      ],
      "Resource": "arn:aws:bedrock:*::foundation-model/anthropic.*"
    }
  ]
}
```

---

## Environment Configuration

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `AWS_REGION` | AWS region for Bedrock | `us-east-1` |
| `AWS_PROFILE` | AWS CLI profile (local dev) | `personal` |
| `AWS_ACCESS_KEY_ID` | AWS access key (production) | `AKIA...` |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key (production) | `wJal...` |

### Optional Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `5331` | Backend server port |
| `NODE_ENV` | `development` | Environment mode |
| `CLIENT_URL` | `http://localhost:5332` | Frontend URL for CORS |
| `CLAUDE_MODEL` | `anthropic.claude-3-haiku-20240307-v1:0` | Claude model ID |
| `CLAUDE_MAX_TOKENS` | `4096` | Max response tokens |
| `CLAUDE_TEMPERATURE` | `0.7` | Model temperature |
| `RATE_LIMIT_WINDOW_MS` | `60000` | Rate limit window |
| `RATE_LIMIT_MAX_REQUESTS` | `10` | Max requests per window |
| `MAX_CODE_LENGTH` | `50000` | Max code characters |

---

## Local Development

```bash
# Install all dependencies
npm run install:all

# Configure AWS CLI
aws configure --profile personal

# Start development servers
npm run dev
```

This starts:
- Frontend: http://localhost:5332 (with HMR)
- Backend: http://localhost:5331

---

## Production Deployment

### Frontend Deployment

The frontend is a static React application built with Vite.

#### Build the Frontend

```bash
cd client
npm run build
```

This creates a `dist/` folder with optimized static assets.

#### Frontend Environment

Create `client/.env.production`:

```env
VITE_API_URL=https://your-backend-url.com
```

### Backend Deployment

The backend is a Node.js/Express server.

#### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Configure AWS credentials (IAM role or environment variables)
- [ ] Set `CLIENT_URL` to your frontend domain
- [ ] Enable rate limiting
- [ ] Configure HTTPS

---

## Docker Deployment

### Dockerfile for Backend

Create `server/Dockerfile`:

```dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Expose port
EXPOSE 5331

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5331/api/health || exit 1

# Start server
CMD ["node", "index.js"]
```

### Dockerfile for Frontend

Create `client/Dockerfile`:

```dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build argument for API URL
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Build the application
RUN npm run build

# Production image with nginx
FROM nginx:alpine

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### Docker Compose

Create `docker-compose.yml` in the root directory:

```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./server
      dockerfile: Dockerfile
    ports:
      - "5331:5331"
    environment:
      - NODE_ENV=production
      - PORT=5331
      - AWS_REGION=${AWS_REGION}
      - AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
      - AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
      - CLAUDE_MODEL=${CLAUDE_MODEL}
      - CLIENT_URL=http://localhost:80
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--spider", "http://localhost:5331/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    build:
      context: ./client
      dockerfile: Dockerfile
      args:
        - VITE_API_URL=http://localhost:5331
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: unless-stopped
```

### Running with Docker

```bash
# Build and start containers
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop containers
docker-compose down
```

---

## Cloud Platform Guides

### AWS Deployment

#### Option 1: EC2 + Application Load Balancer

1. **Launch EC2 Instance**
   - Amazon Linux 2023 or Ubuntu 22.04
   - t3.small or larger
   - Security group: Allow ports 22, 80, 443

2. **Install Dependencies**
   ```bash
   # Install Node.js
   curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
   sudo yum install -y nodejs

   # Clone and setup
   git clone https://github.com/ersachinsaurav/CodeReviewBot.git
   cd CodeReviewBot
   npm run install:all
   npm run build
   ```

3. **Use PM2 for Process Management**
   ```bash
   npm install -g pm2
   pm2 start server/index.js --name codereview-api
   pm2 startup
   pm2 save
   ```

4. **Configure Nginx as Reverse Proxy**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           root /var/www/codereview/client/dist;
           try_files $uri $uri/ /index.html;
       }

       location /api {
           proxy_pass http://localhost:5331;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

#### Option 2: AWS App Runner

1. Push your code to a GitHub repository
2. Create an App Runner service connected to your repo
3. Configure build settings and environment variables
4. App Runner handles scaling automatically

#### Option 3: AWS ECS with Fargate

Use the Docker setup with ECS for containerized deployment with auto-scaling.

### Vercel + Railway

#### Frontend on Vercel

1. Connect your GitHub repository to Vercel
2. Set build settings:
   - Framework: Vite
   - Build Command: `cd client && npm run build`
   - Output Directory: `client/dist`
3. Add environment variable:
   - `VITE_API_URL`: Your Railway backend URL

#### Backend on Railway

1. Create a new Railway project
2. Connect your GitHub repository
3. Set root directory to `server`
4. Add environment variables:
   - `AWS_REGION`
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `CLAUDE_MODEL`
   - `CLIENT_URL` (your Vercel URL)
   - `NODE_ENV=production`

### Netlify + Render

#### Frontend on Netlify

1. Connect repository to Netlify
2. Build settings:
   - Base directory: `client`
   - Build command: `npm run build`
   - Publish directory: `client/dist`
3. Add `_redirects` file in `client/public`:
   ```
   /api/*  https://your-render-url.com/api/:splat  200
   /*      /index.html                              200
   ```

#### Backend on Render

1. Create a new Web Service on Render
2. Connect your repository
3. Settings:
   - Root Directory: `server`
   - Build Command: `npm install`
   - Start Command: `node index.js`
4. Add environment variables as needed

---

## Environment Variables Reference

### Development (.env)

```env
# AWS Configuration
AWS_REGION=us-east-1
AWS_PROFILE=personal

# Claude Model Configuration
CLAUDE_MODEL=anthropic.claude-3-haiku-20240307-v1:0
CLAUDE_MAX_TOKENS=4096
CLAUDE_TEMPERATURE=0.7

# Server Configuration
PORT=5331
NODE_ENV=development
CLIENT_URL=http://localhost:5332

# Rate Limiting (disabled in development)
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=10

# Input Limits
MAX_CODE_LENGTH=50000
```

### Production

```env
# AWS Configuration (use IAM role if possible)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key

# Claude Model Configuration
CLAUDE_MODEL=anthropic.claude-3-haiku-20240307-v1:0
CLAUDE_MAX_TOKENS=4096
CLAUDE_TEMPERATURE=0.7

# Server Configuration
PORT=5331
NODE_ENV=production
CLIENT_URL=https://your-frontend-domain.com

# Rate Limiting (enabled in production)
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=10

# Input Limits
MAX_CODE_LENGTH=50000
```

---

## Health Checks & Monitoring

### Health Check Endpoint

```bash
curl https://your-api-url.com/api/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2026-01-15T10:30:00.000Z",
  "version": "1.0.0",
  "aiProvider": "AWS Bedrock (Claude)",
  "model": "anthropic.claude-3-haiku-20240307-v1:0"
}
```

### Monitoring Recommendations

1. **Uptime Monitoring**: Use services like UptimeRobot or Pingdom
2. **Error Tracking**: Integrate Sentry or similar
3. **Logging**: Use CloudWatch (AWS) or your platform's logging
4. **Metrics**: Monitor response times, error rates, token usage

---

## Troubleshooting

### Common Issues

#### AWS Credentials Error

```
AWS credentials error. Please check your AWS configuration.
```

**Solution**: Verify AWS credentials are correctly configured:
```bash
aws sts get-caller-identity --profile personal
```

#### CORS Errors

```
Origin not allowed
```

**Solution**: Ensure `CLIENT_URL` environment variable matches your frontend domain exactly.

#### Rate Limiting

```
Too many requests. Please try again later.
```

**Solution**: Wait for the rate limit window to reset, or adjust `RATE_LIMIT_MAX_REQUESTS` in production.

#### Model Access Denied

```
AccessDeniedException
```

**Solution**:
1. Verify Bedrock model access is enabled in AWS Console
2. Check IAM permissions include `bedrock:InvokeModel`

### Debug Mode

Enable verbose logging:
```bash
DEBUG=* node server/index.js
```

### Getting Help

- Check [GitHub Issues](https://github.com/ersachinsaurav/CodeReviewBot/issues)
- Review [Architecture Documentation](./ARCHITECTURE.md)
- Open a new issue with detailed error logs

---

## Security Considerations

1. **Never commit `.env` files** - Use `.env.example` as a template
2. **Use IAM roles** in production instead of access keys when possible
3. **Enable HTTPS** for all production deployments
4. **Rotate credentials** regularly
5. **Monitor for unusual activity** in AWS CloudTrail

For more security guidelines, see [SECURITY.md](../SECURITY.md).
