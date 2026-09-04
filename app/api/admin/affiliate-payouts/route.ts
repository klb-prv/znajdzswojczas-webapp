import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { z } from 'zod'

const patchSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('approve'), id: z.string() }),
  z.object({ action: z.literal('reject'), id: z.string(), rejection_reason: z.string().optional() }),
  z.object({ action: z.literal('mark_paid'), id: z.string() }),
])

export async function GET() {
  try {
    const supabase = createAdminClient()
    const { data: payouts, error } = await supabase
      .from('affiliate_payouts')
      .select('*, affiliates(name)')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const result = (payouts ?? []).map((p: Record<string, unknown>) => ({
      id: p.id,
      affiliate_id: p.affiliate_id,
      affiliate_name: (p.affiliates as { name: string } | null)?.name ?? 'Nieznany',
      amount: p.amount,
      status: p.status,
      rejection_reason: p.rejection_reason,
      created_at: p.created_at,
      approved_at: p.approved_at,
      paid_at: p.paid_at,
    }))

    return NextResponse.json({ data: result })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Błąd serwera'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = patchSchema.parse(await req.json())
    const supabase = createAdminClient()

    switch (body.action) {
      case 'approve': {
        const { error } = await supabase
          .from('affiliate_payouts')
          .update({ status: 'approved', approved_at: new Date().toISOString() })
          .eq('id', body.id)
        if (error) return NextResponse.json({ error: error.message }, { status: 500 })
        break
      }
      case 'reject': {
        const { error } = await supabase
          .from('affiliate_payouts')
          .update({ status: 'rejected', rejection_reason: body.rejection_reason ?? null })
          .eq('id', body.id)
        if (error) return NextResponse.json({ error: error.message }, { status: 500 })
        break
      }
      case 'mark_paid': {
        const { error } = await supabase
          .from('affiliate_payouts')
          .update({ status: 'paid', paid_at: new Date().toISOString() })
          .eq('id', body.id)
        if (error) return NextResponse.json({ error: error.message }, { status: 500 })
        break
      }
    }

    return NextResponse.json({ ok: true })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Błąd serwera'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
