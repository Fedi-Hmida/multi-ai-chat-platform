# 🔒 Security Guidelines

## Environment Variables & Secrets Management

### ⚠️ Critical Security Rules

1. **NEVER commit `.env` files** to Git
2. **NEVER commit real API keys, passwords, or secrets** to the repository
3. **Always use `.env.example`** with placeholder values only
4. **Rotate credentials immediately** if accidentally exposed

---

## 🛡️ Setup Instructions

### Backend Setup

1. Navigate to the backend folder:
   ```bash
   cd backend
   ```

2. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

3. Edit `.env` and replace all placeholder values:
   ```env
   PORT=3001
   FRONTEND_URL=http://localhost:3000
   
   # OpenRouter API Keys
   OPENAI_API_KEY=sk-or-v1-YOUR_ACTUAL_KEY_HERE
   ANTHROPIC_API_KEY=sk-or-v1-YOUR_ACTUAL_KEY_HERE
   
   # MongoDB Connection
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/chatbot
   
   # JWT Secret (generate with: openssl rand -base64 32)
   JWT_SECRET=YOUR_SECURE_RANDOM_STRING_HERE
   JWT_EXPIRES_IN=7d
   ```

### Frontend Setup

1. Navigate to the frontend folder:
   ```bash
   cd frontend
   ```

2. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

3. Edit `.env.local` and replace placeholder values:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001
   
   # Optional: Direct API keys (if not using backend proxy)
   NEXT_PUBLIC_OPENAI_API_KEY=your_key_here
   NEXT_PUBLIC_CLAUDE_API_KEY=your_key_here
   NEXT_PUBLIC_GEMINI_API_KEY=your_key_here
   ```

---

## 🔑 Obtaining API Keys

### OpenRouter (Recommended for AI Models)
- Visit: https://openrouter.ai/keys
- Sign up and create an API key
- Use format: `sk-or-v1-...`

### MongoDB Atlas
- Visit: https://www.mongodb.com/cloud/atlas
- Create a cluster
- Go to: Database Access → Add Database User
- Go to: Network Access → Add IP Address (allow 0.0.0.0/0 for development)
- Get connection string from: Clusters → Connect → Connect your application

### JWT Secret Generation
Generate a secure random string:
```bash
# Using OpenSSL (recommended)
openssl rand -base64 32

# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Using Python
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

---

## 🚨 If Secrets Are Exposed

### Immediate Actions

1. **Rotate all exposed credentials immediately**:
   - MongoDB: Change database user password
   - API Keys: Regenerate in provider dashboard
   - JWT Secret: Generate new secret

2. **Remove from Git history** (if committed):
   ```bash
   # Install BFG Repo-Cleaner
   brew install bfg  # macOS
   # or download from: https://rtyley.github.io/bfg-repo-cleaner/
   
   # Remove the exposed file from history
   bfg --delete-files .env
   
   # Clean up
   git reflog expire --expire=now --all
   git gc --prune=now --aggressive
   
   # Force push (WARNING: This rewrites history)
   git push --force
   ```

3. **Contact GitHub Support** if needed:
   - Go to: https://github.com/Fedi-Hmida/multi-ai-chat-platform/security
   - Review security alerts
   - Mark as resolved after rotating credentials

---

## ✅ Security Checklist

Before every commit:

- [ ] No `.env` files in staging area
- [ ] Only `.env.example` files with placeholders are committed
- [ ] No hardcoded API keys in source code
- [ ] No connection strings with real credentials
- [ ] `.gitignore` includes `.env` and `.env.local`

---

## 📋 .gitignore Requirements

Ensure your `.gitignore` includes:

```gitignore
# Environment variables
.env
.env.local
.env*.local
.env.development.local
.env.test.local
.env.production.local

# Sensitive files
*.pem
*.key
secrets.json
```

---

## 🔐 Production Deployment

### Using GitHub Secrets (for CI/CD)

1. Go to repository Settings → Secrets and variables → Actions
2. Add secrets:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `OPENAI_API_KEY`
   - `ANTHROPIC_API_KEY`

3. Access in workflows:
   ```yaml
   env:
     MONGODB_URI: ${{ secrets.MONGODB_URI }}
     JWT_SECRET: ${{ secrets.JWT_SECRET }}
   ```

### Using Environment Variables (Vercel/Netlify)

1. Go to project dashboard
2. Navigate to Environment Variables
3. Add all required variables
4. Redeploy application

---

## 📞 Security Contacts

If you discover a security vulnerability:

1. **DO NOT** open a public issue
2. Email: [your-email@domain.com]
3. Use GitHub Security Advisory: https://github.com/Fedi-Hmida/multi-ai-chat-platform/security/advisories/new

---

## 📚 Additional Resources

- [GitHub Secret Scanning](https://docs.github.com/en/code-security/secret-scanning)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [MongoDB Security Checklist](https://docs.mongodb.com/manual/administration/security-checklist/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
