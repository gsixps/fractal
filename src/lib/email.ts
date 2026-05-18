import { db } from '@/lib/db'

export interface SendEmailParams {
  to: string
  subject: string
  templateName?: string
  bodyHtml?: string
  bodyText?: string
  variables?: Record<string, string>
}

export interface SendEmailResult {
  success: boolean
  emailId: string
  to: string
  subject: string
  bodyHtml: string
  bodyText: string
  status: string
  message: string
}

/**
 * Replace template variables in a string (e.g. {{userName}} → "María")
 */
function replaceTemplateVariables(
  template: string,
  variables: Record<string, string>
): string {
  let result = template
  for (const [key, value] of Object.entries(variables)) {
    // Support both {{key}} and {{key_name}} style
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value)
    // Also support snake_case variant
    const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase()
    if (snakeKey !== key) {
      result = result.replace(new RegExp(`\\{\\{${snakeKey}\\}\\}`, 'g'), value)
    }
  }
  return result
}

/**
 * Send an email using the GSP email system.
 * In production, this would connect to an actual email provider (SendGrid, AWS SES, etc.)
 * In sandbox/demo mode, we log the email and store it in the EmailLog table.
 */
export async function sendEmail(params: SendEmailParams): Promise<SendEmailResult> {
  const { to, subject, templateName, variables = {} } = params

  let bodyHtml = params.bodyHtml || ''
  let bodyText = params.bodyText || ''

  // If a templateName is provided, look up the template
  if (templateName) {
    const template = await db.emailTemplate.findUnique({
      where: { name: templateName },
    })

    if (!template) {
      throw new Error(`Email template "${templateName}" not found`)
    }

    if (!template.isActive) {
      throw new Error(`Email template "${templateName}" is inactive`)
    }

    // Use template content if not explicitly provided
    bodyHtml = params.bodyHtml || template.bodyHtml
    bodyText = params.bodyText || template.bodyText
  }

  // Replace variables in subject, bodyHtml, and bodyText
  const renderedSubject = replaceTemplateVariables(subject, variables)
  const renderedHtml = replaceTemplateVariables(bodyHtml, variables)
  const renderedText = replaceTemplateVariables(bodyText, variables)

  // ── MOCK EMAIL SENDER ──────────────────────────────────────────────
  // In sandbox mode, we simulate sending the email:
  // 1. Log it to the console for debugging
  // 2. Store it in the EmailLog table
  // In production, this block would be replaced with an actual email API call.

  console.log('📧 [EMAIL SENT] ─────────────────────────────────')
  console.log(`  To: ${to}`)
  console.log(`  Subject: ${renderedSubject}`)
  console.log(`  Template: ${templateName || 'custom'}`)
  console.log(`  Variables: ${JSON.stringify(variables)}`)
  console.log(`  HTML length: ${renderedHtml.length} chars`)
  console.log(`  Text length: ${renderedText.length} chars`)
  console.log('──────────────────────────────────────────────────')

  // Store the email in the EmailLog table
  const emailLog = await db.emailLog.create({
    data: {
      to,
      subject: renderedSubject,
      bodyHtml: renderedHtml,
      bodyText: renderedText,
      templateName: templateName || null,
      variables: JSON.stringify(variables),
      status: 'sent',
    },
  })

  return {
    success: true,
    emailId: emailLog.id,
    to,
    subject: renderedSubject,
    bodyHtml: renderedHtml,
    bodyText: renderedText,
    status: 'sent',
    message: `Email sent successfully (mock mode). Log ID: ${emailLog.id}`,
  }
}

