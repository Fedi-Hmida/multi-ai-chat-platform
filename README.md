# 🤖 Multi-AI Chat Platform# 🤖 Multi-AI Chat Platform# 🤖 Multi-AI Chat Platform



> A modern full-stack platform for interacting with multiple AI models through a unified, beautiful interface.

---------



## 🎯 Overview



A production-ready chatbot application that provides a unified interface to chat with multiple AI models including **GPT-4o Mini**, **Claude 3.5 Sonnet**, and **Gemma 2 9B**. Built with Next.js 14, NestJS, and MongoDB.## 🎯 Overview## 🎯 Overview



**Tech Stack:** Next.js 14 · NestJS · MongoDB · TypeScript · Tailwind CSS · Framer Motion



---A production-ready chatbot application that provides a unified interface to chat with multiple AI models including **GPT-4**, **Claude 3.5 Sonnet**, and **Gemma 2**. Built with Next.js 14, NestJS, and MongoDB.A production-ready chatbot platform that provides a unified interface to interact with multiple AI models including GPT-4, Claude 3.5 Sonnet, and Gemma 2. Built with Next.js 14, NestJS, and MongoDB, featuring secure authentication, persistent chat history, and advanced conversation management tools.



## ✨ Main Features



### 🔐 Authentication**Tech Stack:** Next.js 14 · NestJS · MongoDB · TypeScript · Tailwind CSS · Framer Motion### **Why This Platform?**

- JWT-based secure authentication

- Persistent login sessions- 🎨 **Beautiful UI** - Glassmorphism design with smooth Framer Motion animations

- Password encryption with bcrypt

---- 🔐 **Secure & Private** - JWT authentication with encrypted data storage

### 💬 Chat Interface

- Real-time AI conversations- 🤖 **Multi-Model Support** - Test and compare different AI models side-by-side

- Multiple AI model support (GPT-4o Mini, Claude 3.5, Gemma 2)

- Typing indicators and smooth animations## ✨ Main Features- 💾 **Persistent History** - All conversations saved and accessible anytime

- Message history with avatars and timestamps

- 📝 **Advanced Tools** - Edit messages, regenerate responses, export conversations

### 📊 Model Comparison

- Compare responses from multiple AI models side-by-side### 🔐 Authentication- 📱 **Fully Responsive** - Optimized for desktop, tablet, and mobile devices

- View response times for each model

- Re-run comparisons with same prompt- JWT-based secure authentication



### 🛠️ Message Tools- Persistent login sessions---

- **Copy** - Copy AI responses to clipboard

- **Edit** - Edit your messages inline and regenerate responses- Password encryption with bcrypt

- **Export** - Download conversations in PDF, Markdown, JSON, or Text formats

## ✨ Main Features

### 💾 Chat History

- Auto-save all conversations to MongoDB### 💬 Chat Interface

- Create unlimited chat sessions

- Switch between conversations instantly- Real-time AI conversations### 🔐 **Authentication & Security**

- Delete unwanted chats

- Persistent across sessions- Multiple AI model support (GPT-4, Claude, Gemma)- JWT-based authentication with 7-day token expiration



### 🎨 User Experience- Typing indicators and smooth animations- Secure password hashing using bcrypt

- Glassmorphism UI with dark theme

- Animated background effects- Message history with avatars and timestamps- Protected routes and API endpoints

- Responsive design (desktop, tablet, mobile)

- Toast notifications- Persistent login sessions across page refreshes

- Keyboard shortcuts (Ctrl+Enter, Escape)


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


