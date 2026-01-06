# VibeShared 🌐✨

VibeShared is a modern, open-source social media platform focused on sharing **vibes**, not noise.  
It is built with the latest React and Next.js ecosystem, real-time features, secure authentication, and a scalable backend architecture.

This repository is community-driven and open for contributions.

---

## 🚀 Features

- Modern social feed experience
- Secure authentication & authorization
- Real-time updates (likes, messages, notifications)
- Media uploads with cloud storage
- Form handling with strong validation
- Smooth animations and responsive UI
- Scalable backend-ready architecture

---

## 🧱 Tech Stack

### Frontend
- **Next.js 16** (App Router)
- **React 19**
- **TypeScript**
- **Bootstrap 5** + React Bootstrap
- **Framer Motion** (animations)
- **Lucide React** & Bootstrap Icons

### Backend / Server
- **Next.js Route Handlers**
- **MongoDB** + **Mongoose**
- **JWT-based authentication**
- **Bcrypt / BcryptJS** for password hashing
- **Zod** for schema validation

### Realtime & Media
- **Pusher** (real-time events)
- **Cloudinary** (image & media uploads)

### Forms & UX
- **React Hook Form**
- **@hookform/resolvers**
- **React Hot Toast** (notifications)
- **date-fns** (date utilities)

### Email & Analytics
- **Nodemailer** (emails)
- **Vercel Analytics**

---

## 🏗️ Architecture Overview

Client (Next.js App Router + React 19)
↓
Server Actions / Route Handlers
↓
Auth (JWT + Password Hashing)
↓
MongoDB (Mongoose ODM)
↓
Realtime Events (Pusher)




The architecture is designed to be:
- Secure
- Maintainable
- Contributor-friendly
- Production-ready

---

## 🛠️ Local Development Setup

### 1️⃣ Clone the repository
```bash
git clone https://github.com/VibeShared/vibeshared.git
cd vibeshared
