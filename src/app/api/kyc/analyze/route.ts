import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api-auth'
import { db } from '@/lib/db'

interface KYCAnalyzeRequest {
  documentType: 'id_front' | 'id_back' | 'selfie' | 'address'
  imageUrl: string
  documentData?: Record<string, unknown>
}

interface KYCAnalyzeResponse {
  verified: boolean
  confidence: number
  extractedData: Record<string, unknown>
  issues: string[]
  recommendation: 'approve' | 'review' | 'reject'
}

const SYSTEM_PROMPT = `You are a KYC document verification AI for 3GSP by GALAXY LLC, a fractional real estate investment platform. Analyze this document image and provide verification results.

You MUST respond with valid JSON only — no markdown, no explanation outside the JSON. The JSON must have exactly this shape:
{
  "verified": true,
  "confidence": 85,
  "extractedData": { "field": "value" },
  "issues": ["issue 1 if any"],
  "recommendation": "approve"
}

For each document type, analyze with these specific criteria:

## ID Front (id_front)
extractedData should include: fullName, documentNumber, dateOfBirth, nationality, expirationDate, documentType (passport/dni/license)
Check: Is it a valid government-issued ID? Is text clearly readable? Are there signs of tampering, blurring, or digital alteration? Is the photo area clear?

## ID Back (id_back)
extractedData should include: documentNumber (confirm it matches front), issueDate, issuingAuthority, mrz (machine readable zone text if visible)
Check: Does it match a standard ID back? Is the MRZ readable? Any signs of tampering?

## Selfie
extractedData should include: faceDetected (boolean), faceClarity (high/medium/low), lighting (good/fair/poor), multipleFaces (boolean), glassesDetected (boolean)
Check: Is there exactly one clear face? Is it well-lit? Is the face centered and unobstructed? No sunglasses or masks?

## Address Proof (address)
extractedData should include: fullAddress, city, country, postalCode, documentIssuer, documentDate, accountHolderName
Check: Is it a utility bill, bank statement, or official document showing name and address? Is the address clearly readable? Is it recent (within 3 months)?

Verification rules:
- verified: true only if no critical issues found AND confidence >= 60
- confidence: 0-100 based on overall document quality
- issues: list any problems found (empty array if none)
- recommendation: "approve" (confidence >= 80, no issues), "review" (confidence 50-79 or minor issues), "reject" (confidence < 50 or critical issues like tampering)`

