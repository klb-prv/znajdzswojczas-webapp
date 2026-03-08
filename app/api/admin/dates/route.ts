import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/server'
import { addDays, parseISO, format } from 'date-fns'

const dateRegex = /^\d{4}-\d{2}-\d{2}$/

const singleSchema = z.object({
  date: z.string().regex(dateRegex),
  date_from: z.undefined().optional(),
  date_to: z.undefined().optional(),
  block_type: z.enum(['vacation', 'manual']).default('manual'),
  reason: z.string().optional(),
})

const rangeSchema = z.object({
  date: z.undefined().optional(),
  date_from: z.string().regex(dateRegex),
  date_to: z.string().regex(dateRegex),
  block_type: z.literal('vacation'),
  reason: z.string().optional(),
})

const schema = z.union([rangeSchema, singleSchema])

export async function GET() {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('blocked_dates')
    .select('*')
    .order('date', { ascending: true })

  if (error) return NextResponse.json({ error: 'Błąd pobierania dat' }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = schema.parse(body)
    const supabase = createAdminClient()

    // Vacation range: loop from date_from to date_to
    if ('date_from' in parsed && parsed.date_from && parsed.date_to) {
      const from = parseISO(parsed.date_from)
      const to = parseISO(parsed.date_to)
      if (from > to) {
        return NextResponse.json({ error: 'Data od musi być przed datą do' }, { status: 422 })
      }
      const rows: { date: string; block_type: 'vacation'; reason: string | null }[] = []
      let cur = from
      while (cur <= to) {
        rows.push({ date: format(cur, 'yyyy-MM-dd'), block_type: 'vacation', reason: parsed.reason ?? null })
        cur = addDays(cur, 1)
      }
      // Insert ignoring duplicates (upsert with onConflict ignore)
      const { data, error } = await supabase
        .from('blocked_dates')
        .upsert(rows, { onConflict: 'date', ignoreDuplicates: true })
        .select()

      if (error) return NextResponse.json({ error: 'Błąd dodawania blokad' }, { status: 500 })
      return NextResponse.json(data, { status: 201 })
    }

    // Single date
    const { date, block_type, reason } = parsed as { date: string; block_type: 'vacation' | 'manual'; reason?: string }
    const { data, error } = await supabase
      .from('blocked_dates')
      .insert({ date, block_type, reason: reason ?? null })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Ta data jest już zablokowana' }, { status: 409 })
      }
      return NextResponse.json({ error: 'Błąd dodawania blokady' }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Nieprawidłowy format danych' }, { status: 422 })
    }
    return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Brak id' }, { status: 400 })

  const supabase = createAdminClient()
  const { error } = await supabase.from('blocked_dates').delete().eq('id', id)

  if (error) return NextResponse.json({ error: 'Błąd usuwania' }, { status: 500 })
  return NextResponse.json({ success: true })
}
