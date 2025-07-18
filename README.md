# MED-MNG - Medical Learning Platform

[![CI](https://github.com/laeticiamng/med-mng/actions/workflows/ci.yml/badge.svg)](https://github.com/laeticiamng/med-mng/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/laeticiamng/med-mng/branch/main/graph/badge.svg)](https://codecov.io/gh/laeticiamng/med-mng)

A platform for medical students and professionals to learn through AI-generated musical content. MED-MNG transforms complex medical concepts into memorable songs, making studying more engaging and effective.

## 🎵 Features

- **AI-Powered Song Generation**: Convert medical topics into educational songs using Suno AI
- **Adaptive Learning**: Personalized content based on your progress and learning style
- **Spaced Repetition**: Smart review scheduling to maximize retention
- **Interactive Quizzes**: Test your knowledge with AI-generated questions
- **Progress Tracking**: Detailed analytics and achievement system
- **Social Learning**: Share playlists and collaborate with peers
- **Multi-platform**: Works on web, mobile, and desktop

## 🏗️ Architecture

```
med-mng/
├── apps/
│   ├── api/          # Supabase edge functions
│   ├── worker/       # Background job processing
│   └── cron/         # Scheduled tasks
├── packages/
│   └── shared/       # Shared types and utilities
├── supabase/         # Database migrations and functions
└── src/              # Helper scripts
```

### Tech Stack

- **Backend**: Supabase (PostgreSQL, Auth, Realtime, Storage)
- **API**: Deno-based Edge Functions
- **Workers**: Node.js with BullMQ
- **AI**: Suno AI for music, OpenAI GPT-4 for content
- **Infrastructure**: Docker, Redis, pnpm workspaces

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- pnpm 8+
- Docker & Docker Compose
- Supabase CLI

### Installation

1. Clone the repository:

```bash
git clone https://github.com/laeticiamng/med-mng.git
cd med-mng
```

2. Install dependencies:

```bash
pnpm install
```

3. Set up environment variables:

```bash
cp .env.example .env
# Edit .env with your API keys
```

4. Start the development environment:

```bash
# Start all services with Docker
docker compose up -d

# Or start services individually
supabase start
pnpm dev
```

5. Run database migrations:

```bash
pnpm db:migrate
pnpm db:seed
```

## 📚 API Documentation

### Authentication

All endpoints require Supabase authentication via Bearer token.

### Core Endpoints

#### Songs

- `POST /songs` - Create a new medical song
- `GET /songs/:id/stream` - Stream generated audio
- `POST /songs/:id/like` - Like/unlike a song
- `GET /songs/:id/lyrics` - Get song lyrics

#### Learning

- `POST /learning/sessions` - Start a learning session
- `POST /learning/sessions/:id/complete` - Complete session
- `GET /learning/progress` - Get user progress
- `GET /quiz/:topicId` - Get quiz questions

#### User

- `GET /profile` - Get user profile
- `PUT /profile` - Update profile
- `GET /stats` - Get learning statistics
- `GET /recommendations` - Get personalized recommendations

### Workers

The platform uses background workers for:

- **Music Generation**: Process song creation with Suno AI
- **Content Processing**: Extract medical information and generate quizzes
- **Notifications**: Send study reminders and achievement notifications
- **Analytics**: Aggregate usage data and calculate metrics

## 🔧 Development

### Running Tests

```bash
pnpm test              # Run all tests
pnpm test:e2e         # Run E2E tests
```

### Code Quality

```bash
pnpm lint             # Run ESLint
pnpm format           # Format with Prettier
pnpm typecheck        # TypeScript type checking
```

### Database Management

```bash
supabase db reset     # Reset database
supabase db push      # Apply migrations
supabase db diff      # Generate migration
```

## 🚢 Deployment

### Using Docker

```bash
docker build -t med-mng .
docker run -p 3000:3000 med-mng
```

### Supabase Functions

```bash
supabase functions deploy
```

### Production Checklist

- [ ] Set production environment variables
- [ ] Configure Stripe webhooks
- [ ] Set up monitoring (Sentry)
- [ ] Configure email service
- [ ] Enable Supabase Row Level Security
- [ ] Set up backup strategy

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please read our contributing guidelines and code of conduct before submitting PRs.

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Suno AI for music generation capabilities
- OpenAI for content processing
- Supabase for the backend infrastructure
- The medical education community for feedback and support

## 📧 Contact

For questions or support, please open an issue on GitHub or contact the maintainers.

---

Made with ❤️ by the MED-MNG team
