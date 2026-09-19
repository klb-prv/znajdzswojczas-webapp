import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/server'
import { getAffiliateContext } from '@/lib/affiliate-auth'

export const SELF_CODE_DISCOUNT_PERCENT = 15

const schema = z.object({
  code: z
    .string()
    .trim()
    .min(4, 'Kod musi mieć co najmniej 4 znaki')
    .max(20, 'Kod może mieć maksymalnie 20 znaków')
    .regex(/^[A-Z0-9]+$/i, 'Kod może zawierać tylko litery i cyfry'),
})

export async function POST(req: NextRequest) {
  try {
    const affiliate = await getAffiliateContext()
    if (!affiliate) {
      return NextResponse.json({ error: 'Nieautoryzowany dostęp' }, { status: 401 })
    }

    const body = schema.parse(await req.json())
    const code = body.code.toUpperCase()

    const supabase = createAdminClient()

    const { data: affiliateRow } = await supabase
      .from('affiliates')
      .select('active, commission_percent')
      .eq('id', affiliate.id)
      .maybeSingle()

    if (!affiliateRow?.active) {
      return NextResponse.json({ error: 'Konto afiliacyjne jest nieaktywne' }, { status: 403 })
    }

    const { count, error: countError } = await supabase
      .from('affiliate_promo_codes')
      .select('id', { count: 'exact', head: true })
      .eq('affiliate_id', affiliate.id)
      .eq('created_by', 'affiliate')

    // Kolumna created_by istnieje dopiero po migracji affiliate_promo_code_created_by.sql.
    // Bez niej limit "1 kod" nie da się wyegzekwować - blokujemy tworzenie,
    // aby nie ominąć limitu, zamiast pozwalać na nieograniczone kody.
    if (countError) {
      return NextResponse.json(
        { error: 'Tworzenie własnych kodów wymaga migracji bazy (affiliate_promo_codes.created_by). Uruchom supabase/migrations/2026_affiliate_panel_full.sql w Supabase SQL Editor.' },
        { status: 503 }
      )
    }

    if ((count ?? 0) > 0) {
      return NextResponse.json(
        { error: 'Możesz utworzyć tylko jeden własny kod promocyjny' },
        { status: 409 }
      )
    }

    const [{ data: takenPromo }, { data: takenDiscount }] = await Promise.all([
      supabase.from('affiliate_promo_codes').select('id').eq('code', code).maybeSingle(),
      supabase.from('discount_codes').select('id').eq('code', code).maybeSingle(),
    ])

    if (takenPromo || takenDiscount) {
      return NextResponse.json({ error: 'Ten kod jest już zajęty, wybierz inny' }, { status: 409 })
    }

    const { data, error } = await supabase
      .from('affiliate_promo_codes')
      .insert({
        affiliate_id: affiliate.id,
        code,
        client_discount_rate: SELF_CODE_DISCOUNT_PERCENT,
        affiliate_commission_rate: affiliateRow.commission_percent,
        status: 'active',
        usage_count: 0,
        created_by: 'affiliate',
      })
      .select('id, code')
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Ten kod jest już zajęty, wybierz inny' }, { status: 409 })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, id: data.id, code: data.code })
  } catch (e: unknown) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.errors[0].message }, { status: 422 })
    }
    const msg = e instanceof Error ? e.message : 'Błąd serwera'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
