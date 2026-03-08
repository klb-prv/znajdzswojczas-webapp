import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/server'

const schema = z.object({
  status: z.enum(['accepting', 'maintenance', 'closed']),
  status_message: z.string().nullable().optional(),
})

export async function GET() {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('site_settings')
    .select('*')
    .eq('id', 1)
    .single()
  return NextResponse.json(data ?? { status: 'accepting', status_message: null })
}

export async function PUT(req: NextRequest) {
  try {
    const body = schema.parse(await req.json())
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('site_settings')
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq('id', 1)
      .select()
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Błąd walidacji' }, { status: 422 })
  }
}
