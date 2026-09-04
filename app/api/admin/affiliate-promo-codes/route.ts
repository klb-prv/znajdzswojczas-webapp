import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { z } from 'zod'

const postSchema = z.object({
  affiliate_id: z.string().min(1),
  code: z.string().min(1),
  client_discount_rate: z.number(),
  affiliate_commission_rate: z.number(),
})

const patchSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('toggle_status'), id: z.string() }),
  z.object({ action: z.literal('update_rate'), id: z.string(), client_discount_rate: z.number(), affiliate_commission_rate: z.number() }),
  z.object({ action: z.literal('archive'), id: z.string() }),
])

export async function POST(req: NextRequest) {
  try {
    const body = postSchema.parse(await req.json())
    const supabase = createAdminClient()

    const { data: existing } = await supabase
      .from('affiliate_promo_codes')
      .select('id')
      .eq('code', body.code)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'Kod już istnieje' }, { status: 409 })
    }

    const { data, error } = await supabase
      .from('affiliate_promo_codes')
      .insert({
        affiliate_id: body.affiliate_id,
        code: body.code,
        client_discount_rate: body.client_discount_rate,
        affiliate_commission_rate: body.affiliate_commission_rate,
        status: 'active',
        usage_count: 0,
      })
      .select('id')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, id: data.id })
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
      case 'toggle_status': {
        const { data: current } = await supabase
          .from('affiliate_promo_codes')
          .select('status')
          .eq('id', body.id)
          .single()
        if (!current) return NextResponse.json({ error: 'Nie znaleziono kodu' }, { status: 404 })
        const newStatus = current.status === 'active' ? 'inactive' : 'active'
        const { error } = await supabase
          .from('affiliate_promo_codes')
          .update({ status: newStatus })
          .eq('id', body.id)
        if (error) return NextResponse.json({ error: error.message }, { status: 500 })
        break
      }
      case 'update_rate': {
        const { error } = await supabase
          .from('affiliate_promo_codes')
          .update({
            client_discount_rate: body.client_discount_rate,
            affiliate_commission_rate: body.affiliate_commission_rate,
          })
          .eq('id', body.id)
        if (error) return NextResponse.json({ error: error.message }, { status: 500 })
        break
      }
      case 'archive': {
        const { error } = await supabase
          .from('affiliate_promo_codes')
          .update({ status: 'archived' })
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

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const affiliateId = searchParams.get('affiliate_id')
    if (!affiliateId) {
      return NextResponse.json({ error: 'affiliate_id wymagany' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('affiliate_promo_codes')
      .select('*')
      .eq('affiliate_id', affiliateId)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Błąd serwera'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
