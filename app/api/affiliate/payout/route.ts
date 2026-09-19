import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createAdminClient } from '@/lib/supabase/server'
import { verifyAffiliateSession, AFFILIATE_SESSION_COOKIE } from '@/lib/affiliate-session'
import { isDemoAffiliate } from '@/lib/demo-mode'
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

    // Tryb demo (konto "demo") nie może zlecać wypłat - blokada po stronie serwera
    const { data: affRow } = await supabase
      .from('affiliates')
      .select('login')
      .eq('id', affiliateId)
      .maybeSingle()

    if (isDemoAffiliate(affRow?.login)) {
      return NextResponse.json({ error: 'Tryb demo nie może zlecać wypłat' }, { status: 403 })
    }

    const [commissionsRes, existingPayoutsRes] = await Promise.all([
      supabase
        .from('affiliate_commissions')
        .select('commission_amount, status')
        .eq('affiliate_id', affiliateId),
      supabase
        .from('affiliate_payouts')
        .select('amount, status')
        .eq('affiliate_id', affiliateId),
    ])

    const commissions = commissionsRes.data as { commission_amount: number; status: string }[] | null
    const existingPayouts = existingPayoutsRes.data as { amount: number; status: string }[] | null

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
