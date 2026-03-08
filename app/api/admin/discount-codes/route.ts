import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/server'

const createSchema = z.object({
  code: z.string().min(3).max(50),
  discount_type: z.enum(['percent', 'fixed']).default('percent'),
  discount_value: z.number().int().positive(),
  expires_at: z.string().datetime().nullable().optional(),
  max_uses: z.number().int().positive().nullable().optional(),
})

export async function GET() {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('discount_codes')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  try {
    const body = createSchema.parse(await req.json())
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('discount_codes')
      .insert({ ...body, code: body.code.toUpperCase().trim() })
      .select()
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json(data, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Błąd walidacji' }, { status: 422 })
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Brak id' }, { status: 400 })
  const supabase = createAdminClient()
  const { error } = await supabase.from('discount_codes').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

const patchSchema = z.union([
  z.object({ active: z.boolean() }),
  z.object({
    discount_type: z.enum(['percent', 'fixed']),
    discount_value: z.number().int().positive(),
  }),
])

export async function PATCH(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Brak id' }, { status: 400 })
  try {
    const body = patchSchema.parse(await req.json())
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('discount_codes')
      .update(body)
      .eq('id', id)
      .select()
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Błąd walidacji' }, { status: 422 })
  }
}
