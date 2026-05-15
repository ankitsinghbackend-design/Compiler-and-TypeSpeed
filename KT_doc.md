# 🌌 Technical Knowledge Transfer (KT) Document: Purple Compiler Ecosystem
**Project Name:** Purple Compiler & TypeSpeed Tracker
**Developer Source:** Ankit Singh
**Technical Target:** Full Documentation for Claude Code Integration

---

## 🏗️ 1. System Architecture & High-Level Workflow

The project is architected as a **Component-Based Monorepo** (logically partitioned into three sub-services) with a strong emphasis on decoupling the high-performance typing engine from the primary dashboard.

### 📐 Structural Overview
1.  **Backend (Node.js/Express)**: The "Brain" and "Broker". It exposes a RESTful API and proxies complex execution calls to remote high-availability compiler servers.
2.  **Frontend Dashboard (React/Vite)**: The "Orchestrator". It hosts the Monaco Editor, handles routing, and embeds the typing engine.
3.  **Typer Project (Svelte/Vite)**: The "Specialist". A high-FPS, lightweight typing engine built with Svelte for minimal overhead and maximum responsiveness.

### 🔄 The Building & Linking Workflow (Crucial)
The project uses a **tiered embedding** strategy:
- The **Typer** is built first, generating a static site in `./Typer/dist`.
- These assets are copied into the **Frontend's** `./frontend/public/typer` directory.
- The **Frontend** is then built, effectively "packaging" the Svelte app inside the React app.
- At runtime, the React app loads the Svelte app through an `<iframe>` at the `/typer` route.

---

## 🛠️ 2. Comprehensive Tech Stack (Minute Details)

### 💻 Frontend (React Dashboard)
- **Framework**: React 18 (Vite)
- **Editor**: `@monaco-editor/react` (v4.6.0)
- **Icons**: `lucide-react` (v0.511.0)
- **Styling**: Tailwind CSS (v3.4.16) + Shadcn/UI Component System
- **Real-time**: `socket.io-client` (v4.8.1)
- **PDF Export**: `html2pdf.js` (v0.10.2)
- **Notifications**: `react-toastify` (v11.0.2) & `react-hot-toast` (v2.4.1)

### ⚙️ Backend (Express API)
- **Runtime**: Node.js (Modules Type: ESNext)
- **Web Framework**: Express (v4.21.2)
- **Database client**: `pg` (v8.x) against **Neon** PostgreSQL; schema applied on startup (`backend/db/migrate.js`).
- **CORS**: Configured with dynamic regex for Vercel preview environments (`/\.vercel\.app$/`).
- **External Integration**: `axios` (v1.9.0) for proxying code runs to `api.onlinecompiler.io`.

### ⚡ Typer (Svelte Engine)
- **Framework**: Svelte 4 (Vite)
- **CSS Engine**: UnoCSS (v0.53.6) for atomic, high-speed styling.
- **Language**: TypeScript
- **Calculation Logic**: WPM = (Correct Symbols / 5) / (Time in Minutes).

---

## 📡 3. API Specification & Endpoints

### 🟢 Core Endpoints (`/`)
- `GET /`: Returns basic API metadata (version, status).
- `GET /health`: Returns detailed system health, uptime, and server timestamp.

### 💻 Compiler API (`/api/compiler`)
- **`POST /run`**: Executes code.
    - **Body**: `{ language: string, code: string, input: string }`
    - **Logic**:
        - Fetches user IP and queries `ip-api.com` for geographic context.
        - Maps language to internal compiler ID (e.g., `python` -> `python-3.14`).
        - Forwards to remote API with `Authorization: process.env.COMPILER_API_KEY`.
        - Logs the result to the `compiler_runs` table in PostgreSQL (Neon).
    - **Response**: `{ success: boolean, output: string }`

### ⌨️ Typing API (`/api/typing`)
- **`POST /log`**: Records typing performance.
    - **Body**: `{ wpm: number, spm: number, accuracy: number, time: number }`
    - **Logic**: Logs metrics along with requester's geographic location.
- **`GET /logs`**: Retrieves history.
    - **Logic**: Returns the 10 most recent entries sorted by date.

