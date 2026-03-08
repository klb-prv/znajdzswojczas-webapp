import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/server'

const schema = z.object({ code: z.string().min(1) })

export async function POST(req: NextRequest) {
  try {
    const { code } = schema.parse(await req.json())
    const supabase = createAdminClient()

    const { data: dc } = await supabase
      .from('discount_codes')
      .select('*')
      .eq('code', code.toUpperCase().trim())
      .single()

    if (!dc)
      return NextResponse.json({ valid: false, error: 'Nieprawidłowy kod zniżkowy' })
    if (!dc.active)
      return NextResponse.json({ valid: false, error: 'Ten kod jest nieaktywny' })
    if (dc.expires_at && new Date(dc.expires_at) < new Date())
      return NextResponse.json({ valid: false, error: 'Kod wygasł' })
    if (dc.max_uses !== null && dc.used_count >= dc.max_uses)
      return NextResponse.json({ valid: false, error: 'Kod został już w pełni wykorzystany' })

    return NextResponse.json({
      valid: true,
      discount_type: dc.discount_type as 'percent' | 'fixed',
      discount_value: dc.discount_value as number,
      code: dc.code as string,
    })
  } catch {
    return NextResponse.json({ valid: false, error: 'Błąd walidacji' })
  }
}
