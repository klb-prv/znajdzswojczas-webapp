import { NextResponse } from 'next/server'
import { AFFILIATE_SESSION_COOKIE } from '@/lib/affiliate-session'

export async function POST() {
  const res = NextResponse.json({ ok: true })
  res.cookies.set(AFFILIATE_SESSION_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  })
  return res
}