---

## 🗄️ 4. Database (PostgreSQL / Neon)

DDL lives in `backend/db/schema.sql` (also executed automatically from `backend/db/migrate.js`). Env: `NEON_DB_URI`.

### Table `compiler_runs`
| Column | Type | Description |
| :--- | :--- | :--- |
| `location` | text | Format: `City, Country` |
| `language` | text | e.g. "python", "cpp" |
| `input` | text | The actual source code executed |
| `result` | text | Stdout, stderr, or error message |
| `created_at` | timestamptz | Default `now()` |

### Table `typing_logs`
| Column | Type | Description |
| :--- | :--- | :--- |
| `location` | text | Requester's geo-location |
| `wpm` | double precision | Words per minute |
| `spm` | double precision | Symbols per minute |
| `accuracy` | double precision | Percentage (0–100) |
| `time` | double precision | Duration in seconds |
| `created_at` | timestamptz | Default `now()` |

### Table `typing_results`
Reserved for legacy `TypingResult`-shaped data (flattened `result_*` columns); not used by current HTTP handlers.

---

## 🧪 5. Testing & Validation

### 🧪 Unit/Integration Testing
- **Backend**: Uses **Jest** (`jest.config.cjs`). Current setup includes experimental VM modules support for ESM.
- **Frontend**: Uses **Jest** + **Testing Library**.
    - Configuration: `maxWorkers=50%` to avoid CI memory leaks.
    - File: `frontend/src/simple.test.js` (Placeholder for routing/render tests).

### 🖥️ E2E Testing (Typer)
- Uses **Cypress** (`cy:run` script).
- Optimized via `start-server-and-test` to spin up the Svelte server before running scenarios.

---

## 🎯 6. Minute Details & Configuration

### Language Mapping Table (`executeCode.js`)
| App Language | Mapping ID (Remote) |
| :--- | :--- |
| Python | `python-3.14` |
| C | `gcc-15` |
| C++ | `g++-15` |
| Java | `openjdk-25` |
| Go | `go-1.26` |
| Rust | `rust-1.93` |
| JavaScript / TypeScript | `typescript-deno` |

### 🌍 Geolocation Logic
- Utilizes `getLocationFromIP.js` utility.
- Handles `127.0.0.1` and `::1` by falling back to querying the server's own public IP for development consistency.
- Extracts IP from `x-forwarded-for` header (for proxy support) or `socket.remoteAddress`.

### 📱 Responsive Design Matrix
- **Mobile Width (<768px)**: UI hides ads and side panels.
- **Android Support**: Specific focus on `TypeSpeed.jsx` iframe height and Monaco Editor auto-resize.

---

## 🚀 7. Deployment & Containerization

### 🐳 Docker Configuration (Frontend)
The frontend includes a multi-stage `Dockerfile`:
- **Build Stage**: Uses `node:18-alpine` to install dependencies via `npm ci` and generate the build.
- **Production Stage**: Uses a lightweight alpine image and the `serve` package to host the static files on port `5173`.
- **Development Stage**: Optimized for hot-reloading with `--host 0.0.0.0` to allow external access (useful for mobile testing).

### ☁️ Hosting (MilesWeb/Vercel)
1.  **Initialize DB**: Set `NEON_DB_URI` and confirm the Neon project accepts connections from your host (tables are created on backend startup).
2.  **Environment Sync**: Populate `.env` in all folders using the Root `.env.example`.
3.  **The "Chain Build" (Critical Order)**:
    ```bash
    # Step A: Build Core logic (Svelte)
    cd Typer && npm run build
    
    # Step B: Link Build (Vite doesn't do this automatically)
    cp -r dist/* ../frontend/public/typer/
    
    # Step C: Build Frontend Bundle
    cd ../frontend && npm run build
    
    # Step D: Launch Backend
    cd ../backend && npm start
    ```
4.  **Static Serving**: Configure host to serve `/index.html` for all routes in the `frontend/dist` directory to support SPA routing.

---
**Document Status**: Finalized for Documentation Generation (Exhaustive Edition).
**Maintainer**: Ankit Singh.
