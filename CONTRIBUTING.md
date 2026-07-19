# Contributing to Prism

Thank you for your interest in contributing to Prism! We're excited to have you join our community of builders.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Git

### Setup Development Environment

```bash
# 1. Fork the repository
git clone https://github.com/YOUR_USERNAME/prism.git
cd prism

# 2. Add upstream remote
git remote add upstream https://github.com/prism-project/prism.git

# 3. Install dependencies
npm install

# 4. Create a feature branch
git checkout -b feature/your-feature-name

# 5. Start development servers
npm run dev
```

## 🎯 Types of Contributions

We welcome all contributions, big or small:

- 🐛 **Bug fixes** — Found a bug? Let us fix it!
- ✨ **Features** — New features are always welcome
- 📚 **Documentation** — Help us improve docs
- 🎨 **Design** — UI/UX improvements
- 🧪 **Tests** — More test coverage = more confidence
- 🔧 **Tooling** — Dev experience improvements

## 📝 Development Guidelines

### Code Style

- Use **2 spaces** for indentation
- Use **semantic naming** for variables and functions
- Keep functions **small and focused** (single responsibility)
- Add **JSDoc comments** for complex functions
- Run **ESLint** before committing

### Commit Messages

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add dark mode toggle
fix: resolve task drag-drop issue
docs: update API documentation
style: format code with prettier
refactor: simplify auth middleware
test: add tests for dashboard component
chore: update dependencies
```

### Pull Request Process

1. **Fork & Clone** — Fork the repo and clone locally
2. **Create Branch** — Use descriptive branch names:
   - `feature/add-kanban-columns`
   - `fix/notification-bell`
   - `docs/api-endpoints`
3. **Make Changes** — Follow the code style guidelines
4. **Test** — Ensure all tests pass
5. **Commit** — Use conventional commit messages
6. **Push** — Push to your fork
7. **PR** — Open a pull request against `main`

### Pull Request Template

```markdown
## Description
Brief description of the changes

## Type of Change
- [ ] Bug fix (non-breaking change)
- [ ] New feature (non-breaking change)
- [ ] Breaking change
- [ ] Documentation update

## Screenshots (if applicable)
Add screenshots or GIFs of the change

## Checklist
- [ ] My code follows the style guidelines
- [ ] I have performed a self-review
- [ ] I have commented my code where needed
- [ ] I have updated the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix/feature works
- [ ] New and existing tests pass locally
```

## 🧪 Testing

### Run Tests

```bash
# All tests
npm test

# Server tests
npm run test:server

# Client tests
npm run test:client

# E2E tests
npm run test:e2e
```

### Writing Tests

- Write tests for all new features
- Ensure tests are deterministic
- Use meaningful test descriptions
- Mock external dependencies

## 🐛 Reporting Bugs

Before submitting a bug report:

1. **Search** — Check if someone else reported it
2. **Reproduce** — Can you reproduce the bug?
3. **Version** — What version are you on?

Bug report template:

```markdown
**Description**
Clear description of the bug

**Steps to Reproduce**
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

**Expected Behavior**
What you expected to happen

**Actual Behavior**
What actually happened

**Environment**
- OS: [e.g. macOS]
- Browser: [e.g. Chrome]
- Version: [e.g. 1.0.0]
```

## 💬 Community

- **GitHub Discussions** — Questions, ideas, show & tell
- **Discord** — Real-time chat with the team
- **Twitter** — Updates and announcements

## 📜 Code of Conduct

By participating, you agree to uphold our Code of Conduct:

- Be respectful and inclusive
- Accept constructive criticism gracefully
- Focus on what's best for the community
- Show empathy towards other community members

## 🏆 Recognition

Contributors will be recognized in our:
- README.md contributors section
- Release notes
- Discord's #contributors channel

---

**Remember:** Every contribution matters, no matter how small. Thank you for making Prism better! 💜
