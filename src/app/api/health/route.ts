import { NextResponse } from 'next/server'

export async function GET() {
  const startTime = Date.now()

  // Check database connectivity
  let dbStatus = 'ok'
  try {
    const { db } = await import('@/lib/db')
    await db.$queryRaw`SELECT 1`
  } catch (error) {
    dbStatus = 'error'
  }

  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    responseTime: Date.now() - startTime,
    services: {
      database: dbStatus,
      api: 'ok',
    },
    version: '1.0.0',
  })
}
