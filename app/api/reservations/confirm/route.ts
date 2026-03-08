import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/server'
import { sendConfirmationEmail } from '@/lib/email'
import { format } from 'date-fns'
import { pl } from 'date-fns/locale'

const schema = z.object({
  reservation_id: z.string().uuid(),
  code: z.string().length(6),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { reservation_id, code } = schema.parse(body)
    const supabase = createAdminClient()

    // Znajdź ważny, nieużyty kod
    const { data: vc, error } = await supabase
      .from('verification_codes')
      .select('*')
      .eq('reservation_id', reservation_id)
      .eq('code', code)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (error || !vc) {
      return NextResponse.json({ error: 'Nieprawidłowy lub wygasły kod' }, { status: 400 })
    }

    // Oznacz kod jako użyty
    await supabase
      .from('verification_codes')
      .update({ used: true })
      .eq('id', vc.id)

    // Potwierdź rezerwację
    const { data: reservation } = await supabase
      .from('reservations')
      .update({ status: 'confirmed' })
      .eq('id', reservation_id)
      .select('name, email, date, topic')
      .single()

    if (reservation) {
      const formattedDate = format(new Date(reservation.date), 'd MMMM yyyy', { locale: pl })
      await sendConfirmationEmail(
        reservation.email,
        reservation.name,
        formattedDate,
        reservation.topic,
        reservation_id
      )
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Nieprawidłowe dane' }, { status: 422 })
    }
    return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 })
  }
}
