/**
 * React Query client configuration for caching and performance
 *
 * To use React Query, install: npm install @tanstack/react-query
 */

// Query client configuration (requires @tanstack/react-query)
export const queryClientConfig = {
  defaultOptions: {
    queries: {
      // Cache data for 5 minutes
      staleTime: 5 * 60 * 1000,
      // Keep unused data in cache for 10 minutes
      gcTime: 10 * 60 * 1000,
      // Retry failed requests up to 3 times
      retry: 3,
      // Exponential backoff for retries
      retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Refetch on window focus for fresh data
      refetchOnWindowFocus: true,
      // Don't refetch on reconnect by default
      refetchOnReconnect: false,
    },
    mutations: {
      // Retry mutations once
      retry: 1,
    },
  },
}

// Singleton query client for client-side
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let browserQueryClient: any

// Factory function to create query client when @tanstack/react-query is installed
export function createQueryClient() {
  try {
    // Dynamic import to avoid build errors if not installed
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { QueryClient } = require('@tanstack/react-query')
    return new QueryClient(queryClientConfig)
  } catch {
    console.warn('React Query not installed. Install with: npm install @tanstack/react-query')
    return null
  }
}

export function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: always make a new query client
    return createQueryClient()
  }
  // Browser: use singleton pattern
  if (!browserQueryClient) {
    browserQueryClient = createQueryClient()
  }
  return browserQueryClient
}

// Query key factories for consistent cache keys
export const queryKeys = {
  // Workspaces
  workspaces: ['workspaces'] as const,
  workspace: (id: string) => ['workspaces', id] as const,
  workspaceBySlug: (slug: string) => ['workspaces', 'slug', slug] as const,

  // Forms
  forms: (workspaceId: string) => ['forms', workspaceId] as const,
  form: (formId: string) => ['forms', 'detail', formId] as const,
  formFields: (formId: string) => ['forms', formId, 'fields'] as const,
  formScreens: (formId: string) => ['forms', formId, 'screens'] as const,

  // Responses
  responses: (formId: string) => ['responses', formId] as const,
  response: (responseId: string) => ['responses', 'detail', responseId] as const,
  analytics: (formId: string) => ['analytics', formId] as const,

  // Themes
  themes: (workspaceId: string) => ['themes', workspaceId] as const,
  theme: (themeId: string) => ['themes', 'detail', themeId] as const,

  // Webhooks
  webhooks: (formId: string) => ['webhooks', formId] as const,
  webhook: (webhookId: string) => ['webhooks', 'detail', webhookId] as const,
  webhookLogs: (webhookId: string) => ['webhooks', webhookId, 'logs'] as const,

  // Members
  members: (workspaceId: string) => ['members', workspaceId] as const,
}

// Prefetch helpers (requires QueryClient instance)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function prefetchForm(queryClient: any, formId: string) {
  if (!queryClient) return
  await queryClient.prefetchQuery({
    queryKey: queryKeys.form(formId),
    queryFn: () => fetch(`/api/forms/${formId}`).then((res) => res.json()),
  })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function prefetchWorkspace(queryClient: any, slug: string) {
  if (!queryClient) return
  await queryClient.prefetchQuery({
    queryKey: queryKeys.workspaceBySlug(slug),
    queryFn: () => fetch(`/api/workspaces?slug=${slug}`).then((res) => res.json()),
  })
}
