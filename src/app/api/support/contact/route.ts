import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sendEmail } from '@/lib/email'

const SUPPORT_EMAIL = 'rajcricketsingh@gmail.com'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { subject, message, category } = await req.json()

    if (!subject || typeof subject !== 'string' || subject.trim().length === 0) {
      return NextResponse.json({ error: 'Subject is required' }, { status: 400 })
    }

    if (subject.trim().length > 200) {
      return NextResponse.json({ error: 'Subject must be 200 characters or less' }, { status: 400 })
    }

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    if (message.trim().length > 5000) {
      return NextResponse.json({ error: 'Message must be 5000 characters or less' }, { status: 400 })
    }

    const validCategories = ['general', 'bug', 'feature', 'billing', 'account']
    const cat = validCategories.includes(category) ? category : 'general'

    // Escape HTML in user input
    const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

    const html = `
      <h2>New Support Request</h2>
      <p><strong>From:</strong> ${esc(session.user.name || 'Unknown')} (${esc(session.user.email || '')})</p>
      <p><strong>Category:</strong> ${esc(cat)}</p>
      <p><strong>Subject:</strong> ${esc(subject.trim())}</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
      <p>${esc(message.trim()).replace(/\n/g, '<br />')}</p>
    `

    const result = await sendEmail({
      to: SUPPORT_EMAIL,
      subject: `[CraftForms Support] [${cat}] ${subject.trim()}`,
      html,
      text: `From: ${session.user.name || 'Unknown'} (${session.user.email})\nCategory: ${cat}\nSubject: ${subject.trim()}\n\n${message.trim()}`,
      replyTo: session.user.email || undefined,
    })

    if (!result.success) {
      console.error('Failed to send support email:', result.error)
      return NextResponse.json(
        { error: 'Failed to send message. Please try again or email us directly at ' + SUPPORT_EMAIL },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Support contact error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
