import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { z } from 'zod'

const postSchema = z.object({
  affiliate_id: z.string().min(1),
  discount_code_id: z.string().min(1),
  affiliate_commission_rate: z.number().min(1).max(100),
})

const patchSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('update_rate'), id: z.string(), affiliate_commission_rate: z.number().min(1).max(100) }),
  z.object({ action: z.literal('unassign'), id: z.string() }),
])

export async function POST(req: NextRequest) {
  try {
    const body = postSchema.parse(await req.json())
    const supabase = createAdminClient()

    const { data: existing } = await supabase
      .from('affiliate_discount_code_assignments')
      .select('id')
      .eq('discount_code_id', body.discount_code_id)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'Ten kod rabatowy jest już przypisany do partnera' }, { status: 409 })
    }

    const { data, error } = await supabase
      .from('affiliate_discount_code_assignments')
      .insert({
        affiliate_id: body.affiliate_id,
        discount_code_id: body.discount_code_id,
        affiliate_commission_rate: body.affiliate_commission_rate,
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
      case 'update_rate': {
        const { error } = await supabase
          .from('affiliate_discount_code_assignments')
          .update({ affiliate_commission_rate: body.affiliate_commission_rate })
          .eq('id', body.id)
        if (error) return NextResponse.json({ error: error.message }, { status: 500 })
        break
      }
      case 'unassign': {
        const { error } = await supabase
          .from('affiliate_discount_code_assignments')
          .delete()
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
      .from('affiliate_discount_code_assignments')
      .select('id, discount_code_id, affiliate_commission_rate, created_at, discount_codes(id, code, discount_type, discount_value, active, used_count)')
      .eq('affiliate_id', affiliateId)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const assignments = (data ?? []).map((row: Record<string, unknown>) => {
      const dc = row.discount_codes as Record<string, unknown> | null
      return {
        id: row.id,
        discount_code_id: row.discount_code_id,
        code: dc?.code ?? '',
        discount_type: dc?.discount_type ?? '',
        discount_value: dc?.discount_value ?? 0,
        active: dc?.active ?? false,
        used_count: dc?.used_count ?? 0,
        affiliate_commission_rate: row.affiliate_commission_rate,
        created_at: row.created_at,
      }
    })

    return NextResponse.json({ data: assignments })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Błąd serwera'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
