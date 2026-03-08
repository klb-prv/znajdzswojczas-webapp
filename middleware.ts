import { NextRequest, NextResponse } from 'next/server'
import { verifySessionToken, SESSION_COOKIE } from '@/lib/session'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Always allow: login page and auth API endpoints
  if (
    pathname === '/admin/login' ||
    pathname.startsWith('/api/admin/auth')
  ) {
    return NextResponse.next()
  }

  // Block direct browser navigation (URL bar / link) to all /api/* routes.
  // Browsers set Sec-Fetch-Mode: navigate for top-level navigation; fetch() calls
  // use 'cors' or 'same-origin'. Non-browser tools (curl, Postman) don't send this
  // header at all, so they pass through - but URL bar clicks from any browser are blocked.
  if (pathname.startsWith('/api/')) {
    const secFetchMode = req.headers.get('sec-fetch-mode')
    if (secFetchMode === 'navigate') {
      return new NextResponse(
        '<!DOCTYPE html><html lang="pl"><head><meta charset="utf-8"><title>Brak dostępu</title>' +
        '<style>body{font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#f8fafc}' +
        '.box{text-align:center;padding:2rem;border:1px solid #e2e8f0;border-radius:1rem;max-width:400px}' +
        'h1{color:#1e293b;font-size:1.5rem;margin-bottom:.5rem}p{color:#64748b;font-size:.95rem}</style></head>' +
        '<body><div class="box"><h1>403 – Brak dostępu</h1>' +
        '<p>Ten zasób jest dostępny wyłącznie przez interfejs serwisu znajdzswojczas.pl.</p></div></body></html>',
        { status: 403, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
      )
    }
  }

  const token = req.cookies.get(SESSION_COOKIE)?.value
  const valid = token ? await verifySessionToken(token) : false

  // Protect /api/admin/* - return 401 JSON
  if (pathname.startsWith('/api/admin')) {
    if (!valid) {
      return NextResponse.json({ error: 'Nieautoryzowany dostęp' }, { status: 401 })
    }
    return NextResponse.next()
  }

  // Protect /admin/* pages - redirect to login
  if (pathname.startsWith('/admin')) {
    if (!valid) {
      const loginUrl = new URL('/admin/login', req.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/:path*'],
}
