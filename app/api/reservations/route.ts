import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/server'
import { sendVerificationEmail } from '@/lib/email'
import { format } from 'date-fns'
import { pl } from 'date-fns/locale'

const schema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Nieprawidłowy format daty'),
  name: z.string().min(2),
  email: z.string().email(),
  topic: z.string().min(3),
  description: z.string().min(100, 'Opis musi mieć minimum 100 znaków'),
  contact_method: z.enum(['email', 'discord']).optional().default('email'),
  discord_nick: z.string().optional(),
  discount_code: z.string().optional(),
})

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = schema.parse(body)
    const supabase = createAdminClient()

    // Sprawdź status serwisu
    const { data: settings } = await supabase
      .from('site_settings')
      .select('status')
      .eq('id', 1)
      .single()

    const siteStatus = settings?.status ?? 'accepting'
    if (siteStatus === 'maintenance') {
      return NextResponse.json({ error: 'Serwis jest obecnie w trakcie przerwy technicznej. Spróbuj ponownie za chwilę.' }, { status: 503 })
    }
    if (siteStatus === 'closed') {
      return NextResponse.json({ error: 'Przyjmowanie nowych zgłoszeń jest tymczasowo wstrzymane.' }, { status: 503 })
    }

    // Blokada dnia dzisiejszego i przeszłości
    const todayStr = format(new Date(), 'yyyy-MM-dd')
    if (data.date <= todayStr) {
      return NextResponse.json({ error: 'Nie można rezerwować dnia dzisiejszego ani w przeszłości' }, { status: 400 })
    }

    // Blokada świąt (24-25 grudnia)
    const [, mm, dd] = data.date.split('-').map(Number)
    if (mm === 12 && (dd === 24 || dd === 25)) {
      return NextResponse.json({ error: 'W tym dniu nie przyjmujemy rezerwacji (Święta Bożego Narodzenia)' }, { status: 400 })
    }

    // Sprawdź czy data nie jest zablokowana
    const { data: blocked } = await supabase
      .from('blocked_dates')
      .select('id')
      .eq('date', data.date)
      .single()

    if (blocked) {
      return NextResponse.json({ error: 'Wybrany termin jest niedostępny' }, { status: 400 })
    }

    // Sprawdź czy data nie jest już zajęta rezerwacją
    const { data: existing } = await supabase
      .from('reservations')
      .select('id')
      .eq('date', data.date)
      .in('status', ['pending_confirmation', 'confirmed'])

    if (existing && existing.length > 0) {
      return NextResponse.json({ error: 'Ten termin jest już zajęty' }, { status: 409 })
    }

    // Waliduj i zużyj kod zniżkowy (jeśli podany)
    let discountInfo: string | null = null
    if (data.discount_code) {
      const normalizedCode = data.discount_code.toUpperCase().trim()
      const { data: dc } = await supabase
        .from('discount_codes')
        .select('*')
        .eq('code', normalizedCode)
        .single()

      if (!dc || !dc.active) {
        return NextResponse.json({ error: 'Nieprawidłowy lub nieaktywny kod zniżkowy' }, { status: 400 })
      }
      if (dc.expires_at && new Date(dc.expires_at) < new Date()) {
        return NextResponse.json({ error: 'Kod zniżkowy wygasł' }, { status: 400 })
      }
      if (dc.max_uses !== null && dc.used_count >= dc.max_uses) {
        return NextResponse.json({ error: 'Kod zniżkowy został już w pełni wykorzystany' }, { status: 400 })
      }
      // Zużyj jedno użycie
      await supabase
        .from('discount_codes')
        .update({ used_count: dc.used_count + 1 })
        .eq('id', dc.id)

      discountInfo = dc.discount_type === 'percent'
        ? `ZNIŻKA ${dc.discount_value}% (${normalizedCode})`
        : `ZNIŻKA ${dc.discount_value} zł (${normalizedCode})`
    }

    // Utwórz rezerwację (bez pól tylko-metadanych)
    const { discount_code: _dc, contact_method: _cm, discord_nick: _dn, ...reservationData } = data
    const clientIp =
      req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      req.headers.get('x-real-ip') ||
      null
    const insertData = {
      ...reservationData,
      ...(discountInfo ? { notes: discountInfo } : {}),
    }

    const { data: reservation, error: resErr } = await supabase
      .from('reservations')
      .insert(insertData)
      .select()
      .single()

    if (resErr || !reservation) {
      return NextResponse.json({ error: 'Błąd przy tworzeniu rezerwacji' }, { status: 500 })
    }

    // Ustaw krótkie ID widoczne dla klienta
    const reservationNumber = reservation.id.slice(0, 8).toUpperCase()
    await supabase
      .from('reservations')
      .update({ reservation_number: reservationNumber, ...(clientIp ? { client_ip: clientIp } : {}) })
      .eq('id', reservation.id)

    // Utwórz kod weryfikacyjny (ważny 30 min)
    const code = generateCode()
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString()

    await supabase.from('verification_codes').insert({
      reservation_id: reservation.id,
      code,
      expires_at: expiresAt,
    })

    // Wyślij email
    const formattedDate = format(new Date(data.date), 'd MMMM yyyy', { locale: pl })
    const discordNick = data.contact_method === 'discord' && data.discord_nick?.trim()
      ? data.discord_nick.trim()
      : undefined
    await sendVerificationEmail(data.email, data.name, code, reservation.id, formattedDate, discordNick)

    return NextResponse.json({ reservation_id: reservation.id }, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 422 })
    }
    return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 })
  }
}
