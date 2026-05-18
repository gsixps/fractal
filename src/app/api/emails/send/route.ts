import { NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email'
import { requireAuth } from '@/lib/api-auth'

/**
 * POST /api/emails/send
 *
 * Main email sending endpoint. Requires authentication.
 *
 * Body:
 *   to: string          – Recipient email address
 *   subject: string     – Email subject (optional if templateName provided)
 *   templateName: string – Name of the email template to use (optional)
 *   variables: Record<string, string> – Key-value pairs to replace in template
 *   bodyHtml: string    – Custom HTML body (optional, overrides template)
 *   bodyText: string    – Custom text body (optional, overrides template)
 */
export async function POST(request: Request) {
  // SECURITY: Require authentication to send emails
  const { error } = await requireAuth(request.headers.get('cookie'))
  if (error) return error

  try {
    const body = await request.json()
    const { to, subject, templateName, variables, bodyHtml, bodyText } = body

    // Validate required fields
    if (!to || typeof to !== 'string') {
      return NextResponse.json(
        { error: '"to" is required and must be a valid email address' },
        { status: 400 }
      )
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(to)) {
      return NextResponse.json(
        { error: 'Invalid email address format' },
        { status: 400 }
      )
    }

    // If no templateName, subject and bodyHtml are required
    if (!templateName && !subject) {
      return NextResponse.json(
        { error: 'Either "templateName" or "subject" is required' },
        { status: 400 }
      )
    }

    // Send the email
    const result = await sendEmail({
      to,
      subject: subject || '',
      templateName: templateName || undefined,
      bodyHtml: bodyHtml || undefined,
      bodyText: bodyText || undefined,
      variables: variables || {},
    })

    // Create an audit log entry
    try {
      const { db } = await import('@/lib/db')
      await db.auditLog.create({
        data: {
          action: 'email.send',
          entity: 'EmailLog',
          entityId: result.emailId,
          details: `Email sent to ${to} using template ${templateName || 'custom'}`,
        },
      })
    } catch {
      // Audit log is non-critical, don't fail the request
    }

    return NextResponse.json({
      success: true,
      emailId: result.emailId,
      to: result.to,
      subject: result.subject,
      renderedHtml: result.bodyHtml,
      renderedText: result.bodyText,
      status: result.status,
      message: result.message,
    })
  } catch (error) {
    console.error('Error sending email:', error)

    const message =
      error instanceof Error ? error.message : 'Failed to send email'

    // If it's a template-not-found error, return 404
    if (message.includes('not found')) {
      return NextResponse.json({ error: message }, { status: 404 })
    }

    return NextResponse.json({ error: message }, { status: 500 })
  }
}
