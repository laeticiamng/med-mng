# Supabase Edge Functions Documentation

## Overview

This directory contains all Supabase Edge Functions organized by functionality. Each function is documented with its purpose, parameters, and usage examples.

## Function Categories

### 🔐 Authentication & Security
- [`cas-cookies-replica`](#cas-cookies-replica) - CAS authentication cookie management
- [`test-cas-auth`](#test-cas-auth) - CAS authentication testing
- [`error-handling-service`](#error-handling-service) - Centralized error handling

### 📚 Content Management & Extraction
- [`extract-edn-uness`](#extract-edn-uness) - EDN content extraction from UNESS platform
- [`extract-edn-uness-production`](#extract-edn-uness-production) - Production EDN extraction
- [`extract-edn-objectifs`](#extract-edn-objectifs) - EDN objectives extraction
- [`extract-oic-api-first`](#extract-oic-api-first) - OIC content extraction via API
- [`extract-with-cas-auth`](#extract-with-cas-auth) - Authenticated content extraction
- [`sync-edn-content`](#sync-edn-content) - EDN content synchronization
- [`complete-edn-content`](#complete-edn-content) - EDN content completion
- [`edn-fix`](#edn-fix) - EDN data quality fixes

### 🔧 OIC Data Processing
- [`oic-extraction-proven`](#oic-extraction-proven) - Reliable OIC extraction
- [`oic-readme-extraction`](#oic-readme-extraction) - OIC documentation extraction
- [`puppeteer-oic-extraction`](#puppeteer-oic-extraction) - Browser-based OIC extraction
- [`puppeteer-oic-final`](#puppeteer-oic-final) - Final OIC extraction implementation
- [`fix-oic-data-quality`](#fix-oic-data-quality) - OIC data quality improvements
- [`fix-oic-truncated-content`](#fix-oic-truncated-content) - OIC content completion
- [`fix-incomplete-oic`](#fix-incomplete-oic) - OIC data completion
- [`fix-short-content`](#fix-short-content) - Content length optimization
- [`complete-oic-competences`](#complete-oic-competences) - OIC competencies completion
- [`complete-oic-urls`](#complete-oic-urls) - OIC URL completion

### 🤖 AI & Generation Services
- [`openai-chat`](#openai-chat) - OpenAI chat completions
- [`openai-image`](#openai-image) - OpenAI image generation
- [`contextual-ai-chat`](#contextual-ai-chat) - Context-aware AI chat
- [`enhanced-contextual-chat`](#enhanced-contextual-chat) - Advanced contextual chat
- [`generate-content`](#generate-content) - General content generation
- [`generate-image`](#generate-image) - Image generation service
- [`generate-lyrics-bulk`](#generate-lyrics-bulk) - Bulk lyrics generation
- [`generate-music`](#generate-music) - Music generation via Suno API
- [`music-generation`](#music-generation) - Music generation orchestrator
- [`lyrics-sync-manager`](#lyrics-sync-manager) - Lyrics synchronization

### 🏥 Medical Content & Management
- [`med-mng-api`](#med-mng-api) - Medical management API
- [`spotify-ai-complete`](#spotify-ai-complete) - Spotify medical content AI
- [`spotify-medical-docs`](#spotify-medical-docs) - Medical documentation via Spotify
- [`pedagogical-content-api`](#pedagogical-content-api) - Educational content API
- [`content-master-api`](#content-master-api) - Master content management
- [`compare-official-content`](#compare-official-content) - Content comparison

### 🎵 Audio & Streaming
- [`secure-audio-stream`](#secure-audio-stream) - Secure audio streaming
- [`playlist-manager`](#playlist-manager) - Playlist management

### 🛠 Administration & Analytics
- [`admin-export`](#admin-export) - Administrative data export
- [`admin-quick-edit`](#admin-quick-edit) - Quick content editing
- [`advanced-search`](#advanced-search) - Advanced search functionality
- [`analytics-aggregator`](#analytics-aggregator) - Analytics data aggregation
- [`audit-system`](#audit-system) - System audit logging
- [`ia-quota`](#ia-quota) - AI usage quota management

### 📧 Communication
- [`send-emails`](#send-emails) - Email sending service
- [`create-subscription-checkout`](#create-subscription-checkout) - Subscription management

### 🧪 Testing & Utilities
- [`test-batch-50`](#test-batch-50) - Batch testing (50 items)
- [`test-connectivity`](#test-connectivity) - Connection testing
- [`test-edn-extraction`](#test-edn-extraction) - EDN extraction testing
- [`test-extraction-sample`](#test-extraction-sample) - Sample extraction testing
- [`test-insertion-directe`](#test-insertion-directe) - Direct insertion testing
- [`test-oic-curl`](#test-oic-curl) - OIC cURL testing
- [`test-oic-simple`](#test-oic-simple) - Simple OIC testing
- [`test-simple-api`](#test-simple-api) - Basic API testing

---

## Function Specifications

### Authentication & Security

#### `cas-cookies-replica`
**Purpose**: Manages CAS authentication cookies for secure access to UNESS platform.

**Environment Variables**:
- `CAS_LOGIN_URL` - CAS authentication endpoint
- `CAS_SERVICE_URL` - Service URL for CAS validation

**Input**: 
```typescript
{
  username: string;
  password: string;
  service?: string;
}
```

**Output**:
```typescript
{
  cookies: string[];
  sessionId: string;
  expiresAt: string;
}
```

#### `test-cas-auth`
**Purpose**: Tests CAS authentication mechanisms and cookie validation.

**Environment Variables**:
- `CAS_LOGIN_URL`
- `CAS_SERVICE_URL`
- `TEST_USERNAME`
- `TEST_PASSWORD`

---

### Content Management & Extraction

#### `extract-edn-uness`
**Purpose**: Extracts EDN (Épreuves Dématérialisées Nationales) content from UNESS platform.

**Environment Variables**:
- `UNESS_API_URL` - UNESS platform API endpoint
- `CAS_COOKIES` - Authentication cookies

**Input**:
```typescript
{
  itemIds?: string[];
  extractAll?: boolean;
  includeMetadata?: boolean;
}
```

**Output**:
```typescript
{
  items: EdnItem[];
  totalExtracted: number;
  errors: string[];
}
```

#### `sync-edn-content`
**Purpose**: Synchronizes EDN content between different systems and databases.

**Environment Variables**:
- `SYNC_BATCH_SIZE` - Number of items per batch (default: 50)
- `ENABLE_VALIDATION` - Enable content validation

**Input**:
```typescript
{
  syncAll?: boolean;
  itemCodes?: string[];
  validateContent?: boolean;
}
```

---

### AI & Generation Services

#### `openai-chat`
**Purpose**: Provides OpenAI chat completions with context management.

**Environment Variables**:
- `OPENAI_API_KEY` - OpenAI API key
- `MAX_TOKENS` - Maximum tokens per response (default: 2000)
- `MODEL` - OpenAI model to use (default: gpt-4)

**Input**:
```typescript
{
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}
```

#### `generate-lyrics-bulk`
**Purpose**: Generates medical education lyrics in bulk using AI.

**Environment Variables**:
- `OPENAI_API_KEY`
- `SUNO_API_KEY` - Suno music generation API
- `BATCH_SIZE` - Items per generation batch

**Input**:
```typescript
{
  itemCodes?: string[];
  rang?: 'A' | 'B' | 'AB' | 'ALL';
  preserveIfBetter?: boolean;
}
```

---

### Medical Content & Management

#### `med-mng-api`
**Purpose**: Medical management API for content and user management.

**Environment Variables**:
- `JWT_SECRET` - JWT signing secret
- `ADMIN_EMAIL` - Administrator email

**Features**:
- Content CRUD operations
- User management
- Analytics and reporting
- Content recommendations

#### `pedagogical-content-api`
**Purpose**: Educational content API for medical learning materials.

**Environment Variables**:
- `CONTENT_API_KEY`
- `LEARNING_OBJECTIVES_DB`

---

## Development Guidelines

### Function Structure
Each function should follow this structure:
```
function-name/
├── index.ts          # Main function code
├── README.md         # Function documentation
├── types.ts          # TypeScript interfaces
└── utils.ts          # Helper functions (if needed)
```

### Required Documentation
Each function must have:
1. **Purpose**: Clear description of what the function does
2. **Environment Variables**: All required and optional env vars
3. **Input Schema**: TypeScript interfaces for input
4. **Output Schema**: TypeScript interfaces for output
5. **Error Handling**: Expected error responses
6. **Usage Examples**: Code examples for common use cases

### Environment Variables
- Use `UPPER_SNAKE_CASE` for environment variable names
- Document default values where applicable
- Mark required vs optional variables clearly

### Error Handling
All functions should:
- Return consistent error response format
- Use appropriate HTTP status codes
- Log errors for debugging
- Include correlation IDs for tracing

### Testing
- Include test cases in function READMEs
- Use descriptive test function names
- Test both success and error scenarios

## Deployment Notes

- Functions are automatically deployed when code is pushed
- Environment variables must be set in Supabase dashboard
- JWT verification is enabled by default (can be disabled in config.toml)
- CORS is configured for web application access

## Troubleshooting

### Common Issues
1. **Authentication Errors**: Check CAS cookies and JWT tokens
2. **Rate Limiting**: Implement exponential backoff
3. **Timeout Issues**: Increase function timeout in config
4. **Memory Errors**: Optimize data processing and use streaming

### Monitoring
- Check function logs in Supabase dashboard
- Monitor execution time and memory usage
- Set up alerts for critical functions

## Contributing

1. Create new functions using the standard structure
2. Document all inputs, outputs, and environment variables
3. Add comprehensive error handling
4. Include usage examples
5. Test thoroughly before deployment

## Contact

For questions or issues with specific functions, check the individual function READMEs or contact the development team.