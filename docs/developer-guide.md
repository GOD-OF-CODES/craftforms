# Developer Guide

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/       # Dashboard pages
│   ├── api/               # API routes
│   ├── preview/           # Form preview
│   └── to/                # Public form pages
├── components/
│   ├── form-builder/      # Form builder components
│   ├── form-renderer/     # Form taking components
│   ├── responses/         # Response management
│   ├── ui/                # Reusable UI components
│   └── workspace/         # Workspace components
├── hooks/                 # Custom React hooks
├── lib/                   # Utility libraries
│   ├── webhooks/          # Webhook utilities
│   └── ...
├── store/                 # Zustand stores
└── types/                 # TypeScript types
```

## Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS
- **Animation**: Framer Motion
- **State Management**: Zustand

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Installation

```bash
# Clone repository
git clone <repository-url>
cd typeform-clone

# Install dependencies
npm install

# Set up environment
cp .env.example .env.local

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev
```

### Environment Variables

```env
# Database
DATABASE_URL=postgresql://...

# NextAuth
NEXTAUTH_SECRET=your-secret
NEXTAUTH_URL=http://localhost:3000

# OAuth (optional)
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...

# Email (optional)
RESEND_API_KEY=...
```

## Database Schema

### Core Tables
- `users`: User accounts
- `workspaces`: Multi-tenant workspaces
- `forms`: Form definitions
- `form_fields`: Question definitions
- `form_screens`: Welcome/thank you screens
- `responses`: Form submissions
- `response_answers`: Individual answers
- `themes`: Custom themes
- `webhooks`: Webhook configurations
- `webhook_logs`: Delivery logs

### Migrations

```bash
# Create migration
npx prisma migrate dev --name migration_name

# Apply migrations
npx prisma migrate deploy

# Reset database
npx prisma migrate reset
```

## Key Components

### Form Builder

The form builder uses a three-panel layout:

```tsx
// Field Palette - Left panel
<FieldPalette onAddField={handleAddField} />

// Form Preview - Center panel
<FormPreview
  fields={fields}
  selectedField={selectedField}
  onSelectField={setSelectedField}
/>

// Settings Panel - Right panel
<SettingsPanel
  field={selectedField}
  onUpdateField={handleUpdateField}
/>
```

### Form Renderer

One-question-at-a-time experience:

```tsx
<FormRenderer
  fields={form.fields}
  onSubmit={handleSubmit}
  welcomeScreen={welcomeScreen}
  thankYouScreen={thankYouScreen}
  showProgressBar
/>
```

### Logic Engine

Conditional branching:

```typescript
import { getNextFieldId, evaluateLogicRule } from '@/lib/logicEngine'

// Get next field based on logic
const nextFieldId = getNextFieldId(fields, currentFieldId, answers)
```

## API Development

### Creating an API Route

```typescript
// src/app/api/forms/[formId]/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: Request,
  { params }: { params: { formId: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const form = await prisma.form.findUnique({
    where: { id: params.formId }
  })

  return NextResponse.json(form)
}
```

### Rate Limiting

```typescript
import { withRateLimit, rateLimitConfigs } from '@/lib/rateLimit'

export const POST = withRateLimit(
  rateLimitConfigs.formSubmit,
  async (req) => {
    // Handler implementation
  }
)
```

## Testing

### Unit Tests

```bash
# Run unit tests
npm test

# Run with coverage
npm test -- --coverage
```

### E2E Tests

```bash
# Install Playwright
npx playwright install

# Run E2E tests
npm run test:e2e

# Run with UI
npm run test:e2e -- --ui
```

## Webhooks

### Sending Webhooks

```typescript
import { fireWebhooks, buildResponseSubmittedPayload } from '@/lib/webhooks/deliveryService'

// Build payload
const payload = buildResponseSubmittedPayload(form, response)

// Fire webhooks (async, non-blocking)
fireWebhooks(form.id, 'response.submitted', payload)
```

### Webhook Signature

```typescript
import { generateSignature, verifySignature } from '@/lib/webhooks/signatureGenerator'

// Generate
const signature = generateSignature(payload, secret)

// Verify
const isValid = verifySignature(payload, signature, secret)
```

## Theming

### Theme Structure

```typescript
interface Theme {
  colors: {
    primary: string
    background: string
    text: string
    // ...
  }
  fonts: {
    questionFamily: string
    questionSize: string
    // ...
  }
  layout: {
    alignment: 'left' | 'center' | 'right'
    containerWidth: 'narrow' | 'medium' | 'wide'
    // ...
  }
}
```

### Applying Themes

```typescript
import { applyThemeToDocument, getThemeStyles } from '@/lib/themeApplier'

// Apply to document (client-side)
applyThemeToDocument(theme)

// Get style objects for components
const styles = getThemeStyles(theme)
```

## Security

### Input Validation

All user input is validated on both client and server:

```typescript
import { validateField } from '@/lib/validations'

const result = validateField(value, fieldType, {
  required: true,
  minLength: 5,
  maxLength: 100
})
```

### Security Headers

```typescript
import { applySecurityHeaders } from '@/lib/securityHeaders'

// Apply to response
return applySecurityHeaders(response)
```

## Deployment

### Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production deploy
vercel --prod
```

### Environment Setup

1. Set up PostgreSQL database
2. Configure environment variables
3. Run database migrations
4. Deploy application

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes
4. Run tests
5. Submit pull request

## License

MIT License
