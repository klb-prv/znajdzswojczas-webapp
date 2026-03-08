import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/server'
import { sendCancellationEmail, sendRescheduleEmail, sendCategoryChangeEmail, sendCompletionEmail, sendInProgressEmail, sendPaymentConfirmedEmail } from '@/lib/email'
import { format } from 'date-fns'
import { pl } from 'date-fns/locale'

const cancelSchema = z.object({
  action: z.literal('cancel'),
  reason: z.string().min(5),
})

const rescheduleSchema = z.object({
  action: z.literal('reschedule'),
  new_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  reason: z.string().min(5),
})

const changeTopicSchema = z.object({
  action: z.literal('change_topic'),
  new_topic: z.string().min(2),
  reason: z.string().min(3),
})

const completeSchema = z.object({
  action: z.literal('complete'),
  final_price: z.number().positive(),
  payment_days: z.number().int().min(1).default(14),
})

const correctPriceSchema = z.object({
  action: z.literal('correct_price'),
  final_price: z.number().positive(),
})

const startWorkSchema = z.object({
  action: z.literal('start_work'),
  estimated_days: z.number().int().min(1),
})

const confirmPaymentSchema = z.object({
  action: z.literal('confirm_payment'),
})

const updateOptionsSchema = z.object({
  action: z.literal('update_options'),
  new_options: z.array(z.string()),
})

const schema = z.discriminatedUnion('action', [cancelSchema, rescheduleSchema, changeTopicSchema, completeSchema, correctPriceSchema, startWorkSchema, confirmPaymentSchema, updateOptionsSchema])

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const data = schema.parse(body)
    const supabase = createAdminClient()

    const { data: reservation, error } = await supabase
      .from('reservations')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !reservation) {
      return NextResponse.json({ error: 'Nie znaleziono rezerwacji' }, { status: 404 })
    }

    const oldDate = format(new Date(reservation.date), 'd MMMM yyyy', { locale: pl })

    if (data.action === 'cancel') {
      await supabase
        .from('reservations')
        .update({ status: 'cancelled', cancel_reason: data.reason })
        .eq('id', id)

      await sendCancellationEmail(reservation.email, reservation.name, oldDate, data.reason)
      return NextResponse.json({ success: true })
    }

    if (data.action === 'reschedule') {
      // Sprawdź czy nowa data nie jest zablokowana
      const { data: blocked } = await supabase
        .from('blocked_dates')
        .select('id')
        .eq('date', data.new_date)
        .single()

      if (blocked) {
        return NextResponse.json({ error: 'Nowy termin jest zablokowany' }, { status: 400 })
      }

      // Sprawdź czy nowa data nie jest już zajęta
      const { data: taken } = await supabase
        .from('reservations')
        .select('id')
        .eq('date', data.new_date)
        .in('status', ['pending_confirmation', 'confirmed'])
        .neq('id', id)

      if (taken && taken.length > 0) {
        return NextResponse.json({ error: 'Ten termin jest już zajęty' }, { status: 409 })
      }

      await supabase
        .from('reservations')
        .update({
          status: 'rescheduled',
          date: data.new_date,
          reschedule_reason: data.reason,
        })
        .eq('id', id)

      const newDateFormatted = format(new Date(data.new_date), 'd MMMM yyyy', { locale: pl })
      await sendRescheduleEmail(
        reservation.email,
        reservation.name,
        oldDate,
        newDateFormatted,
        data.reason
      )
      return NextResponse.json({ success: true })
    }

    if (data.action === 'change_topic') {
      const oldTopic = reservation.topic
      await supabase
        .from('reservations')
        .update({ topic: data.new_topic })
        .eq('id', id)

      await sendCategoryChangeEmail(
        reservation.email,
        reservation.name,
        id,
        data.new_topic,
        oldTopic,
        data.new_topic,
        data.reason
      )
      return NextResponse.json({ success: true })
    }

    if (data.action === 'complete') {
      await supabase
        .from('reservations')
        .update({ status: 'awaiting_payment', final_price: data.final_price })
        .eq('id', id)

      const formattedDate = format(new Date(reservation.date), 'd MMMM yyyy', { locale: pl })
      await sendCompletionEmail(
        reservation.email,
        reservation.name,
        formattedDate,
        reservation.topic,
        id,
        data.final_price,
        data.payment_days
      )
      return NextResponse.json({ success: true })
    }

    if (data.action === 'correct_price') {
      await supabase
        .from('reservations')
        .update({ final_price: data.final_price })
        .eq('id', id)
      return NextResponse.json({ success: true })
    }

    if (data.action === 'start_work') {
      await supabase
        .from('reservations')
        .update({ status: 'in_progress' })
        .eq('id', id)

      const formattedDate = format(new Date(reservation.date), 'd MMMM yyyy', { locale: pl })
      await sendInProgressEmail(
        reservation.email,
        reservation.name,
        formattedDate,
        reservation.topic,
        id,
        data.estimated_days
      )
      return NextResponse.json({ success: true })
    }

    if (data.action === 'confirm_payment') {
      if (!reservation.final_price) {
        return NextResponse.json({ error: 'Brak ceny do potwierdzenia' }, { status: 400 })
      }
      await supabase
        .from('reservations')
        .update({ status: 'paid' })
        .eq('id', id)

      const formattedDate = format(new Date(reservation.date), 'd MMMM yyyy', { locale: pl })
      await sendPaymentConfirmedEmail(
        reservation.email,
        reservation.name,
        formattedDate,
        reservation.topic,
        id,
        reservation.final_price
      )
      return NextResponse.json({ success: true })
    }

    if (data.action === 'update_options') {
      const topic = reservation.topic
      // Preserve Kontakt and Priorytet suffixes
      const kontaktMatch = topic.match(/ \[Kontakt: Discord[^\]]+\]$/)
      const kontakt = kontaktMatch ? kontaktMatch[0] : ''
      let rest = topic.replace(/ \[Kontakt: Discord[^\]]+\]$/, '')
      const hasPriority = rest.includes(' [Priorytet]')
      rest = rest.replace(/ \[Priorytet\]/g, '').trim()
      // Remove any existing options bracket
      rest = rest.replace(/ \[[^\]]+\]$/, '').trim()
      // Reconstruct topic
      let newTopic = rest
      if (data.new_options.length > 0) {
        newTopic += ` [${data.new_options.join(', ')}]`
      }
      if (hasPriority) newTopic += ' [Priorytet]'
      newTopic += kontakt

      await supabase
        .from('reservations')
        .update({ topic: newTopic })
        .eq('id', id)
      return NextResponse.json({ success: true })
    }
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 422 })
    }
    return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 })
  }
}
