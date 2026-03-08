import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { sendConfirmationEmail, sendCompletionEmail, sendPaymentConfirmedEmail } from '@/lib/email'
import { format } from 'date-fns'
import { pl } from 'date-fns/locale'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = createAdminClient()

  const { data: reservation, error } = await supabase
    .from('reservations')
    .select('name, email, date, topic, status, final_price')
    .eq('id', id)
    .single()

  if (error || !reservation) {
    return NextResponse.json({ error: 'Nie znaleziono zgłoszenia' }, { status: 404 })
  }

  try {
    const formattedDate = format(new Date(reservation.date), 'd MMMM yyyy', { locale: pl })

    if (reservation.status === 'paid' && reservation.final_price != null) {
      await sendPaymentConfirmedEmail(
        reservation.email,
        reservation.name,
        formattedDate,
        reservation.topic,
        id,
        reservation.final_price
      )
    } else if (reservation.status === 'awaiting_payment' && reservation.final_price != null) {
      await sendCompletionEmail(
        reservation.email,
        reservation.name,
        formattedDate,
        reservation.topic,
        id,
        reservation.final_price
      )
    } else {
      await sendConfirmationEmail(
        reservation.email,
        reservation.name,
        formattedDate,
        reservation.topic,
        id
      )
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Błąd przy wysyłaniu maila' }, { status: 500 })
  }
}
