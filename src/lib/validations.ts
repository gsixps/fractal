import { z } from 'zod'

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})

export const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Debe tener una mayúscula')
    .regex(/[0-9]/, 'Debe tener un número'),
  name: z.string().min(2, 'Mínimo 2 caracteres').optional(),
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/),
})

// Asset schemas
export const createAssetSchema = z.object({
  name: z.string().min(3).max(200),
  slug: z.string().min(3).max(200).regex(/^[a-z0-9-]+$/),
  type: z.string().min(1),
  status: z.enum(['draft', 'active', 'paused', 'sold', 'archived']).default('draft'),
  address: z.string().min(5),
  city: z.string().min(2),
  region: z.string().min(2),
  country: z.string().min(2).default('Chile'),
  totalValue: z.number().positive(),
  pricePerFraction: z.number().positive(),
  totalFractions: z.number().int().positive(),
  availableFractions: z.number().int().min(0),
  minimumInvestment: z.number().positive(),
  annualYield: z.number().min(0).max(100),
  projectedAppreciation: z.number().min(-100).max(100),
  totalProjectedReturn: z.number(),
  leaseStatus: z.enum(['vacant', 'leased', 'pending']).default('vacant'),
  monthlyRent: z.number().min(0).nullable().optional(),
  tenantName: z.string().nullable().optional(),
  totalArea: z.number().min(0).nullable().optional(),
  units: z.number().int().min(0).nullable().optional(),
  constructionYear: z.number().int().min(1900).max(2030).nullable().optional(),
  shortDescription: z.string().min(10).max(500),
  fullDescription: z.string().min(20),
  highlights: z.string().optional(),
  operationalCostsPct: z.number().min(0).max(100).nullable().optional(),
  badge: z.string().max(50).nullable().optional(),
})

// Blog schemas
export const createBlogSchema = z.object({
  title: z.string().min(5).max(200),
  slug: z.string().min(3).max(200).regex(/^[a-z0-9-]+$/),
  excerpt: z.string().min(10).max(500),
  content: z.string().min(20),
  coverImage: z.string().url().optional().nullable(),
  category: z.string().min(1),
  tags: z.string().default(''),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  featured: z.boolean().default(false),
})

// FAQ schemas
export const createFaqSchema = z.object({
  question: z.string().min(5).max(500),
  answer: z.string().min(10),
  category: z.string().min(1),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
})

// Testimonial schemas
export const createTestimonialSchema = z.object({
  name: z.string().min(2).max(100),
  role: z.string().max(100).optional().nullable(),
  quote: z.string().min(10).max(2000),
  rating: z.number().int().min(1).max(5).default(5),
  investmentAmount: z.number().min(0).optional().nullable(),
  assetName: z.string().max(200).optional().nullable(),
  isFeatured: z.boolean().default(false),
  isVerified: z.boolean().default(true),
  avatarUrl: z.string().url().optional().nullable(),
})

// User admin schemas
export const updateUserSchema = z.object({
  email: z.string().email().optional(),
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  rut: z.string().optional(),
  role: z.enum(['investor', 'admin', 'superadmin']).optional(),
  kycStatus: z.enum(['pending', 'submitted', 'verified', 'rejected']).optional(),
  isActive: z.boolean().optional(),
  balance: z.number().optional(),
  totalInvested: z.number().optional(),
  totalEarnings: z.number().optional(),
  avatarUrl: z.string().url().optional().nullable(),
  stripeCustomerId: z.string().optional(),
  kycSubmittedAt: z.string().optional().nullable(),
  kycVerifiedAt: z.string().optional().nullable(),
  notes: z.string().optional(),
})

// Settings schemas
export const updateSettingsSchema = z.object({
  settings: z.array(z.object({
    key: z.string(),
    value: z.string(),
  })),
})

// Pagination schemas
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).default('desc'),
})

// Secondary market schemas
export const createListingSchema = z.object({
  investmentId: z.string().min(1),
  fractionCount: z.number().int().positive().min(1),
  pricePerFraction: z.number().positive(),
})

// Notification schemas
export const markNotificationsReadSchema = z.object({
  notificationIds: z.array(z.string()).optional(),
  markAll: z.boolean().optional().default(false),
})

// Helper to format Zod validation errors into a user-friendly object
export function formatValidationErrors(error: z.ZodError): Record<string, string[]> {
  const fieldErrors: Record<string, string[]> = {}
  for (const issue of error.issues) {
    const field = issue.path.join('.') || '_form'
    const message = issue.message
    if (!fieldErrors[field]) {
      fieldErrors[field] = []
    }
    fieldErrors[field].push(message)
  }
  return fieldErrors
}

// Helper to validate and parse
export function validateBody<T>(schema: z.ZodType<T>, body: unknown) {
  return schema.safeParse(body)
}
