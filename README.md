# Typeform Clone

A full-featured form builder application inspired by Typeform, built with Next.js 14, TypeScript, and Prisma.

## Features

- **Form Builder**: Drag-and-drop form creation with 18+ field types
- **One Question at a Time**: Typeform-style immersive form experience
- **Logic Jumps**: Conditional branching based on user responses
- **Theme Customization**: Full visual customization with Google Fonts
- **Workspaces**: Multi-tenant architecture with role-based access
- **Analytics**: Response analytics with charts and insights
- **Webhooks**: Real-time integrations with external services
- **Export**: CSV and Excel export of responses

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS
- **Animation**: Framer Motion
- **State Management**: Zustand
- **Testing**: Jest, React Testing Library, Playwright

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd typeform-clone
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```

4. Configure your `.env.local`:
   ```env
   # Database
   DATABASE_URL=postgresql://user:password@localhost:5432/typeform

   # NextAuth
   NEXTAUTH_SECRET=your-secret-key-here
   NEXTAUTH_URL=http://localhost:3000

   # OAuth (optional)
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   GITHUB_CLIENT_ID=your-github-client-id
   GITHUB_CLIENT_SECRET=your-github-client-secret

   # Email (optional)
   RESEND_API_KEY=your-resend-api-key
   ```

5. Run database migrations:
   ```bash
   npx prisma migrate dev
   ```

6. Start the development server:
   ```bash
   npm run dev
   ```

7. Open [http://localhost:3000](http://localhost:3000)

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm test` | Run unit tests |
| `npm run test:e2e` | Run E2E tests |

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/       # Dashboard pages
│   ├── api/               # API routes
│   └── to/                # Public form pages
├── components/
│   ├── form-builder/      # Form builder components
│   ├── form-renderer/     # Form taking components
│   ├── responses/         # Response management
│   └── ui/                # Reusable UI components
├── hooks/                 # Custom React hooks
├── lib/                   # Utility libraries
├── store/                 # Zustand stores
└── types/                 # TypeScript types
```

## Documentation

- [User Guide](docs/user-guide.md) - End-user documentation
- [API Reference](docs/api-reference.md) - API endpoints documentation
- [Developer Guide](docs/developer-guide.md) - Development setup and contribution

## Question Types

| Type | Description |
|------|-------------|
| Short Text | Single-line text input |
| Long Text | Multi-line text area |
| Email | Email with validation |
| Number | Numeric input |
| Multiple Choice | Single selection |
| Checkboxes | Multiple selection |
| Dropdown | Searchable dropdown |
| Yes/No | Binary choice |
| Rating | Star rating |
| Opinion Scale | Linear scale (0-10) |
| Date | Date picker |
| Phone | Phone with country code |
| Website | URL with validation |
| File Upload | File attachments |
| Legal | Consent checkbox |
| Ranking | Drag-to-rank options |
| Matrix | Grid questions |

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see [LICENSE](LICENSE) for details.
