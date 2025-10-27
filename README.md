# 🤖 Multi-AI Chat Platform

> A modern full-stack platform for interacting with multiple AI models through a unified, beautiful interface.

**Tech Stack:** Next.js 14 · NestJS · MongoDB · TypeScript · Tailwind CSS · Framer Motion

---

## 🎯 Overview

A production-ready chatbot application that provides a unified interface to chat with multiple AI models including **GPT-4o Mini**, **Claude 3.5 Sonnet**, and **Gemma 2 9B**. Built with Next.js 14, NestJS, and MongoDB, featuring secure authentication, persistent chat history, and advanced conversation management tools.

### **Why This Platform?**

- 🎨 **Beautiful UI** - Glassmorphism design with smooth Framer Motion animations
- 🔐 **Secure & Private** - JWT authentication with encrypted data storage
- 🤖 **Multi-Model Support** - Test and compare different AI models side-by-side
- 💾 **Persistent History** - All conversations saved and accessible anytime
- 📝 **Advanced Tools** - Edit messages, regenerate responses, export conversations
- 📱 **Fully Responsive** - Optimized for desktop, tablet, and mobile devices

---

## ✨ Main Features

### 🔐 **Authentication & Security**

- JWT-based authentication with 7-day token expiration
- Secure password hashing using bcrypt
- Protected routes and API endpoints
- Persistent login sessions across page refreshes
- API keys stored safely in environment variables

### 💬 **Chat Interface**

- Real-time AI conversations with multiple models
- Support for GPT-4o Mini, Claude 3.5 Sonnet, and Gemma 2 9B
- Typing indicators and smooth animations
- Message history with avatars and timestamps
- Keyboard shortcuts (Ctrl+Enter, Escape)

### 📊 **Model Comparison**

- Compare responses from multiple AI models side-by-side
- View response times for each model
- Select 2 or more models for comparison
- Re-run comparisons with the same prompt

### 🛠️ **Message Tools**

- **Copy** - Copy AI responses to clipboard
- **Edit** - Edit your messages inline and regenerate responses
- **Export** - Download conversations in PDF, Markdown, JSON, or Text formats
- Smart toolbar with glassmorphism design

### 💾 **Chat History**

- Automatic saving of all conversations to MongoDB
- Create unlimited chat sessions
- Switch between conversations instantly
- Delete unwanted chats
- Persistent across sessions
- Sidebar with all your chat sessions

### 🎨 **User Experience**

- Glassmorphism UI with dark theme
- Animated background effects with particles
- Responsive design (desktop, tablet, mobile)
- Toast notifications for user feedback
- Loading states and error handling


---


## 📁 Project Structure

```

ChatBot/- API keys (OpenAI, Anthropic, Google)- Automatic saving of all conversations to MongoDB

├── backend/              # NestJS API

│   ├── src/- Sidebar with all your chat sessions

│   │   ├── auth/        # Authentication

│   │   ├── chat/        # Chat & exports---

│   │   └── users/       # User management

│   └── .env

│

├── frontend/            # Next.js 14 App## � Usage

│   ├── app/            # Pages

│   ├── components/     # UI components1. **Sign Up / Login** - Create an account or sign in

│   ├── lib/           # API clients2. **Select AI Model** - Choose from GPT-4, Claude, or Gemma

│   ├── store/         # State management3. **Start Chatting** - Type your message and get AI responses

│   └── .env.local4. **Try Comparison Mode** - Enable it to compare multiple models

│5. **Edit Messages** - Hover over your messages and click edit

└── README.md6. **Export Conversations** - Download chats in PDF, Markdown, JSON, or Text

```7. **Manage History** - Access all your conversations from the sidebar



------



## 🤝 Contributing## 📁 Project Structure



Contributions welcome! Fork the repo and submit a pull request.```

ChatBot/

---├── backend/                 # NestJS backend application

│   ├── src/

## 📄 License│   │   ├── auth/           # Authentication module

│   │   ├── chat/           # Chat & export services

MIT License│   │   └── users/          # User management

│   └── package.json

---│

├── frontend/               # Next.js frontend application

## 👨‍💻 Author│   ├── app/               # App router pages

│   ├── components/        # React components

**Fedi Hmida** - [@Fedi-Hmida](https://github.com/Fedi-Hmida)│   ├── lib/              # API clients & utilities

│   ├── store/            # Zustand state management

---│   └── types/            # TypeScript type definitions

│

```

---

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests
- Improve documentation

---


## 👨‍💻 Author

**Fedi Hmida**
- GitHub: [@Fedi-Hmida](https://github.com/Fedi-Hmida)

---

## 🙏 Acknowledgments

- OpenAI for GPT models
- Anthropic for Claude
- Google for Gemini
- The amazing open-source community

---


