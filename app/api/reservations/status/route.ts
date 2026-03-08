import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

const STATUS_LABELS: Record<string, string> = {
  pending_confirmation: 'Oczekuje na potwierdzenie',
  confirmed: 'Przyjęto do realizacji',
  rescheduled: 'Termin przełożony',
  cancelled: 'Odwołano',
  awaiting_payment: 'Zrealizowano - oczekiwanie na płatność',
  in_progress: 'W trakcie realizacji',
}

const STATUS_EMOJI: Record<string, string> = {
  pending_confirmation: '⏳',
  confirmed: '✅',
  rescheduled: '📅',
  cancelled: '❌',
  awaiting_payment: '💳',
  in_progress: '🔄',
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const SHORT_REGEX = /^#?[0-9a-f]{8}$/i

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const raw: string = (body?.id ?? '').toString().trim()

    if (!raw) {
      return NextResponse.json({ error: 'Podaj ID zgłoszenia' }, { status: 400 })
    }

    const supabase = createAdminClient()
    let r: Record<string, unknown> | null = null

    if (UUID_REGEX.test(raw)) {
      // Pełny UUID
      const { data } = await supabase
        .from('reservations')
        .select('id, name, description, topic, status, date, notes, final_price, reservation_number')
        .eq('id', raw)
        .maybeSingle()
      r = data
    } else if (SHORT_REGEX.test(raw)) {
      // Krótkie ID (np. #63F7E90D)
      const shortId = raw.replace(/^#/, '').toUpperCase()
      const { data } = await supabase
        .from('reservations')
        .select('id, name, description, topic, status, date, notes, final_price, reservation_number')
        .eq('reservation_number', shortId)
        .maybeSingle()
      r = data
    } else {
      return NextResponse.json({ error: 'Nieprawidłowe ID zgłoszenia' }, { status: 400 })
    }

    if (!r) {
      return NextResponse.json({ error: 'Nie znaleziono zgłoszenia o podanym ID' }, { status: 404 })
    }

    return NextResponse.json({
      id: r.id,
      name: r.name,
      topic: r.topic,
      description: r.description,
      status: r.status,
      statusLabel: STATUS_LABELS[r.status as string] ?? r.status,
      statusEmoji: STATUS_EMOJI[r.status as string] ?? '📋',
      date: r.date,
      notes: r.notes,
      finalPrice: r.final_price ?? null,
      reservationNumber: (r.reservation_number as string) ?? (r.id as string).slice(0, 8).toUpperCase(),
    })
  } catch {
    return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 })
  }
}
