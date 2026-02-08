# Contributing to Typeform Clone

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## Development Setup

1. Fork and clone the repository
2. Install dependencies: `npm install`
3. Set up your environment variables (see README.md)
4. Run database migrations: `npx prisma migrate dev`
5. Start the development server: `npm run dev`

## Code Standards

### TypeScript

- Use strict TypeScript configuration
- Avoid `any` types; use proper type definitions
- Export types from dedicated type files

### React

- Use functional components with hooks
- Keep components small and focused
- Use meaningful component names

### Styling

- Use Tailwind CSS utility classes
- Follow the design system (colors, fonts, spacing)
- Ensure responsive design

### Testing

- Write unit tests for utility functions
- Write integration tests for API routes
- Write E2E tests for critical user flows

## Pull Request Process

1. Create a feature branch from `main`
2. Make your changes
3. Ensure all tests pass: `npm test`
4. Ensure linting passes: `npm run lint`
5. Update documentation if needed
6. Submit a pull request

## Commit Messages

Follow conventional commits format:

- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Test additions/changes
- `chore:` Maintenance tasks

Example:
```
feat: add file upload field type
```

## Code Review

- All PRs require at least one review
- Address all review comments
- Keep PRs focused and small

## Reporting Issues

When reporting issues, please include:

1. Clear description of the problem
2. Steps to reproduce
3. Expected vs actual behavior
4. Browser/environment information

## Questions?

Open an issue for any questions about contributing.
