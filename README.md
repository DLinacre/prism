# Prism

<p align="center">
  <img src="https://raw.githubusercontent.com/DLinacre/prism/main/.github/banner.svg" alt="Prism - Project Intelligence Platform" />
</p>

<p align="center">
  <a href="https://Linacre.site">
    <img src="https://img.shields.io/badge/Made%20by-DLinacre-6366f1?style=for-the-badge" alt="Made by DLinacre" />
  </a>
  <a href="https://github.com/DLinacre/prism/stargazers">
    <img src="https://img.shields.io/github/stars/DLinacre/prism?style=for-the-badge&color=6366f1" alt="Stars" />
  </a>
  <a href="https://github.com/DLinacre/prism/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/DLinacre/prism?style=for-the-badge&color=22c55e" alt="License" />
  </a>
  <a href="https://github.com/DLinacre/prism/actions">
    <img src="https://img.shields.io/github/actions/workflow/status/DLinacre/prism/ci.yml?style=for-the-badge" alt="Build" />
  </a>
</p>

---

## ✨ What is Prism?

**Prism** is a premium project intelligence and team collaboration platform built for modern engineering teams. It combines real-time collaboration, intelligent project tracking, and beautiful data visualization into an experience that makes managing complex projects feel effortless.

Think of it as the command center your team deserves — where every pixel, every interaction, and every data point has been thoughtfully crafted to help you ship faster.

---

## 🎯 Features at a Glance

| Category | What's Included |
|----------|-----------------|
| **Auth** | JWT + HTTP-only cookies, bcrypt hashing |
| **Dashboard** | Real-time metrics, activity feed, sparklines |
| **Projects** | Multi-project management with color coding |
| **Kanban** | Drag-and-drop boards with 4 columns |
| **Team** | Member profiles, contributions, invitations |
| **Analytics** | Velocity charts, burndown, distributions |
| **Settings** | Profile, notifications, theme, security |

---

## 🚀 Quick Start

```bash
git clone https://github.com/DLinacre/prism.git
cd prism
npm install
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173)

**Demo:** `demo@prism.io` / `demo123`

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, Vite, React Router |
| **Backend** | Express.js, SQLite |
| **State** | Zustand |
| **Charts** | Recharts |
| **Icons** | Lucide React |
| **Styling** | CSS Modules + CSS Variables |

---

## 📁 Project Structure

```
prism/
├── client/
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── pages/         # Route pages
│   │   ├── stores/        # Zustand stores
│   │   └── styles/        # Global CSS
│   └── vite.config.js
├── server/
│   ├── routes/            # API endpoints
│   ├── middleware/         # Auth
│   └── db/                # SQLite
└── package.json
```

---

## 🎨 Design System

**Colors:**
- Primary: `#6366f1` (Indigo)
- Background: `#0a0a0f` (Dark)
- Success: `#22c55e` | Warning: `#f59e0b` | Danger: `#ef4444`

**Typography:** Inter (UI), JetBrains Mono (code)

**Components:** Button, Input, Card, Modal, Avatar, Badge, Dropdown, Select, Toast

---

## 🔧 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start frontend + backend |
| `npm run build` | Production build |
| `npm run server` | Backend only (port 3001) |

---

## 🚢 Deployment

```bash
npm run build        # Builds to client/dist/
```

**Environment Variables:**
```env
PORT=3001
JWT_SECRET=your-secret
NODE_ENV=production
```

---

## 📄 License

MIT © [DLinacre](https://Linacre.site)

---

<p align="center">
  <a href="https://Linacre.site">Linacre.site</a> · 
  <a href="https://github.com/DLinacre">GitHub</a> · 
  <a href="https://github.com/DLinacre/prism">Prism Repo</a>
</p>
