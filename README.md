# 🤖 AI Chatbot Testing Platform

> A modern, full-stack conversational AI testing platform built with Next.js 14, NestJS, MongoDB, and advanced authentication.

![Project Status](https://img.shields.io/badge/status-active-success.svg)
![Node Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Environment Setup](#-environment-setup)
- [Security Guidelines](#-security-guidelines)
- [Running the Project](#-running-the-project)
- [Usage Guide](#-usage-guide)
- [Project Structure](#-project-structure)
- [API Endpoints](#-api-endpoints)
- [Commands Reference](#-commands-reference)
- [Customization](#-customization)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)

---

## 🎯 Overview

A production-ready, full-stack chatbot platform that enables users to test and compare multiple AI models through a unified, beautiful interface. Features include persistent authentication, chat history management, real-time messaging, and a luxury animated dark theme.

### Key Highlights:
- ✨ **Modern UI/UX** - Glassmorphism, Framer Motion animations, dynamic backgrounds
- 🔐 **Secure Authentication** - JWT-based auth with persistent login
- 💬 **Chat Management** - Create, save, restore, and delete conversations
- 🤖 **Multi-AI Support** - Test GPT-4, Claude, and other models in one place
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile
- 💾 **Data Persistence** - All chats and messages saved to MongoDB

---

## ✨ Features

### Authentication & Security
- JWT-based authentication with 7-day expiration
- Persistent login (survives page refresh)
- Password hashing with bcrypt
- Protected routes and API endpoints

### Chat Management
- **Auto-create default chat** after login/signup
- **Chat sidebar** with glassmorphism design
- **Create new chats** with animated button
- **Restore previous conversations** with one click
- **Edit chat titles** inline
- **Delete chats** with confirmation
- **Export chat history** as JSON

### AI Integration
- Switch between multiple AI models via dropdown
- Real-time message streaming
- Conversation history context
- Model-specific configurations
- Support for OpenAI, Anthropic (via OpenRouter)

### UI/UX
- **Animated gradient backgrounds** with floating particles
- **Glassmorphism effects** throughout the interface
- **Smooth transitions** between all pages
- **Interactive elements** with hover effects
- **Typing indicators** with animated dots
- **Message bubbles** with slide-in animations
- **Luxury dark theme** optimized for readability

---

## 🛠 Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS v4** - Utility-first styling
- **Framer Motion** - Advanced animations
- **shadcn/ui** - Beautiful UI components
- **Zustand** - State management with persistence
- **React Icons** - Icon library

### Backend
- **NestJS** - Progressive Node.js framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **Passport JWT** - Authentication strategy
- **bcrypt** - Password hashing
- **class-validator** - DTO validation

### Development Tools
- **ESLint** - Code linting
- **TypeScript** - Static typing
- **Hot Reload** - Both frontend and backend

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

| Tool | Version | Download |
|------|---------|----------|
| **Node.js** | ≥ 18.0.0 | [nodejs.org](https://nodejs.org/) |
| **npm** | ≥ 9.0.0 | Included with Node.js |
| **MongoDB** | ≥ 6.0.0 | [mongodb.com/try/download/community](https://www.mongodb.com/try/download/community) |
| **Git** | Latest | [git-scm.com](https://git-scm.com/) |

### Verify Installation:
```bash
node --version    # Should be v18.0.0 or higher
npm --version     # Should be 9.0.0 or higher
mongod --version  # Should be 6.0.0 or higher
```

---

## 🚀 Installation

### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd ChatBot
```

### 2. Install Frontend Dependencies
```bash
cd frontend
npm install
```

### 3. Install Backend Dependencies
```bash
cd ../backend
npm install
```

---

## ⚙️ Environment Setup

### Backend Environment Variables

Create a `.env` file in the `/backend` directory:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/chatbot

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Server
PORT=3001
NODE_ENV=development

# AI API Keys (OpenRouter)
OPENROUTER_API_KEY=your-openrouter-api-key-here

# CORS
CORS_ORIGIN=http://localhost:3000
```

### Frontend Environment Variables

Create a `.env.local` file in the `/frontend` directory:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001

# Development
NODE_ENV=development
```

### Getting API Keys

1. **OpenRouter API Key:**
   - Visit [openrouter.ai](https://openrouter.ai/)
   - Sign up for an account
   - Generate an API key from the dashboard
   - Add credits to your account
   - Paste the key in your backend `.env` file

2. **MongoDB (if using Atlas):**
   - Visit [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   - Create a free cluster
   - Get your connection string
   - Replace `MONGODB_URI` in backend `.env`

---

## 🔒 Security Guidelines

### ⚠️ Important Security Rules

1. **NEVER commit `.env` or `.env.local` files** to Git
2. **NEVER commit real API keys, passwords, or secrets** to the repository
3. **Always use `.env.example`** files with placeholder values only
4. **Rotate credentials immediately** if accidentally exposed

### 🛡️ Environment Variables Setup

Both frontend and backend folders contain `.env.example` files with placeholder values. Follow these steps:

#### Backend Setup:
```bash
cd backend
cp .env.example .env
# Edit .env and replace all placeholder values with your actual credentials
```

#### Frontend Setup:
```bash
cd frontend
cp .env.example .env.local
# Edit .env.local and replace placeholder values
```

### 🔑 Secure Credential Storage

- **Local Development**: Store credentials in `.env` files (automatically ignored by Git)
- **Production**: Use environment variable services (Vercel, Heroku, AWS Secrets Manager)
- **CI/CD**: Use GitHub Secrets or similar secure secret management

### 📋 Security Checklist

Before every commit:
- [ ] No `.env` files in staging area
- [ ] Only `.env.example` files with placeholders committed
- [ ] No hardcoded API keys in source code
- [ ] All sensitive configuration externalized

📖 **For detailed security guidelines, see [SECURITY.md](./SECURITY.md)**

---

## 🏃 Running the Project

### Option 1: Manual Start (Recommended for Development)

#### Start MongoDB
```bash
# Windows
mongod --dbpath C:\data\db

# macOS/Linux
mongod --dbpath /data/db
```

#### Start Backend Server
```bash
cd backend
npm run start:dev
```
✅ Backend will run on **http://localhost:3001**

#### Start Frontend Server
```bash
cd frontend
npm run dev
```
✅ Frontend will run on **http://localhost:3000**

### Option 2: Using Batch Files (Windows)

#### Start Everything
```bash
# From project root
start.bat
```

#### View Database
```bash
view-database.bat      # Opens MongoDB Compass
view-chats.bat         # View chats in console
view-all-chats.js      # Detailed chat view
```

### Production Build

#### Backend
```bash
cd backend
npm run build
npm run start
```

#### Frontend
```bash
cd frontend
npm run build
npm start
```

---

## 📖 Usage Guide

### Step 1: Create an Account

1. Navigate to **http://localhost:3000**
2. Click **"Sign Up"**
3. Fill in:
   - **Name:** Your full name
   - **Email:** Valid email address
   - **Password:** Minimum 6 characters
   - **Confirm Password:** Must match
4. Click **"Sign Up"** button
5. You'll be automatically redirected to the chat interface with a welcome chat created

### Step 2: Sign In (Existing Users)

1. Go to **http://localhost:3000/login**
2. Enter your **email** and **password**
3. Click **"Sign In"**
4. A new chat will be created automatically

### Step 3: Start Chatting

1. Type your message in the input field at the bottom
2. Press **Enter** or click the **Send** button (🚀)
3. AI will respond based on the selected model
4. All messages are **automatically saved** to MongoDB

### Step 4: Switch AI Models

1. Click the **Model Selector** dropdown in the header
2. Choose from available models:
   - 🤖 **GPT-4o Mini** - Fast, cost-effective
   - 🧠 **Claude 3.5 Sonnet** - Advanced reasoning
3. The new model will be used for subsequent messages

### Step 5: Manage Chat History

#### Create New Chat
- Click the **"+ New Chat"** button in the sidebar
- A fresh conversation starts immediately
- Previous chat is automatically saved

#### Restore Previous Chat
- Click any chat in the **sidebar**
- All messages load instantly
- Continue the conversation

#### Edit Chat Title
- Click the **edit icon** (✏️) next to a chat
- Type new title
- Press **Enter** or click outside to save

#### Delete Chat
- Click the **trash icon** (🗑️) next to a chat
- Confirm deletion
- Chat is permanently removed

### Step 6: Export Chat History

1. Open any chat
2. Click **"Export"** button
3. Chat downloads as JSON file
4. Use for backup or analysis

### Step 7: Clear Messages

1. Click **"Clear"** button in the chat window
2. Clears current view (messages still in database)
3. Reload chat from sidebar to restore

### Step 8: Logout

- Click the **logout icon** (🚪) in the header
- You'll be redirected to login page
- Your session and chats remain saved

---

## 📁 Project Structure

```
ChatBot/
├── backend/                    # NestJS backend
│   ├── src/
│   │   ├── auth/              # Authentication module
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── jwt.strategy.ts
│   │   │   ├── guards/
│   │   │   └── dto/
│   │   ├── chat/              # Chat module
│   │   │   ├── chat.controller.ts
│   │   │   ├── chat.service.ts
│   │   │   ├── schemas/       # MongoDB schemas
│   │   │   └── dto/
│   │   ├── users/             # User module
│   │   │   ├── users.service.ts
│   │   │   └── schemas/
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── .env                   # Environment variables
│   └── package.json
│
├── frontend/                   # Next.js 14 frontend
│   ├── app/                   # App Router
│   │   ├── page.tsx           # Main chat page
│   │   ├── login/page.tsx     # Login page
│   │   ├── signup/page.tsx    # Signup page
│   │   ├── layout.tsx         # Root layout
│   │   └── globals.css        # Global styles
│   ├── components/
│   │   ├── ChatWindow.tsx     # Main chat interface
│   │   ├── ChatSidebar.tsx    # Chat history sidebar
│   │   ├── MessageBubble.tsx  # Individual messages
│   │   ├── ModelSelector.tsx  # AI model dropdown
│   │   ├── TypingIndicator.tsx # Animated typing dots
│   │   ├── AnimatedBackground.tsx # Dynamic background
│   │   └── ui/                # shadcn components
│   ├── store/                 # Zustand state management
│   │   ├── authStore.ts       # Auth state
│   │   ├── chatStore.ts       # Chat state
│   │   └── chatHistoryStore.ts # History state
│   ├── lib/                   # Utilities and API clients
│   │   ├── apiClient.ts       # AI API calls
│   │   ├── authClient.ts      # Auth API calls
│   │   ├── chatHistoryClient.ts # Chat history API
│   │   └── utils.ts           # Helper functions
│   ├── config/
│   │   └── models.ts          # AI model configurations
│   ├── types/
│   │   └── index.ts           # TypeScript types
│   ├── .env.local             # Frontend environment
│   └── package.json
│
├── .gitignore
├── README.md                   # This file
└── package.json                # Root package.json
```

---

## 🌐 API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/signup` | Create new user account | ❌ |
| POST | `/auth/login` | Sign in existing user | ❌ |
| GET | `/auth/profile` | Get current user profile | ✅ |
| GET | `/auth/users` | List all users (admin) | ✅ |

### Chat

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/chat` | Send message to AI | ❌ |
| GET | `/api/models` | Get available AI models | ❌ |

### Chat History

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/chats` | Create new chat | ✅ |
| GET | `/api/chats` | Get user's all chats | ✅ |
| GET | `/api/chats/:id` | Get specific chat with messages | ✅ |
| POST | `/api/chats/:id/messages` | Add message to chat | ✅ |
| PUT | `/api/chats/:id/title` | Update chat title | ✅ |
| DELETE | `/api/chats/:id` | Delete chat | ✅ |

---

## 💻 Commands Reference

### Backend Commands

```bash
# Development
npm run start:dev          # Start with hot reload
npm run start:debug        # Start in debug mode

# Production
npm run build              # Build for production
npm run start              # Start production server

# Testing
npm run test               # Run unit tests
npm run test:e2e           # Run end-to-end tests
npm run test:cov           # Generate coverage report

# Linting
npm run lint               # Lint code
npm run format             # Format code
```

### Frontend Commands

```bash
# Development
npm run dev                # Start development server
npm run dev --turbo        # Start with Turbopack

# Production
npm run build              # Build for production
npm start                  # Start production server

# Linting
npm run lint               # Lint code
npm run lint:fix           # Fix linting issues

# Type Checking
npm run type-check         # Check TypeScript types
```

### Database Commands

```bash
# View chats in console
node view-all-chats.js

# MongoDB Compass (GUI)
view-database.bat          # Windows only

# Backup database
mongodump --db chatbot --out ./backup

# Restore database
mongorestore --db chatbot ./backup/chatbot
```

---

## 🎨 Customization

### Adding New AI Models

Edit `/frontend/config/models.ts`:

```typescript
export const AVAILABLE_MODELS = [
  {
    id: 'your-model-id',
    name: 'Your Model Name',
    description: 'Model description',
    icon: '🤖',
    provider: 'openai', // or 'anthropic'
  },
  // ... existing models
];
```

Then update backend `/backend/src/chat/chat.service.ts` if needed.

### Changing Theme Colors

Edit `/frontend/app/globals.css`:

```css
@theme {
  --color-primary-500: /* your color */;
  --color-secondary-500: /* your color */;
  /* ... more colors */
}
```

### Adjusting JWT Expiration

Edit `/backend/.env`:

```env
JWT_EXPIRES_IN=30d    # Change to 30 days
```

### Modifying Animation Speed

Edit animation durations in components:

```typescript
// Faster animations
transition={{ duration: 0.2 }}  // Instead of 0.5

// Slower animations
transition={{ duration: 1.0 }}  // Instead of 0.5
```

---

## 🐛 Troubleshooting

### MongoDB Connection Issues

**Problem:** `MongooseError: Connection failed`

**Solution:**
```bash
# Check if MongoDB is running
mongosh

# If not, start MongoDB
mongod --dbpath C:\data\db

# Or create data directory first
mkdir C:\data\db
mongod --dbpath C:\data\db
```

### Port Already in Use

**Problem:** `Error: listen EADDRINUSE: address already in use :::3000`

**Solution:**
```bash
# Windows - Kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F

# Change port in package.json
"dev": "next dev -p 3001"
```

### JWT Token Invalid

**Problem:** `401 Unauthorized` on API calls

**Solution:**
1. Clear localStorage in browser
2. Logout and login again
3. Check if `JWT_SECRET` matches in backend `.env`

### Messages Not Saving

**Problem:** Messages disappear after refresh

**Solution:**
1. Check browser console for errors
2. Verify backend is running
3. Check MongoDB connection
4. Ensure you're logged in (JWT token exists)

### TypeScript Errors

**Problem:** Type errors in development

**Solution:**
```bash
# Rebuild TypeScript
npm run build

# Or ignore type errors temporarily
# In tsconfig.json: "skipLibCheck": true
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### Code Style

- Use TypeScript for all new code
- Follow existing naming conventions
- Add comments for complex logic
- Run `npm run lint` before committing

---

## 📝 Additional Notes

### Recommended Versions
- **Node.js:** v20.x LTS
- **MongoDB:** v7.x or v8.x
- **npm:** v10.x

### Database Management
- Use **MongoDB Compass** for visual database management
- Run `view-all-chats.js` to see chat data in console
- Export important data regularly

### Security Best Practices
- Change `JWT_SECRET` in production
- Use strong passwords (12+ characters)
- Enable CORS only for trusted origins
- Keep API keys in `.env` files (never commit them)
- Use HTTPS in production

### Performance Tips
- Enable MongoDB indexing for faster queries
- Use pagination for large chat lists
- Compress images and assets
- Enable Next.js caching in production

### Future Enhancements
- [ ] Voice input/output
- [ ] Image generation support
- [ ] Dark/Light theme toggle
- [ ] Chat folders/organization
- [ ] Search within chats
- [ ] Markdown rendering in messages
- [ ] Code syntax highlighting
- [ ] Multi-language support
- [ ] User settings page
- [ ] Admin dashboard

---



## 🙏 Acknowledgments

- **Next.js** team for the amazing framework
- **NestJS** team for the robust backend framework
- **shadcn** for beautiful UI components
- **Framer Motion** for smooth animations
- **MongoDB** for reliable data storage

---

<div align="center">


