import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { success: false, message: 'Se requiere un email válido.' },
        { status: 400 }
      )
    }

    // Mock mode — in production, send a password reset email
    // For now, always return success to avoid email enumeration
    return NextResponse.json({
      success: true,
      message: 'Si el email está registrado, recibirás un enlace para restablecer tu contraseña.',
    })
  } catch {
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor.' },
      { status: 500 }
    )
  }
}
