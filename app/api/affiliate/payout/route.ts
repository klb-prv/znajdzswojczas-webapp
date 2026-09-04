import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createAdminClient } from '@/lib/supabase/server'
import { verifyAffiliateSession, AFFILIATE_SESSION_COOKIE } from '@/lib/affiliate-session'
import { z } from 'zod'

const schema = z.object({
  amount: z.number().positive(),
})

export async function POST(req: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get(AFFILIATE_SESSION_COOKIE)?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const affiliateId = await verifyAffiliateSession(token)
  if (!affiliateId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = schema.parse(await req.json())

    if (body.amount < 10) {
      return NextResponse.json({ error: 'Minimalna kwota wypłaty to 10 zł' }, { status: 400 })
    }

    const supabase = createAdminClient()

    const { data: commissions } = await supabase
      .from('affiliate_commissions')
      .select('commission_amount, status')
      .eq('affiliate_id', affiliateId) as { data: { commission_amount: number; status: string }[] | null }

    const { data: existingPayouts } = await supabase
      .from('affiliate_payouts')
      .select('amount, status')
      .eq('affiliate_id', affiliateId) as { data: { amount: number; status: string }[] | null }

    const totalAvailable = commissions
      ?.filter((c) => c.status === 'available')
      .reduce((sum, c) => sum + Number(c.commission_amount), 0) ?? 0

    const reserved = existingPayouts
      ?.filter((p) => p.status === 'pending' || p.status === 'approved')
      .reduce((sum, p) => sum + Number(p.amount), 0) ?? 0

    const available = totalAvailable - reserved

    if (body.amount > available) {
      return NextResponse.json({ error: 'Niewystarczające środki' }, { status: 400 })
    }

    const { error } = await supabase
      .from('affiliate_payouts')
      .insert({
        affiliate_id: affiliateId,
        amount: body.amount,
        status: 'pending',
      })

    if (error) {
      return NextResponse.json({ error: 'Błąd zapisu' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 })
  }
}
