# Agro HQ

Agro Business Operating System - A centralized platform for managing agro operations, replacing scattered WhatsApp discussions, PowerPoint files, PDFs, and manual updates.

## Features

- **Dashboard** - Executive overview with KPI cards and activity feed
- **Organization** - Manage shareholder profiles and team structure
- **Tasks** - Full task management with table, kanban, and calendar views
- **Authentication** - Secure login with role-based access control
- **Dark Theme** - Premium corporate dashboard with agriculture-inspired colors

## Tech Stack

- **Frontend**: Next.js 15, TypeScript, TailwindCSS, shadcn/ui
- **Backend**: Next.js API Routes, Drizzle ORM
- **Database**: PostgreSQL
- **Auth**: Better Auth
- **Storage**: MinIO (S3-compatible)
- **State**: React Query, Zustand
- **Deployment**: Docker Compose

## Getting Started

### Prerequisites

- Node.js 20+
- Docker and Docker Compose
- npm or yarn

### Development Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd agro
```

2. **Install dependencies**
```bash
npm install --legacy-peer-deps
```

3. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Start infrastructure services**
```bash
docker-compose up -d postgres minio redis
```

5. **Run database migrations**
```bash
npm run db:push
```

6. **Start the development server**
```bash
npm run dev
```

7. **Open your browser**
Navigate to `http://localhost:3000`

### First Run

1. Visit `/setup` to create the first admin account
2. Complete the setup wizard
3. Invite partners via the Organization page
4. Start creating tasks and managing your operations

## Project Structure

```
agro/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/             # Auth routes (login, setup, invite)
│   │   ├── (dashboard)/        # Protected dashboard routes
│   │   ├── api/                # API routes
│   │   └── layout.tsx          # Root layout
│   ├── components/
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── layout/             # Layout components (sidebar, header)
│   │   ├── tasks/              # Task module components
│   │   ├── organization/       # Organization module components
│   │   └── providers/          # React context providers
│   ├── lib/
│   │   ├── auth/               # Better Auth configuration
│   │   ├── db/                 # Drizzle ORM schema and client
│   │   ├── storage/            # MinIO client
│   │   └── utils.ts            # Utility functions
│   └── hooks/                  # Custom React hooks
├── docker/
│   ├── Dockerfile              # App container
│   └── nginx.conf              # Nginx configuration
├── drizzle.config.ts           # Drizzle configuration
└── docker-compose.yml          # Infrastructure services
```

## Environment Variables

```bash
# Database
DATABASE_URL=postgresql://agro:secret@localhost:5432/agro_hq

# Auth
BETTER_AUTH_SECRET=your_auth_secret_at_least_32_chars

# MinIO
MINIO_ENDPOINT=http://localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=agro-hq

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Docker Deployment

### Production Setup

1. **Configure environment**
```bash
cp .env.example .env
# Set secure passwords and secrets
```

2. **Build and start all services**
```bash
docker-compose up -d --build
```

3. **Run migrations**
```bash
docker-compose exec app npm run db:push
```

4. **Access the application**
Navigate to `http://your-server-ip`

## Phase Roadmap

- **Phase 1** (Current): Foundation + Tasks Module
- **Phase 2**: Meetings, Progress Updates, Vision & Mission
- **Phase 3**: Documents, Financial Module
- **Phase 4**: Roadmap, Reports
- **Phase 5**: AI-Powered Presentation Builder

## License

Private - All rights reserved
