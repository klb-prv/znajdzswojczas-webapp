import { NextRequest, NextResponse } from 'next/server'
import { generateSecret, verify, generateURI } from 'otplib'
import { createAdminClient } from '@/lib/supabase/server'
import { createSessionToken, SESSION_COOKIE } from '@/lib/session'
import { z } from 'zod'

const ADMIN_EMAIL = () => (process.env.ADMIN_EMAIL ?? '').toLowerCase().trim()

const schema = z.discriminatedUnion('step', [
  z.object({ step: z.literal('check'), email: z.string().email() }),
  z.object({ step: z.literal('verify'), email: z.string().email(), code: z.string().length(6) }),
])

export async function POST(req: NextRequest) {
  try {
    const body = schema.parse(await req.json())
    const supabase = createAdminClient()

    if (body.step === 'check') {
      if (body.email.toLowerCase().trim() !== ADMIN_EMAIL()) {
        return NextResponse.json({ error: 'Nieautoryzowany adres email' }, { status: 403 })
      }

      const { data: user } = await supabase
        .from('admin_users')
        .select('totp_secret, totp_enabled')
        .eq('email', body.email.toLowerCase().trim())
        .single()

      if (user?.totp_enabled) {
        return NextResponse.json({ mode: 'verify' })
      }

      // First-time setup -generate TOTP secret
      const secret = generateSecret()
      const otpAuthUrl = generateURI({
        issuer: 'ZnajdzSwojCzas',
        label: body.email,
        secret,
      })
      await supabase.from('admin_users').upsert(
        { email: body.email.toLowerCase().trim(), totp_secret: secret, totp_enabled: false },
        { onConflict: 'email' }
      )

      return NextResponse.json({
        mode: 'setup',
        secret,
        qrUrl: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpAuthUrl)}`,
      })
    }

    if (body.step === 'verify') {
      if (body.email.toLowerCase().trim() !== ADMIN_EMAIL()) {
        return NextResponse.json({ error: 'Nieautoryzowany adres email' }, { status: 403 })
      }

      const { data: user } = await supabase
        .from('admin_users')
        .select('totp_secret, totp_enabled')
        .eq('email', body.email.toLowerCase().trim())
        .single()

      if (!user?.totp_secret) {
        return NextResponse.json({ error: 'Najpierw wykonaj konfigurację 2FA' }, { status: 400 })
      }

      const result = await verify({ token: body.code, secret: user.totp_secret })
      if (!result.valid) {
        return NextResponse.json({ error: 'Nieprawidłowy kod 2FA. Sprawdź czas w aplikacji.' }, { status: 400 })
      }

      // Mark as enabled on first successful verify
      if (!user.totp_enabled) {
        await supabase
          .from('admin_users')
          .update({ totp_enabled: true })
          .eq('email', body.email.toLowerCase().trim())
      }

      const sessionToken = await createSessionToken()
      const res = NextResponse.json({ ok: true })
      res.cookies.set(SESSION_COOKIE, sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60,
        path: '/',
      })
      return res
    }

    return NextResponse.json({ error: 'Nieprawidłowe żądanie' }, { status: 400 })
  } catch {
    return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 })
  }
}
