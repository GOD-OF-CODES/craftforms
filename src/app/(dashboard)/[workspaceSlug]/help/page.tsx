'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import Input from '@/components/ui/input'
import Button from '@/components/ui/button'
import Label from '@/components/ui/label'
import { useToast } from '@/components/ui/toast'

const SUPPORT_EMAIL = 'rajcricketsingh@gmail.com'

const faqs = [
  {
    question: 'How do I create a new form?',
    answer: 'Navigate to your workspace dashboard and click the "Create Form" button. You can start from scratch or use one of our templates.',
  },
  {
    question: 'How do I share my form?',
    answer: 'Open your form, go to the share settings, and copy the public link. You can also embed the form on your website using the embed code.',
  },
  {
    question: 'Can I export my form responses?',
    answer: 'Yes! Go to the Responses tab of your form and click the export button to download responses as a CSV file.',
  },
  {
    question: 'How do I add team members to my workspace?',
    answer: 'Go to Workspace Settings > Members tab. Click "Invite Member" and enter their email address. You can assign them a role (admin, editor, or viewer).',
  },
  {
    question: 'How do I customize my form theme?',
    answer: 'Go to the Themes section in your workspace. You can create custom themes with your brand colors, fonts, and background images.',
  },
  {
    question: 'Is my data secure?',
    answer: 'Yes. We use industry-standard encryption, secure authentication, and follow best practices for data protection. Your form responses are stored securely.',
  },
]

const categories = [
  { value: 'general', label: 'General Inquiry' },
  { value: 'bug', label: 'Bug Report' },
  { value: 'feature', label: 'Feature Request' },
  { value: 'billing', label: 'Billing' },
  { value: 'account', label: 'Account Issue' },
]

export default function HelpPage() {
  const { data: session } = useSession()
  const { addToast } = useToast()
  const [sending, setSending] = useState(false)
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)

  const [form, setForm] = useState({
    category: 'general',
    subject: '',
    message: '',
  })

  const handleSubmit = async () => {
    if (!form.subject.trim()) {
      addToast({ title: 'Error', description: 'Please enter a subject.', variant: 'error' })
      return
    }
    if (!form.message.trim()) {
      addToast({ title: 'Error', description: 'Please enter a message.', variant: 'error' })
      return
    }

    try {
      setSending(true)
      const res = await fetch('/api/support/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to send message')
      }

      setForm({ category: 'general', subject: '', message: '' })
      addToast({
        title: 'Message Sent',
        description: 'We\'ve received your message and will get back to you soon.',
        variant: 'success',
      })
    } catch (error) {
      addToast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to send message.',
        variant: 'error',
      })
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2">Help & Support</h1>
        <p className="text-text-secondary">
          Get help with CraftForms or reach out to our support team
        </p>
      </div>

      <div className="space-y-8">
        {/* Contact Form */}
        <section className="bg-surface border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold text-text-primary mb-2">Contact Support</h2>
          <p className="text-sm text-text-secondary mb-6">
            Send us a message and we&apos;ll get back to you as soon as possible.
            You can also email us directly at{' '}
            <a href={`mailto:${SUPPORT_EMAIL}`} className="text-primary hover:underline">
              {SUPPORT_EMAIL}
            </a>
          </p>

          <div className="space-y-4">
            <div>
              <Label htmlFor="contact-from">From</Label>
              <Input
                id="contact-from"
                value={session?.user?.email || ''}
                disabled
                className="bg-background"
              />
            </div>

            <div>
              <Label htmlFor="contact-category">Category</Label>
              <select
                id="contact-category"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="contact-subject">Subject</Label>
              <Input
                id="contact-subject"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                placeholder="Brief description of your issue"
                maxLength={200}
              />
            </div>

            <div>
              <Label htmlFor="contact-message">Message</Label>
              <textarea
                id="contact-message"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Describe your issue or question in detail..."
                maxLength={5000}
                rows={6}
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-vertical"
              />
              <p className="text-xs text-text-secondary mt-1">
                {form.message.length}/5000 characters
              </p>
            </div>

            <Button onClick={handleSubmit} disabled={sending}>
              {sending ? 'Sending...' : 'Send Message'}
            </Button>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="bg-surface border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold text-text-primary mb-6">Frequently Asked Questions</h2>

          <div className="space-y-2">
            {faqs.map((faq, index) => (
              <div key={index} className="border border-border rounded-lg overflow-hidden">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-background transition-colors"
                >
                  <span className="text-sm font-medium text-text-primary">{faq.question}</span>
                  <svg
                    className={`w-4 h-4 text-text-secondary transition-transform flex-shrink-0 ml-2 ${
                      expandedFaq === index ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {expandedFaq === index && (
                  <div className="px-4 py-3 border-t border-border bg-background">
                    <p className="text-sm text-text-secondary">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Direct Contact */}
        <section className="bg-surface border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold text-text-primary mb-4">Other Ways to Reach Us</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3 py-2">
              <svg className="w-5 h-5 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-text-primary">Email</p>
                <a href={`mailto:${SUPPORT_EMAIL}`} className="text-sm text-primary hover:underline">
                  {SUPPORT_EMAIL}
                </a>
              </div>
            </div>
            <div className="border-t border-border" />
            <div className="flex items-center gap-3 py-2">
              <svg className="w-5 h-5 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-text-primary">Response Time</p>
                <p className="text-sm text-text-secondary">We typically respond within 24 hours</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