export async function POST(request: Request) {
  const { error, session } = await requireAuth(request.headers.get('cookie'))
  if (error) return error

  try {
    const body: KYCAnalyzeRequest = await request.json()
    const { documentType, imageUrl, documentData } = body

    if (!documentType || !imageUrl) {
      return NextResponse.json(
        { error: 'documentType and imageUrl are required' },
        { status: 400 }
      )
    }

    const validTypes = ['id_front', 'id_back', 'selfie', 'address']
    if (!validTypes.includes(documentType)) {
      return NextResponse.json(
        {
          error: `documentType must be one of: ${validTypes.join(', ')}`,
        },
        { status: 400 }
      )
    }

    // Basic URL validation
    if (typeof imageUrl !== 'string' || imageUrl.length < 10) {
      return NextResponse.json(
        { error: 'imageUrl must be a valid URL or base64 string' },
        { status: 400 }
      )
    }

    const userId = session!.user!.id

    // Use z-ai-web-dev-sdk VLM (vision model) to analyze the document
    try {
      const ZAI = (await import('z-ai-web-dev-sdk')).default
      const zai = await ZAI.create()

      const typeLabel: Record<string, string> = {
        id_front: 'Government ID (Front Side)',
        id_back: 'Government ID (Back Side)',
        selfie: 'Selfie / Portrait Photo',
        address: 'Address Proof Document',
      }

      const userPrompt = `Analyze this ${typeLabel[documentType] || documentType} document image for KYC verification.

${documentData ? `\n## Additional Context Provided by User:\n${JSON.stringify(documentData, null, 2)}\n` : ''}

Return a JSON object with: verified (boolean), confidence (0-100), extractedData (object with relevant fields), issues (array of strings), recommendation ("approve", "review", or "reject").`

      const completion = await zai.chat.completions.createVision({
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'user',
            content: [
              { type: 'text', text: userPrompt },
              {
                type: 'image_url',
                image_url: { url: imageUrl },
              },
            ],
          },
        ],
        thinking: { type: 'disabled' },
      })

      const raw = completion?.choices?.[0]?.message?.content || ''

      // Parse JSON from VLM response
      const jsonMatch = raw.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])

        const result: KYCAnalyzeResponse = {
          verified: Boolean(parsed.verified),
          confidence: Math.min(
            100,
            Math.max(0, Number(parsed.confidence) || 50)
          ),
          extractedData:
            typeof parsed.extractedData === 'object' && parsed.extractedData
              ? parsed.extractedData
              : {},
          issues: Array.isArray(parsed.issues) ? parsed.issues : [],
          recommendation: validateRecommendation(parsed.recommendation),
        }

        // Update KYC document record if one exists for this user
        await updateKYCDocumentStatus(
          userId,
          documentType,
          result.recommendation,
          result.confidence
        )

        // Audit log
        await db.auditLog.create({
          data: {
            userId,
            action: 'kyc_document_analysis',
            entity: 'KYCDocument',
            details: JSON.stringify({
              documentType,
              verified: result.verified,
              confidence: result.confidence,
              recommendation: result.recommendation,
              issuesCount: result.issues.length,
            }),
          },
        })

        return NextResponse.json(result)
      }
    } catch (sdkErr) {
      console.error('z-ai-web-dev-sdk VLM error in KYC analysis:', sdkErr)
    }

    // Fallback: basic validation without AI
    const fallbackResult = basicDocumentValidation(documentType)

    await db.auditLog.create({
      data: {
        userId,
        action: 'kyc_document_analysis',
        entity: 'KYCDocument',
        details: JSON.stringify({
          documentType,
          ...fallbackResult,
          source: 'fallback_validation',
        }),
      },
    })

    return NextResponse.json(fallbackResult)
  } catch (err) {
    console.error('Error in KYC document analysis:', err)
    return NextResponse.json(
      { error: 'Failed to analyze document' },
      { status: 500 }
    )
  }
}

// ─── Update KYC document status in database ────────────────────────────────────
async function updateKYCDocumentStatus(
  userId: string,
  documentType: string,
  recommendation: string,
  confidence: number
) {
  try {
    // Map our document types to KYC document types in the database
    const dbDocTypeMap: Record<string, string> = {
      id_front: 'id_front',
      id_back: 'id_back',
      selfie: 'selfie',
      address: 'address_proof',
    }

    const dbDocType = dbDocTypeMap[documentType]
    if (!dbDocType) return

    // Find the most recent pending document of this type for this user
    const existingDoc = await db.kYCDocument.findFirst({
      where: {
        userId,
        documentType: dbDocType,
        status: 'pending',
      },
      orderBy: { createdAt: 'desc' },
    })

    if (existingDoc) {
      const newStatus =
        recommendation === 'approve' && confidence >= 70
          ? 'verified'
          : recommendation === 'reject'
            ? 'rejected'
            : 'pending' // Keep pending for "review" recommendation

      await db.kYCDocument.update({
        where: { id: existingDoc.id },
        data: {
          status: newStatus,
          reviewedAt: new Date(),
          reviewedBy: 'ai_kyc_analyzer',
          notes: `AI analysis result: ${recommendation} (confidence: ${confidence}%)`,
        },
      })
    }
  } catch (dbErr) {
    // Don't let DB update failure block the analysis response
    console.error('Error updating KYC document status:', dbErr)
  }
}

// ─── Fallback basic validation ────────────────────────────────────────────────
function basicDocumentValidation(
  documentType: string
): KYCAnalyzeResponse {
  const result: KYCAnalyzeResponse = {
    verified: false,
    confidence: 0,
    extractedData: {},
    issues: ['AI vision model unavailable — manual review required'],
    recommendation: 'review',
  }

  if (documentType === 'selfie') {
    result.extractedData = {
      faceDetected: null,
      faceClarity: 'unknown',
      lighting: 'unknown',
      multipleFaces: null,
      glassesDetected: null,
    }
    result.issues.push(
      'Could not verify face presence — requires manual review'
    )
  } else if (documentType === 'id_front' || documentType === 'id_back') {
    result.extractedData = {
      fullName: null,
      documentNumber: null,
      documentType: null,
    }
    result.issues.push(
      'Could not extract text from ID document — requires manual review'
    )
  } else if (documentType === 'address') {
    result.extractedData = {
      fullAddress: null,
      city: null,
      country: null,
      postalCode: null,
    }
    result.issues.push(
      'Could not extract address from document — requires manual review'
    )
  }

  return result
}

// ─── Helpers ────────────────────────────────────────────────────────────────────
function validateRecommendation(
  value: unknown
): 'approve' | 'review' | 'reject' {
  const valid = ['approve', 'review', 'reject']
  if (typeof value === 'string' && valid.includes(value)) {
    return value as 'approve' | 'review' | 'reject'
  }
  return 'review' // Default to review when uncertain
}
