# Bhavana Studio

A production-ready photography studio website with a client gallery portal, admin panel, and image processing pipeline.

## Architecture

```
bhavana/
├── apps/
│   ├── web/                    # Next.js 14 public marketing site
│   ├── client-dashboard/       # Next.js 14 client private gallery
│   └── api/                    # Express.js REST API
├── services/
│   └── image-processing/       # Sharp image processing microservice
├── infrastructure/
│   ├── docker/                 # Dockerfiles
│   └── nginx/                  # Reverse proxy config
├── docker-compose.yml
└── .env.example
```

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 20+
- npm 10+

### 1. Clone & setup environment

```bash
cp .env.example .env
# Edit .env with your values
```

### 2. Start with Docker

```bash
docker-compose up -d
```

Services will be available at:
| Service | URL |
|---------|-----|
| Public Website | http://localhost:3000 |
| Client Dashboard | http://localhost:3001 |
| API | http://localhost:4000 |
| MinIO Console | http://localhost:9001 |
| Adminer (DB) | http://localhost:8080 |

### 3. Local Development

```bash
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

## Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@bhavanastudio.com | Admin@12345 |
| Sample Client | client@example.com | Client@12345 |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Public Frontend | Next.js 14, TailwindCSS, TypeScript |
| Client Dashboard | Next.js 14, TailwindCSS, NextAuth.js |
| API | Node.js, Express, TypeScript |
| Database | PostgreSQL 15 |
| Auth | NextAuth.js + JWT |
| Storage | MinIO (S3-compatible) |
| Image Processing | Sharp |
| Cache | Redis |
| Reverse Proxy | Nginx |

## Features

### Public Website
- Editorial-style portfolio with cinematic hero
- Portfolio gallery with category filtering
- Packages & pricing page
- About page with studio story
- Contact form

### Client Dashboard
- Private gallery per client (email-scoped)
- Like photos
- Select photos for album
- Filter by liked / selected
- Download individual or bulk download selected
- Pagination & lazy loading

### Admin Panel
- Create & manage clients
- Upload photos with auto-processing (thumbnail, preview, original)
- Assign photos to clients
- View client selections

### Image Pipeline
- Auto-generates 3 variants per upload:
  - **Thumbnail** – 400×300 WebP
  - **Preview** – 1200×900 WebP
  - **Original** – Full resolution, lossless

## Database Schema

See `apps/api/src/db/schema.sql` for the complete schema.

## API Reference

Base URL: `http://localhost:4000/api`

### Auth
- `POST /auth/login` – Client/Admin login
- `POST /auth/logout` – Logout

### Clients (Admin)
- `GET /admin/clients` – List all clients
- `POST /admin/clients` – Create client
- `GET /admin/clients/:id` – Get client details with selections

### Photos (Admin)
- `POST /admin/photos/upload` – Upload & process photos
- `POST /admin/photos/assign` – Assign photos to client
- `GET /admin/photos` – List all photos

### Gallery (Client)
- `GET /gallery` – Get my photos
- `POST /gallery/photos/:id/like` – Toggle like
- `POST /gallery/photos/:id/select` – Toggle select
- `GET /gallery/download/:id` – Download photo
- `POST /gallery/download/bulk` – Bulk download selected
