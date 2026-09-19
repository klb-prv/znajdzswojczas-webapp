import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/server'
import { getAffiliateContext } from '@/lib/affiliate-auth'
import { hashPassword, validatePartnerPassword } from '@/lib/password'

const schema = z.object({
  current_password: z.string().min(1),
  new_password: z.string().min(1),
})

export async function POST(req: NextRequest) {
  try {
    const affiliate = await getAffiliateContext()
    if (!affiliate) {
      return NextResponse.json({ error: 'Nieautoryzowany dostęp' }, { status: 401 })
    }

    const body = schema.parse(await req.json())
    const supabase = createAdminClient()

    const { data: row } = await supabase
      .from('affiliates')
      .select('password_hash')
      .eq('id', affiliate.id)
      .maybeSingle()

    if (!row) {
      return NextResponse.json({ error: 'Nie znaleziono konta' }, { status: 404 })
    }

    const currentHash = await hashPassword(body.current_password)
    if (currentHash !== row.password_hash) {
      return NextResponse.json({ error: 'Obecne hasło jest nieprawidłowe' }, { status: 403 })
    }

    const validationError = validatePartnerPassword(body.new_password)
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 422 })
    }

    if (body.new_password === body.current_password) {
      return NextResponse.json({ error: 'Nowe hasło nie może być takie samo jak obecne' }, { status: 422 })
    }

    const newHash = await hashPassword(body.new_password)
    const { error } = await supabase
      .from('affiliates')
      .update({ password_hash: newHash })
      .eq('id', affiliate.id)

    if (error) {
      return NextResponse.json({ error: 'Nie udało się zapisać hasła' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (e: unknown) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: 'Nieprawidłowe dane' }, { status: 422 })
    }
    const msg = e instanceof Error ? e.message : 'Błąd serwera'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
