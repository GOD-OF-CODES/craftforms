/**
 * Email Service
 *
 * Provides email sending functionality using Resend or SendGrid.
 * Includes templates for verification, password reset, and notifications.
 */

// Email provider type
type EmailProvider = 'resend' | 'sendgrid'

// Email configuration
interface EmailConfig {
  provider: EmailProvider
  from: string
  replyTo?: string
}

// Email options
interface SendEmailOptions {
  to: string | string[]
  subject: string
  html: string
  text?: string
  replyTo?: string
  tags?: Record<string, string>
}

// Email result
interface EmailResult {
  success: boolean
  messageId?: string
  error?: string
}

// Default configuration
const defaultConfig: EmailConfig = {
  provider: (process.env.EMAIL_PROVIDER as EmailProvider) || 'resend',
  from: process.env.EMAIL_FROM || 'CraftForms <noreply@example.com>',
  replyTo: process.env.EMAIL_REPLY_TO
}

/**
 * Send an email using the configured provider
 */
export async function sendEmail(options: SendEmailOptions): Promise<EmailResult> {
  const config = defaultConfig

  try {
    if (config.provider === 'resend') {
      return await sendWithResend(options, config)
    } else if (config.provider === 'sendgrid') {
      return await sendWithSendGrid(options, config)
    } else {
      // Fallback: log email in development
      console.log('[Email] Would send:', {
        to: options.to,
        subject: options.subject,
        preview: options.text?.substring(0, 100)
      })
      return { success: true, messageId: 'dev-' + Date.now() }
    }
  } catch (error) {
    console.error('[Email] Send failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send email'
    }
  }
}

/**
 * Send email using Resend
 */
async function sendWithResend(
  options: SendEmailOptions,
  config: EmailConfig
): Promise<EmailResult> {
  const apiKey = process.env.RESEND_API_KEY

  if (!apiKey) {
    console.warn('[Email] RESEND_API_KEY not set, skipping email')
    return { success: false, messageId: 'skipped-no-api-key', error: 'RESEND_API_KEY is not configured' }
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: config.from,
      to: Array.isArray(options.to) ? options.to : [options.to],
      subject: options.subject,
      html: options.html,
      text: options.text,
      reply_to: options.replyTo || config.replyTo,
      tags: options.tags ? Object.entries(options.tags).map(([name, value]) => ({ name, value })) : undefined
    })
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Resend API error: ${error}`)
  }

  const data = await response.json()
  return { success: true, messageId: data.id }
}

/**
 * Send email using SendGrid
 */
async function sendWithSendGrid(
  options: SendEmailOptions,
  config: EmailConfig
): Promise<EmailResult> {
  const apiKey = process.env.SENDGRID_API_KEY

  if (!apiKey) {
    console.warn('[Email] SENDGRID_API_KEY not set, skipping email')
    return { success: false, messageId: 'skipped-no-api-key', error: 'SENDGRID_API_KEY is not configured' }
  }

  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      personalizations: [{
        to: (Array.isArray(options.to) ? options.to : [options.to]).map(email => ({ email }))
      }],
      from: { email: config.from.match(/<(.+)>/)?.[1] || config.from },
      subject: options.subject,
      content: [
        { type: 'text/plain', value: options.text || '' },
        { type: 'text/html', value: options.html }
      ]
    })
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`SendGrid API error: ${error}`)
  }

  return { success: true, messageId: response.headers.get('X-Message-Id') || 'sent' }
}

// ============================================================================
// Email Templates
// ============================================================================

/**
 * Base email template wrapper
 */
function wrapTemplate(content: string, title: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .card { background: white; border-radius: 12px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
    .logo { text-align: center; margin-bottom: 30px; }
    .logo h1 { color: #6366f1; margin: 0; font-size: 24px; }
    .content { margin-bottom: 30px; }
    .button { display: inline-block; background: #6366f1; color: white !important; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; }
    .button:hover { background: #4f46e5; }
    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
    .footer a { color: #6366f1; }
    h2 { color: #111; margin-top: 0; }
    p { margin: 16px 0; }
    .code { background: #f0f0f0; padding: 12px 20px; border-radius: 8px; font-family: monospace; font-size: 18px; text-align: center; letter-spacing: 4px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="logo">
        <h1>CraftForms</h1>
      </div>
      <div class="content">
        ${content}
      </div>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} CraftForms. All rights reserved.</p>
      <p>If you didn't request this email, you can safely ignore it.</p>
    </div>
  </div>
</body>
</html>
`
}

/**
 * Email verification template
 */
export function getVerificationEmailTemplate(data: {
  name: string
  verificationUrl: string
}): { subject: string; html: string; text: string } {
  const content = `
    <h2>Verify your email address</h2>
    <p>Hi ${data.name},</p>
    <p>Thanks for signing up! Please verify your email address by clicking the button below:</p>
    <p style="text-align: center; margin: 30px 0;">
      <a href="${data.verificationUrl}" class="button">Verify Email</a>
    </p>
    <p>Or copy and paste this link into your browser:</p>
    <p style="word-break: break-all; color: #666;">${data.verificationUrl}</p>
    <p>This link will expire in 24 hours.</p>
  `

  return {
    subject: 'Verify your email address',
    html: wrapTemplate(content, 'Verify your email'),
    text: `Hi ${data.name},\n\nThanks for signing up! Please verify your email address by visiting:\n\n${data.verificationUrl}\n\nThis link will expire in 24 hours.`
  }
}

/**
 * Password reset template
 */
