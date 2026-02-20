import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Session } from 'next-auth'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RouteContext = { params: any }

type AuthenticatedHandler = (
  req: Request,
  context: RouteContext,
  session: Session & { user: { id: string } }
) => Promise<NextResponse>

export function withAuth(handler: AuthenticatedHandler) {
  return async (req: Request, context: RouteContext) => {
    try {
      const session = await getServerSession(authOptions)

      if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      return await handler(req, context, session as Session & { user: { id: string } })
    } catch (error) {
      console.error(`API error [${req.method} ${new URL(req.url).pathname}]:`, error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }
}
