import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { createAffiliateSession, AFFILIATE_SESSION_COOKIE } from '@/lib/affiliate-session'
import { z } from 'zod'

const schema = z.object({
  login: z.string().min(1),
  password: z.string().min(1),
})

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

export async function POST(req: NextRequest) {
  try {
    const body = schema.parse(await req.json())
    const supabase = createAdminClient()

    const passwordHash = await hashPassword(body.password)

    const { data: affiliate, error } = await supabase
      .from('affiliates')
      .select('id, login, name, referral_code, commission_percent, active')
      .eq('login', body.login.toLowerCase().trim())
      .eq('password_hash', passwordHash)
      .single()

    if (error || !affiliate) {
      return NextResponse.json({ error: 'Nieprawidłowy login lub hasło' }, { status: 401 })
    }

    if (!affiliate.active) {
      return NextResponse.json({ error: 'Konto zostało dezaktywowane' }, { status: 403 })
    }

    const sessionToken = await createAffiliateSession(affiliate.id)
    const res = NextResponse.json({ ok: true, affiliate: { name: affiliate.name, login: affiliate.login } })
    res.cookies.set(AFFILIATE_SESSION_COOKIE, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60,
      path: '/',
    })
    return res
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Błąd serwera'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
