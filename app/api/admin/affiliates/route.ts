import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { z } from 'zod'

const createSchema = z.object({
  action: z.literal('create'),
  name: z.string().min(1),
  login: z.string().min(1),
  password_hash: z.string().min(1),
  referral_code: z.string().min(1),
})

const patchSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('edit_name'), id: z.string(), name: z.string().min(1) }),
  z.object({ action: z.literal('reset_password'), id: z.string(), password_hash: z.string().min(1) }),
  z.object({ action: z.literal('block'), id: z.string() }),
  z.object({ action: z.literal('activate'), id: z.string() }),
  z.object({ action: z.literal('archive'), id: z.string() }),
])

export async function POST(req: NextRequest) {
  try {
    const body = createSchema.parse(await req.json())
    const supabase = createAdminClient()

    const { data: existing } = await supabase
      .from('affiliates')
      .select('id')
      .eq('login', body.login)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'Login już istnieje' }, { status: 409 })
    }

    const { data, error } = await supabase
      .from('affiliates')
      .insert({
        name: body.name,
        login: body.login,
        password_hash: body.password_hash,
        referral_code: body.referral_code,
        commission_percent: 10,
        active: true,
      })
      .select('id')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, id: data.id })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Błąd serwera'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = patchSchema.parse(await req.json())
    const supabase = createAdminClient()

    switch (body.action) {
      case 'edit_name': {
        const { error } = await supabase
          .from('affiliates')
          .update({ name: body.name })
          .eq('id', body.id)
        if (error) return NextResponse.json({ error: error.message }, { status: 500 })
        break
      }
      case 'reset_password': {
        const { error } = await supabase
          .from('affiliates')
          .update({ password_hash: body.password_hash })
          .eq('id', body.id)
        if (error) return NextResponse.json({ error: error.message }, { status: 500 })
        break
      }
      case 'block': {
        const { error } = await supabase
          .from('affiliates')
          .update({ active: false })
          .eq('id', body.id)
        if (error) return NextResponse.json({ error: error.message }, { status: 500 })
        break
      }
      case 'activate': {
        const { error } = await supabase
          .from('affiliates')
          .update({ active: true })
          .eq('id', body.id)
        if (error) return NextResponse.json({ error: error.message }, { status: 500 })
        break
      }
      case 'archive': {
        const { error } = await supabase
          .from('affiliates')
          .update({ active: false })
          .eq('id', body.id)
        if (error) return NextResponse.json({ error: error.message }, { status: 500 })
        break
      }
    }

    return NextResponse.json({ ok: true })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Błąd serwera'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
