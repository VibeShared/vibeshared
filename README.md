# VibeShared 🌐✨

VibeShared is an open social media platform focused on sharing *vibes*, not noise.  
Built with modern web technologies, strong authentication design, and a security-first mindset.

This repository is open-source and community-driven.

---

## 🚀 Features

- Secure authentication (session-based)
- Email & password login
- Social vibe sharing
- Scalable backend architecture
- Clean separation of auth domain & app logic
- Built for long-term maintainability

---

## 🧱 Tech Stack

- **Frontend**: Next.js (App Router)
- **Backend**: Next.js Route Handlers
- **Auth Engine**: Better Auth
- **Database**: MongoDB
- **Validation**: Zod
- **Security**: JWT, hashed passwords, secure cookies

---

## 🏗️ Architecture Overview

Client (Next.js App Router)  
→ Server Actions / Route Handlers  
→ Auth Engine (Better Auth)  
→ Database (MongoDB)  
→ Sessions + Tokens + Cookies  

---

## 🛠️ Local Setup

```bash
git clone https://github.com/your-username/vibeshared.git
cd vibeshared
npm install
