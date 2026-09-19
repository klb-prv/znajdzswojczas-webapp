import { after, NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { createAffiliateSession, AFFILIATE_SESSION_COOKIE } from '@/lib/affiliate-session'
import { hashPassword } from '@/lib/password'
import { rateLimit } from '@/lib/rate-limit'
import { z } from 'zod'

const schema = z.object({
  login: z.string().min(1),
  password: z.string().min(1),
})

export async function POST(req: NextRequest) {
  try {
    const limited = rateLimit(req, 'affiliate-auth', 10)
    if (limited) return limited

    const body = schema.parse(await req.json())
    const supabase = createAdminClient()

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? null
    const userAgent = req.headers.get('user-agent') ?? null
    const passwordHash = await hashPassword(body.password)

    const { data: affiliate } = await supabase
      .from('affiliates')
      .select('id, login, name, referral_code, commission_percent, active, password_hash')
      .eq('login', body.login.toLowerCase().trim())
      .maybeSingle()

    const recordEvent = (success: boolean) => {
      after(async () => {
        try {
          await supabase.from('affiliate_login_events').insert({
            affiliate_id: affiliate!.id,
            ip_address: ip,
            user_agent: userAgent,
            success,
          })
        } catch {}
      })
    }

    if (!affiliate || affiliate.password_hash !== passwordHash) {
      if (affiliate) recordEvent(false)
      return NextResponse.json({ error: 'Nieprawidłowy login lub hasło' }, { status: 401 })
    }

    if (!affiliate.active) {
      recordEvent(false)
      return NextResponse.json({ error: 'Konto zostało dezaktywowane' }, { status: 403 })
    }

    recordEvent(true)

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
