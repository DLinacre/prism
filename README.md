# Prism

<p align="center">
  <img src="https://raw.githubusercontent.com/prism-project/prism/main/.github/banner.svg" alt="Prism - Project Intelligence Platform" />
</p>

<p align="center">
  <a href="https://prism.io">
    <img src="https://img.shields.io/badge/Website-prism.io-6366f1?style=for-the-badge" alt="Website" />
  </a>
  <a href="https://github.com/prism-project/prism/stargazers">
    <img src="https://img.shields.io/github/stars/prism-project/prism?style=for-the-badge&color=6366f1" alt="Stars" />
  </a>
  <a href="https://github.com/prism-project/prism/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/prism-project/prism?style=for-the-badge&color=22c55e" alt="License" />
  </a>
  <a href="https://github.com/prism-project/prism/actions">
    <img src="https://img.shields.io/github/actions/workflow/status/prism-project/prism/deploy.yml?style=for-the-badge" alt="Build" />
  </a>
</p>

---

## ✨ What is Prism?

**Prism** is a premium project intelligence and team collaboration platform built for modern engineering teams. It combines the power of real-time collaboration, intelligent project tracking, and beautiful data visualization into an experience that makes managing complex projects feel effortless.

Think of it as the command center your team deserves — where every pixel, every interaction, and every data point has been thoughtfully crafted to help you ship faster.

### 🎯 Why Prism?

| Feature | What it means for you |
|---------|----------------------|
| **🎨 Design Excellence** | A dark, sophisticated interface that feels like Linear meets Vercel — dense yet breathable, powerful yet intuitive |
| **⚡ Real-time Collaboration** | See your team's activity as it happens. No refresh required |
| **📊 Intelligent Analytics** | Velocity tracking, burndown charts, and team performance metrics at your fingertips |
| **🎯 Kanban Boards** | Beautiful drag-and-drop task management with smooth animations |
| **👥 Team Intelligence** | Know who's working on what, track contributions, celebrate wins |
| **🔒 Production-Ready Auth** | JWT-based authentication with HTTP-only cookies |
| **💾 Zero-Config Database** | SQLite out of the box — no setup required |

---

## 🚀 Features

### Core Features
- ✅ **Authentication System** — Secure login/register with password strength indicators
- ✅ **Dashboard** — Real-time metrics, activity feed, and quick actions
- ✅ **Project Management** — Create, manage, and track multiple projects
- ✅ **Kanban Boards** — Drag-and-drop task management with status columns
- ✅ **Team Directory** — View team members, their contributions, and status
- ✅ **Analytics Dashboard** — Velocity charts, burndown graphs, task distribution
- ✅ **Notifications** — Real-time toast notifications for team activity
- ✅ **Settings** — Profile management, notifications, appearance, security

### Technical Highlights
- 🛠 **Modern Stack** — React 18 + Vite frontend, Express + SQLite backend
- 📦 **State Management** — Zustand for global state with persistence
- 🎨 **Styling** — CSS Modules with CSS custom properties
- 📈 **Charts** — Recharts for beautiful, customizable visualizations
- ✨ **Animations** — Framer Motion-inspired transitions and micro-interactions
- 🔐 **Security** — JWT authentication, HTTP-only cookies, bcrypt password hashing
- 📱 **Responsive** — Built for desktop-first, scales beautifully

---

## 🏗️ Architecture

```
prism/
├── client/                 # React + Vite frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components (Button, Card, Modal, etc.)
│   │   ├── pages/         # Route pages (Dashboard, Projects, Team, etc.)
│   │   ├── stores/        # Zustand state management
│   │   ├── utils/         # Helper functions
│   │   └── styles/        # Global CSS variables and base styles
│   └── index.html
├── server/                 # Express.js backend
│   ├── routes/            # API endpoints
│   ├── middleware/         # Auth middleware
│   └── db/                # SQLite database setup
└── package.json           # Workspace root with dev scripts
```

---

## 🛠️ Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### 1. Clone the Repository

