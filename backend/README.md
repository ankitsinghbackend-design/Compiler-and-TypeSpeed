# LabBuddy Backend

LabBuddy is an intelligent coding assistant platform that helps developers with code analysis, suggestions, and management.

## 🚀 Features

- Authentication & Authorization
- Code Analysis & Execution
- AI-Powered Code Suggestions (Gemini Integration)
- Notebook Management
- Code Snippets Management
- Q&A System
- Smart Code Suggestions

## 📁 Project Structure

```
labbuddy-backend/
├── config/           # Configuration files
├── controllers/      # Request handlers
├── middleware/       # Custom middleware functions
├── models/          # Database models
├── routes/          # API routes
├── utils/           # Utility functions
└── server.js        # Main application entry
```

## 🔧 Core Components

### Models

1. `User.js` - User authentication and profile management
2. `Notebook.js` - Code notebook storage and organization
3. `QA.js` - Question and answer management
4. `Snippets.js` - Code snippets storage
5. `Suggestions.js` - AI-powered code suggestions

### Controllers

1. `authController.js` - User authentication operations
2. `notebookController.js` - Notebook CRUD operations
3. `qaController.js` - Q&A system management
4. `snippetController.js` - Code snippets management
5. `geminiController.js` - AI integration with Google's Gemini
6. `suggestionController.js` - Code suggestions handling
7. `codeRunnerController.js` - Code execution management

### Routes

1. `authRoutes.js` - Authentication endpoints
2. `notebookRoutes.js` - Notebook management endpoints
3. `qaRoutes.js` - Q&A system endpoints
4. `snippetRoutes.js` - Code snippets endpoints
5. `geminiRoutes.js` - AI integration endpoints
6. `suggestionRoutes.js` - Code suggestions endpoints
7. `codeRunnerRoutes.js` - Code execution endpoints

### Utils

1. `complexity.js` - Code complexity analysis
2. `executeCode.js` - Safe code execution environment
3. `scheduler.js` - Task scheduling utilities
4. `suggestion.js` - AI suggestion processing
5. `testCases.js` - Test case management

## 🔒 Authentication & Authorization

The system uses JWT (JSON Web Tokens) for authentication. Protected routes require a valid JWT token in the request header.

## 💻 Code Execution

The platform provides a secure environment for code execution with:

- Runtime isolation
- Memory limits
- Execution timeouts
- Multiple language support

## 🤖 AI Integration

Integrated with Google's Gemini for:

- Code analysis
- Smart suggestions
- Code optimization
- Bug detection

## 📝 API Documentation

### Authentication Endpoints

- POST `/api/auth/register` - User registration
- POST `/api/auth/login` - User login

### Notebook Endpoints

- GET `/api/notebooks` - Get all notebooks
- POST `/api/notebooks` - Create notebook
- PUT `/api/notebooks/:id` - Update notebook
- DELETE `/api/notebooks/:id` - Delete notebook

### Code Snippets Endpoints

- GET `/api/snippets` - Get all snippets
- POST `/api/snippets` - Create snippet
- PUT `/api/snippets/:id` - Update snippet
- DELETE `/api/snippets/:id` - Delete snippet

### Q&A Endpoints

- GET `/api/qa` - Get all Q&As
- POST `/api/qa` - Create Q&A
- PUT `/api/qa/:id` - Update Q&A
- DELETE `/api/qa/:id` - Delete Q&A

### Code Execution Endpoints

- POST `/api/code/run` - Execute code
- GET `/api/code/status/:id` - Get execution status

## 🛠️ Setup & Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   ```
   PORT=3000
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   GEMINI_API_KEY=your_gemini_api_key
   ```
4. Start the server:
   ```bash
   npm start
   ```

## 🔐 Environment Variables

Required environment variables:

- `PORT` - Server port
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `GEMINI_API_KEY` - Google Gemini API key

## 📦 Dependencies

Key dependencies include:

- Express.js - Web framework
- Mongoose - MongoDB ODM
- JWT - Authentication
- Google Gemini API - AI integration
- Node-schedule - Task scheduling
