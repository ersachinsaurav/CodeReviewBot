import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { defaultProvider } from '@aws-sdk/credential-provider-node';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env') });

const app = express();
const PORT = process.env.PORT || 5331;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Security: Helmet middleware for HTTP headers
app.use(helmet({
  contentSecurityPolicy: NODE_ENV === 'production' ? undefined : false,
  crossOriginEmbedderPolicy: false,
}));

// Security: Rate limiting to prevent abuse
const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 60000, // 1 minute
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 10, // 10 requests per minute
  message: {
    error: 'Too many requests. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => NODE_ENV === 'development', // Skip in development
});

// Security: CORS configuration
const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map(url => url.trim())
  : ['http://localhost:5332', 'http://localhost:5333'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.) in development
    if (!origin && NODE_ENV === 'development') {
      return callback(null, true);
    }
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Security: Request size limits
app.use(express.json({
  limit: process.env.MAX_REQUEST_SIZE || '1mb',
}));

// Security: Disable X-Powered-By header
app.disable('x-powered-by');

// Validate AWS configuration
const AWS_REGION = process.env.AWS_REGION || 'us-east-1';
const AWS_PROFILE = process.env.AWS_PROFILE || 'personal';
const CLAUDE_MODEL = process.env.CLAUDE_MODEL || 'anthropic.claude-3-haiku-20240307-v1:0';

console.log(`[INFO] AWS Region: ${AWS_REGION}`);
console.log(`[INFO] AWS Profile: ${AWS_PROFILE}`);
console.log(`[INFO] Claude Model: ${CLAUDE_MODEL}`);

// Initialize AWS Bedrock client
let bedrockClient;
try {
  bedrockClient = new BedrockRuntimeClient({
    region: AWS_REGION,
    credentials: defaultProvider({
      profile: AWS_PROFILE,
    }),
  });
  console.log('[INFO] AWS Bedrock client initialized successfully');
} catch (error) {
  console.error('[ERROR] Failed to initialize AWS Bedrock client:', error.message);
  console.error('[ERROR] Make sure AWS credentials are configured with: aws configure --profile', AWS_PROFILE);
  process.exit(1);
}

// System prompt for code review
const SYSTEM_PROMPT = `You are an expert code reviewer. Review code based on these guidelines:

1. White space after opening and before closing brackets (), {}, [] if there's content between them.
2. White space before and after operators like +, -, *, /, %, =, +=, -=, etc.
3. Variables should have type prefixes: $int for integers, $str for strings, $arr for arrays, $obj for objects.
4. In conditions, constants should be placed before variables being compared.
5. Suggest logical improvements for efficiency and readability.

Format your response with:
- **Feedback:** (numbered list of issues)
- **Updated Code:** (the improved version)

Be constructive and explain why each change improves the code.`;

// Utility: Sanitize user input
function sanitizeInput(input) {
  if (typeof input !== 'string') return '';
  // Remove null bytes and control characters except newlines and tabs
  return input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
}

// Utility: Validate language parameter
const ALLOWED_LANGUAGES = [
  'javascript', 'typescript', 'python', 'php', 'java', 'csharp',
  'cpp', 'go', 'rust', 'ruby', 'swift', 'kotlin', 'sql', 'html',
  'css', 'shell', 'bash', 'other'
];

function validateLanguage(language) {
  if (!language) return 'other';
  const normalized = String(language).toLowerCase().trim();
  return ALLOWED_LANGUAGES.includes(normalized) ? normalized : 'other';
}

// Utility: Call Claude via AWS Bedrock
async function callClaude(userMessage, systemPrompt = SYSTEM_PROMPT) {
  const payload = {
    anthropic_version: 'bedrock-2023-05-31',
    max_tokens: parseInt(process.env.CLAUDE_MAX_TOKENS, 10) || 4096,
    temperature: parseFloat(process.env.CLAUDE_TEMPERATURE) || 0.7,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: userMessage,
      },
    ],
  };

  const command = new InvokeModelCommand({
    modelId: CLAUDE_MODEL,
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify(payload),
  });

  const response = await bedrockClient.send(command);
  const responseBody = JSON.parse(new TextDecoder().decode(response.body));

  return {
    content: responseBody.content[0].text,
    usage: {
      inputTokens: responseBody.usage.input_tokens,
      outputTokens: responseBody.usage.output_tokens,
      totalTokens: responseBody.usage.input_tokens + responseBody.usage.output_tokens,
    },
  };
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    aiProvider: 'AWS Bedrock (Claude)',
    model: CLAUDE_MODEL,
  });
});

// Code review endpoint with rate limiting
app.post('/api/review', apiLimiter, async (req, res) => {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(7)}`;

  try {
    const { code, language } = req.body;

    // Validate code input
    if (!code || typeof code !== 'string') {
      return res.status(400).json({
        error: 'Code is required and must be a string',
        requestId,
      });
    }

    // Sanitize and validate inputs
    const sanitizedCode = sanitizeInput(code);
    const validatedLanguage = validateLanguage(language);

    // Check code length limits
    const maxCodeLength = parseInt(process.env.MAX_CODE_LENGTH, 10) || 50000;
    if (sanitizedCode.length > maxCodeLength) {
      return res.status(400).json({
        error: `Code is too long. Maximum ${maxCodeLength.toLocaleString()} characters allowed.`,
        requestId,
      });
    }

    if (sanitizedCode.trim().length === 0) {
      return res.status(400).json({
        error: 'Code cannot be empty or contain only whitespace',
        requestId,
      });
    }

    const userPrompt = `Please review the following ${validatedLanguage} code snippet:\n\n\`\`\`${validatedLanguage}\n${sanitizedCode}\n\`\`\``;

    const response = await callClaude(userPrompt);

    res.json({
      success: true,
      review: response.content,
      usage: {
        promptTokens: response.usage.inputTokens,
        completionTokens: response.usage.outputTokens,
        totalTokens: response.usage.totalTokens,
      },
      requestId,
    });
  } catch (error) {
    // Log error without exposing sensitive details
    console.error(`[${requestId}] API Error:`, error.message);

    if (error.name === 'AccessDeniedException') {
      return res.status(500).json({
        error: 'AWS credentials error. Please check your AWS configuration.',
        requestId,
      });
    }

    if (error.name === 'ThrottlingException') {
      return res.status(429).json({
        error: 'Service is temporarily overloaded. Please try again later.',
        requestId,
      });
    }

    if (error.name === 'ValidationException') {
      return res.status(400).json({
        error: 'Invalid request. Please check your input and try again.',
        requestId,
      });
    }

    res.status(500).json({
      error: 'Failed to generate code review. Please try again.',
      requestId,
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  // Log error without exposing stack trace to client
  console.error('[ERROR] Unhandled error:', err.message);

  // CORS errors
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ error: 'Origin not allowed' });
  }

  res.status(500).json({ error: 'Internal server error' });
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('[INFO] SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('[INFO] SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`[INFO] Server running on http://localhost:${PORT}`);
  console.log(`[INFO] Environment: ${NODE_ENV}`);
  console.log(`[INFO] Code Review API ready at /api/review`);
  console.log(`[INFO] Using AWS Bedrock with Claude model`);
});
