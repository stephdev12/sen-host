# Sen Studio Host - Project Context

## Project Overview
**Sen Studio Host** is a self-hosted SaaS platform designed to deploy and manage WhatsApp Bots (specifically "Sen Bot"). It provides a modern web interface for users to create, configure, and monitor independent bot instances.

## Tech Stack
- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4, Framer Motion (Animations), Lucide React (Icons)
- **Database:** SQLite (via Prisma ORM)
- **Authentication:** Custom JWT-based auth (Email/Password) with HTTP-only cookies.
- **Bot Engine:** Node.js Child Processes (`spawn`), File System manipulation (`fs-extra`), Process Management (`tree-kill`).

## Architecture
The project is a Monorepo-like structure containing the Platform (Next.js) and the Bot Template.

### Directory Structure
- **`src/app/`**: Next.js source code.
    - `(auth)/`: Login and Register pages.
    - `dashboard/`: Main user interface (Stats, Bot Management, Billing).
    - `api/`: Backend logic.
        - `api/auth/`: JWT handling.
        - `api/bots/`: CRUD operations for bots, process spawning, log streaming.
        - `api/billing/`: MoneyFusion integration (Payment creation, Webhook, Callback).
        - `api/admin/`: Admin endpoints (Stats, Manual Coins).
- **`templates/sen-bot/`**: The "Golden Master" of the WhatsApp bot source code.
    - When a user creates a bot, this folder is *cloned* (files copied, `node_modules` symlinked).
- **`instances/`**: Runtime directory for user bots.
    - Each subfolder (UUID) contains a unique `.env` and `logs.txt`.
- **`prisma/`**: Database schema (`schema.prisma`) and SQLite file (`dev.db`).
- **`cron.js`**: Standalone script for daily coin deduction logic.

## Key Features
1.  **Bot Deployment:**
    - Clones `templates/sen-bot` to `instances/<id>`.
    - Generates specific `.env` (PhoneNumber, Owner).
    - Uses `fs.ensureSymlink` for `node_modules` to save disk space and install time.
    - Spawns `node index.js` detached processes.
2.  **Real-time Monitoring:**
    - Captures `stdout`/`stderr` to `logs.txt`.
    - Streams pairing codes to the frontend via API polling.
3.  **Billing & Coins:**
    - Internal currency ("Coins").
    - Integration with **MoneyFusion** API for pack purchases.
    - Webhook validation for automatic crediting.
4.  **Admin System:**
    - Protected route `/steph` (Password: `stephadmin123@`).
    - User management and manual coin refill.

## Setup & Development

### Prerequisites
- Node.js 18+
- NPM

### Installation
1.  **Platform Dependencies:**
    ```bash
    npm install
    ```
2.  **Bot Template Dependencies:**
    ```bash
    cd templates/sen-bot
    npm install
    ```
    *Note: Essential for symlinking to work.*
3.  **Database:**
    ```bash
    npx prisma migrate dev --name init
    ```

### Running the Platform
- **Development:**
    ```bash
    npm run dev
    ```
    Access: `http://localhost:3000`

- **Production:**
    ```bash
    npm run build
    npm run start
    ```

- **Daily Cron (Billing):**
    ```bash
    node cron.js
    ```

## Development Conventions
- **API Routes:** All logic is in `src/app/api`. Use `NextResponse`.
- **Authentication:** Check `auth_token` cookie in API routes. Use `src/lib/prisma.ts` for DB access.
- **Bot Actions:** Always use `src/app/api/bots/[id]/action` to Start/Stop/Delete to ensure process tree cleanup.

## Current State & Notes
- **Email Auth:** Currently simple password-based. verification email logic is *planned*.
- **Deployment:** Currently runs on localhost. VPS deployment requires Process Manager (PM2) and Reverse Proxy (Nginx).
- **Payment:** MoneyFusion integration uses `pay.moneyfusion.net` (no www). Webhook verifies `personal_Info`.