export function getPasswordResetTemplate(data: {
  name: string
  resetUrl: string
}): { subject: string; html: string; text: string } {
  const content = `
    <h2>Reset your password</h2>
    <p>Hi ${data.name},</p>
    <p>We received a request to reset your password. Click the button below to create a new password:</p>
    <p style="text-align: center; margin: 30px 0;">
      <a href="${data.resetUrl}" class="button">Reset Password</a>
    </p>
    <p>Or copy and paste this link into your browser:</p>
    <p style="word-break: break-all; color: #666;">${data.resetUrl}</p>
    <p>This link will expire in 1 hour. If you didn't request a password reset, you can ignore this email.</p>
  `

  return {
    subject: 'Reset your password',
    html: wrapTemplate(content, 'Reset your password'),
    text: `Hi ${data.name},\n\nWe received a request to reset your password. Visit this link to create a new password:\n\n${data.resetUrl}\n\nThis link will expire in 1 hour. If you didn't request a password reset, you can ignore this email.`
  }
}

/**
 * Workspace invitation template
 */
export function getInvitationEmailTemplate(data: {
  inviterName: string
  workspaceName: string
  role: string
  inviteUrl: string
}): { subject: string; html: string; text: string } {
  const content = `
    <h2>You've been invited!</h2>
    <p>${data.inviterName} has invited you to join <strong>${data.workspaceName}</strong> as a ${data.role}.</p>
    <p style="text-align: center; margin: 30px 0;">
      <a href="${data.inviteUrl}" class="button">Accept Invitation</a>
    </p>
    <p>Or copy and paste this link into your browser:</p>
    <p style="word-break: break-all; color: #666;">${data.inviteUrl}</p>
    <p>This invitation will expire in 7 days.</p>
  `

  return {
    subject: `${data.inviterName} invited you to ${data.workspaceName}`,
    html: wrapTemplate(content, 'Workspace Invitation'),
    text: `${data.inviterName} has invited you to join ${data.workspaceName} as a ${data.role}.\n\nAccept the invitation:\n${data.inviteUrl}\n\nThis invitation will expire in 7 days.`
  }
}

/**
 * Form response notification template
 */
export function getResponseNotificationTemplate(data: {
  formName: string
  responseCount: number
  viewUrl: string
  summary?: string
}): { subject: string; html: string; text: string } {
  const content = `
    <h2>New form response</h2>
    <p>You have a new response on <strong>${data.formName}</strong>.</p>
    ${data.summary ? `<div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin: 20px 0;">${data.summary}</div>` : ''}
    <p>Total responses: ${data.responseCount}</p>
    <p style="text-align: center; margin: 30px 0;">
      <a href="${data.viewUrl}" class="button">View Response</a>
    </p>
  `

  return {
    subject: `New response on "${data.formName}"`,
    html: wrapTemplate(content, 'New Form Response'),
    text: `You have a new response on "${data.formName}".\n\nTotal responses: ${data.responseCount}\n\nView response: ${data.viewUrl}`
  }
}

/**
 * Form submission confirmation template (for respondents)
 */
export function getSubmissionConfirmationTemplate(data: {
  formName: string
  respondentName?: string
}): { subject: string; html: string; text: string } {
  const content = `
    <h2>Thanks for your response!</h2>
    ${data.respondentName ? `<p>Hi ${data.respondentName},</p>` : ''}
    <p>We've received your response to <strong>${data.formName}</strong>.</p>
    <p>Thank you for taking the time to complete this form. Your feedback is valuable to us.</p>
  `

  return {
    subject: `Thanks for completing "${data.formName}"`,
    html: wrapTemplate(content, 'Response Confirmed'),
    text: `Thanks for your response!\n\nWe've received your response to "${data.formName}". Thank you for taking the time to complete this form.`
  }
}

// ============================================================================
// High-level email functions
// ============================================================================

/**
 * Send verification email
 */
export async function sendVerificationEmail(
  email: string,
  name: string,
  token: string
): Promise<EmailResult> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const verificationUrl = `${baseUrl}/verify-email?token=${token}`

  const template = getVerificationEmailTemplate({ name, verificationUrl })

  return sendEmail({
    to: email,
    ...template,
    tags: { type: 'verification' }
  })
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  email: string,
  name: string,
  token: string
): Promise<EmailResult> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const resetUrl = `${baseUrl}/reset-password?token=${token}`

  const template = getPasswordResetTemplate({ name, resetUrl })

  return sendEmail({
    to: email,
    ...template,
    tags: { type: 'password-reset' }
  })
}

/**
 * Send workspace invitation email
 */
export async function sendInvitationEmail(
  email: string,
  inviterName: string,
  workspaceName: string,
  role: string,
  token: string
): Promise<EmailResult> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const inviteUrl = `${baseUrl}/invite/accept?token=${token}`

  const template = getInvitationEmailTemplate({
    inviterName,
    workspaceName,
    role,
    inviteUrl
  })

  return sendEmail({
    to: email,
    ...template,
    tags: { type: 'invitation', workspace: workspaceName }
  })
}

/**
 * Send form response notification
 */
export async function sendResponseNotification(
  recipients: string[],
  formName: string,
  responseCount: number,
  formId: string,
  responseId: string,
  summary?: string
): Promise<EmailResult> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const viewUrl = `${baseUrl}/forms/${formId}/responses/${responseId}`

  const template = getResponseNotificationTemplate({
    formName,
    responseCount,
    viewUrl,
    summary
  })

  return sendEmail({
    to: recipients,
    ...template,
    tags: { type: 'notification', form: formId }
  })
}
