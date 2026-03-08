import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const SHORT_REGEX = /^#?[0-9a-f]{8}$/i

const CANCELLABLE_STATUSES = ['pending_confirmation', 'confirmed', 'rescheduled']

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const raw: string = (body?.id ?? '').toString().trim()

    if (!raw) {
      return NextResponse.json({ error: 'Podaj numer zgłoszenia' }, { status: 400 })
    }

    const supabase = createAdminClient()
    let r: Record<string, unknown> | null = null

    if (UUID_REGEX.test(raw)) {
      const { data } = await supabase
        .from('reservations')
        .select('id, name, status')
        .eq('id', raw)
        .maybeSingle()
      r = data
    } else if (SHORT_REGEX.test(raw)) {
      const shortId = raw.replace(/^#/, '').toUpperCase()
      const { data } = await supabase
        .from('reservations')
        .select('id, name, status')
        .eq('reservation_number', shortId)
        .maybeSingle()
      r = data
    } else {
      return NextResponse.json({ error: 'Nieprawidłowy numer zgłoszenia' }, { status: 400 })
    }

    if (!r) {
      return NextResponse.json({ error: 'Nie znaleziono zgłoszenia o podanym numerze' }, { status: 404 })
    }

    const status = r.status as string
    if (['awaiting_payment', 'paid', 'in_progress'].includes(status)) {
      return NextResponse.json(
        { error: 'Usługa została zrealizowana - nie można anulować zgłoszenia zgodnie z regulaminem.' },
        { status: 409 }
      )
    }

    if (!CANCELLABLE_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: 'Tego zgłoszenia nie można już anulować.' },
        { status: 409 }
      )
    }

    await supabase
      .from('reservations')
      .update({ status: 'cancelled', cancel_reason: 'Anulowane przez klienta' })
      .eq('id', r.id as string)

    return NextResponse.json({ success: true, name: r.name })
  } catch {
    return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 })
  }
}
