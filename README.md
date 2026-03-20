# Purple Compiler & TypeSpeed Tracker

A modern, high-performance workspace for developers that combines a multi-language code compiler with a precision typing speed tracker. Designed for both quick coding tasks and professional typing assessment.

## 🚀 Key Features

- **🌐 Multi-Language Compiler**: Fast, synchronous code execution for Python, C, C++, Java, Node.js, Ruby, Go, Rust, and more.
- **⚡ Pro Typing Speed Tracker**: Integrated Svelte-based typing engine with real-time WPM/CPM calculation and full aesthetic customization.
- **✨ Intelligent Editor**: Powered by **Monaco Editor** (the engine behind VS Code), providing syntax highlighting, auto-completion, and multi-cursor support.
- **📱 Ultra-Responsive Design**: Tailored experience for both desktop and mobile (Android/iOS), including optimized settings panels for handheld devices.
- **📊 Real-time Execution Insights**: Tracks script runs, language distribution, and execution counts with geography-based logging.
- **🤖 Smart UI Components**: Styled with **Shadcn/UI**, **Lucide Icons**, and custom animations for a premium look and feel.

 ---

## 📁 Project Structure

The project is organized into three main components:

- **`/frontend`**: The primary React/Vite dashboard.
- **`/backend`**: Node.js/Express API handling data storage and remote code execution.
- **`/Typer`**: Standalone Svelte typing test (injected into the main dashboard via iframe).

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, Monaco Editor, Lucide |
| **Backend** | Node.js, Express, Mongoose, Axios |
| **Database** | MongoDB (Atlas recommended) |
| **Typing Engine** | Svelte 4, UnoCSS, TypeScript |
| **Remote Compiler** | OnlineCompiler API (via sync endpoint) |

---

## 🔧 Environment Setup

### Consolidated Required Variables

| Variable | Description | Value Example |
| :--- | :--- | :--- |
| `PORT` | Backend server port | `5001` |
| `MONGO_URI` | MongoDB Connection URL | `mongodb+srv://...` |
| `COMPILER_API_KEY` | API Key for code execution | `your_token_from_onlinecompiler_io` |
| `VITE_BASE_URL` | Frontend API endpoint | `http://localhost:5001/` |
| `VITE_SOCKET_URL` | Socket Connection URL | `http://localhost:5001` |
| `JWT_SECRET` | Auth Token Secret | `your_secure_string` |

---

## 🚀 Deployment Requirements

The project uses a tiered build process to ensure the typing engine is correctly embedded into the main dashboard.

### 1. Backend Deployment
- **Runtime**: Node.js 18.x or 20.x.
- **Database**: Ensure MongoDB connectivity.
- **Build Command**: `npm install && npm start` (or `pm2 start server.js`).

### 2. Frontend & Typer Build Flow
Since the typing test is a standalone Svelte app served from the React frontend's static folder, follow this exact sequence:

```bash
# A. Build the Typer (Svelte)
cd Typer
npm install
npm run build

# B. Move Typer Build to Frontend
# Assuming your folders are sibling directories
mkdir -p ../frontend/public/typer
cp -r dist/* ../frontend/public/typer/

# C. Build the Main Frontend (React)
cd ../frontend
npm install
npm run build
```

The resulting `frontend/dist` directory is ready for static hosting (Vercel, Netlify, MilesWeb).

---

## 🛡️ License

MIT License. Designed with ❤️ for the Developer Community.