```bash
git clone https://github.com/prism-project/prism.git
cd prism
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Development Servers

```bash
npm run dev
```

This starts both the backend (port 3001) and frontend (port 5173) concurrently.

### 4. Access the App

Open [http://localhost:5173](http://localhost:5173) in your browser.

**Demo Account:**
- Email: `demo@prism.io`
- Password: `demo123`

---

## 📁 Project Structure

### Frontend (`/client`)

| Directory | Purpose |
|-----------|---------|
| `components/ui/` | Reusable UI primitives (Button, Input, Modal, Avatar, etc.) |
| `components/layout/` | Layout components (Sidebar, Header, Layout shell) |
| `pages/` | Page components for each route |
| `stores/` | Zustand stores for auth and app state |
| `utils/` | Helper functions (formatters, classnames, etc.) |
| `styles/` | Global CSS with design tokens |

### Backend (`/server`)

| Directory | Purpose |
|-----------|---------|
| `routes/` | REST API route handlers |
| `middleware/` | JWT authentication middleware |
| `db/` | SQLite database setup and seeding |

### API Endpoints

```
Auth:
POST   /api/auth/register     — Create new account
POST   /api/auth/login        — Sign in
POST   /api/auth/logout       — Sign out
GET    /api/auth/me           — Get current user
PUT    /api/auth/profile      — Update profile

Projects:
GET    /api/projects          — List user's projects
POST   /api/projects          — Create project
GET    /api/projects/:id      — Get project details
PUT    /api/projects/:id      — Update project
DELETE /api/projects/:id      — Delete project
GET    /api/projects/:id/tasks — Get project tasks
POST   /api/projects/:id/tasks — Create task

Tasks:
PUT    /api/tasks/:id         — Update task
PATCH  /api/tasks/:id/move    — Move task (change status/position)
DELETE /api/tasks/:id         — Delete task

Team:
GET    /api/team              — List team members
GET    /api/team/:id          — Get member details
POST   /api/team/invite       — Invite member to project

Analytics:
GET    /api/analytics/overview — Dashboard metrics
GET    /api/analytics/velocity — Team velocity data
GET    /api/analytics/burndown/:id — Sprint burndown

Notifications:
GET    /api/notifications     — Get notifications
PUT    /api/notifications/:id/read — Mark as read
PUT    /api/notifications/read-all — Mark all as read
GET    /api/notifications/activity — Activity feed
```

---

## 🎨 Design System

### Color Palette

```css
/* Backgrounds */
--bg-primary: #0a0a0f     /* Deep space black */
--bg-secondary: #12121a     /* Elevated surfaces */
--bg-tertiary: #1a1a24     /* Cards, inputs */

/* Accent */
--accent-primary: #6366f1   /* Indigo */
--accent-hover: #818cf8     /* Indigo light */

/* Status */
--success: #22c55e          /* Green */
--warning: #f59e0b          /* Amber */
--danger: #ef4444           /* Red */
```

### Typography

- **Headlines:** Inter (600, 700) — Clean, geometric, professional
- **Body:** Inter (400, 500) — Highly legible at all sizes
- **Mono:** JetBrains Mono — For code, metrics, IDs

### Components

Prism includes 10+ polished UI components:
- `Button` — 4 variants, 3 sizes, loading state
- `Input` — With icons, password toggle, search
- `Card` — Interactive, elevated, ghost variants
- `Modal` — Multiple sizes, backdrop blur
- `Avatar` — Gradient initials, status indicators
- `Badge` — Multiple variants with dot option
- `Dropdown` — Portal-rendered, animated
- `Select` — Custom styled dropdown
- `Toast` — 4 types with progress bar
- `Tooltip` — Smart positioning

---

## 🔧 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start both frontend and backend in dev mode |
| `npm run server` | Start backend only (port 3001) |
| `npm run client` | Start frontend only (port 5173) |
| `npm run build` | Build frontend for production |

---

## 🚢 Deployment

### Build for Production

```bash
npm run build
```

The production build is output to `client/dist/`.

### Environment Variables

```env
PORT=3001                    # Server port
JWT_SECRET=your-secret-key   # JWT signing secret
NODE_ENV=production          # Set for production
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

Built with ❤️ using:
- [React](https://react.dev/) — UI library
- [Vite](https://vitejs.dev/) — Build tool
- [Express](https://expressjs.com/) — Backend framework
- [SQLite](https://www.sqlite.org/) — Database
- [Zustand](https://zustand-demo.pmnd.rs/) — State management
- [Recharts](https://recharts.org/) — Charts
- [Lucide](https://lucide.dev/) — Icons
- [Inter](https://rsms.me/inter/) — Typography

---

<p align="center">
  <strong>Built with passion by engineers, for engineers.</strong>
  <br />
  <a href="https://prism.io">prism.io</a>
</p>
