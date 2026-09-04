import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/server'
import { verifyAffiliateSession, AFFILIATE_SESSION_COOKIE } from '@/lib/affiliate-session'
import { format } from 'date-fns'
import { pl } from 'date-fns/locale'

const COMMISSION_STATUS: Record<string, { label: string; color: string }> = {
  pending:   { label: 'Oczekuje',     color: 'bg-amber-900/30 text-amber-400 border-amber-800/50' },
  available: { label: 'Dostępna',     color: 'bg-emerald-900/30 text-emerald-400 border-emerald-800/50' },
  reserved:  { label: 'Zarezerwowana', color: 'bg-blue-900/30 text-blue-400 border-blue-800/50' },
  paid:      { label: 'Wypłacona',    color: 'bg-[#7C5CFC]/15 text-[#9277FF] border-[#7C5CFC]/30' },
  cancelled: { label: 'Anulowana',    color: 'bg-red-900/30 text-red-400 border-red-800/50' },
}

export default async function AffiliateDashboardPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get(AFFILIATE_SESSION_COOKIE)?.value
  if (!token) redirect('/affiliate/login')

  const affiliateId = await verifyAffiliateSession(token)
  if (!affiliateId) redirect('/affiliate/login')

  const supabase = createAdminClient()

  let affiliate: { name: string; referral_code: string; commission_percent: number } | null = null
  let commissions: { id: string; service_name: string | null; promo_code: string | null; commission_amount: number; status: string; created_at: string }[] = []
  let totalAvailable = 0
  let pendingCommission = 0
  let totalPaid = 0
  let totalCommissions = 0
  let totalClicks = 0

  try {
    const result = await supabase
      .from('affiliates')
      .select('name, referral_code, commission_percent')
      .eq('id', affiliateId)
      .single()
    affiliate = result.data

    const { data: commData } = await supabase
      .from('affiliate_commissions')
      .select('*')
      .eq('affiliate_id', affiliateId)
      .order('created_at', { ascending: false })
      .limit(5) as { data: { id: string; service_name: string | null; promo_code: string | null; commission_amount: number; status: string; created_at: string }[] | null }

    commissions = commData ?? []

    const { data: allComm } = await supabase
      .from('affiliate_commissions')
      .select('commission_amount, status')
      .eq('affiliate_id', affiliateId) as { data: { commission_amount: number; status: string }[] | null }

    const { data: allPayouts } = await supabase
      .from('affiliate_payouts')
      .select('amount, status')
      .eq('affiliate_id', affiliateId) as { data: { amount: number; status: string }[] | null }

    const { data: clicks } = await supabase
      .from('affiliate_clicks')
      .select('id', { count: 'exact', head: true })
      .eq('affiliate_id', affiliateId)

    totalAvailable = allComm?.filter((c) => c.status === 'available').reduce((sum, c) => sum + Number(c.commission_amount), 0) ?? 0
    pendingCommission = allComm?.filter((c) => c.status === 'pending').reduce((sum, c) => sum + Number(c.commission_amount), 0) ?? 0
    totalPaid = allPayouts?.filter((p) => p.status === 'paid').reduce((sum, p) => sum + Number(p.amount), 0) ?? 0
    totalCommissions = allComm?.length ?? 0
    totalClicks = clicks?.length ?? 0
  } catch {}

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#F5F5F7]">Dzień dobry, {affiliate?.name ?? 'Partner'} 👋</h1>
        <p className="text-sm text-[#9A9AA3] mt-1">Twój panel afiliacyjny</p>
      </div>

      {/* Balance cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#111114] border border-[#25252D] rounded-2xl p-5">
          <p className="text-xs text-[#555] mb-1">💰 Dostępne do wypłaty</p>
          <p className="text-2xl font-bold text-[#F5F5F7]">{totalAvailable.toLocaleString('pl-PL', { minimumFractionDigits: 2 })} zł</p>
          <p className="text-[10px] text-[#555] mt-1">Zatwierdzone prowizje</p>
        </div>
        <div className="bg-[#111114] border border-[#25252D] rounded-2xl p-5">
          <p className="text-xs text-[#555] mb-1">⏳ Oczekujące prowizje</p>
          <p className="text-2xl font-bold text-amber-400">{pendingCommission.toLocaleString('pl-PL', { minimumFractionDigits: 2 })} zł</p>
          <p className="text-[10px] text-[#555] mt-1">Do zatwierdzenia</p>
        </div>
        <div className="bg-[#111114] border border-[#25252D] rounded-2xl p-5">
          <p className="text-xs text-[#555] mb-1">💸 Wypłacone</p>
          <p className="text-2xl font-bold text-[#9277FF]">{totalPaid.toLocaleString('pl-PL', { minimumFractionDigits: 2 })} zł</p>
          <p className="text-[10px] text-[#555] mt-1">Łączna wypłacona kwota</p>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#111114] border border-[#25252D] rounded-2xl p-5">
          <p className="text-xs text-[#555] mb-1">🔗 Kliknięcia</p>
          <p className="text-2xl font-bold text-[#F5F5F7]">{totalClicks}</p>
        </div>
        <div className="bg-[#111114] border border-[#25252D] rounded-2xl p-5">
          <p className="text-xs text-[#555] mb-1">📦 Prowizje</p>
          <p className="text-2xl font-bold text-[#F5F5F7]">{totalCommissions}</p>
        </div>
      </div>

      {/* Referral link */}
      <div className="bg-[#111114] border border-[#25252D] rounded-2xl p-6">
        <h2 className="text-sm font-bold text-[#F5F5F7] mb-3">🔗 Twój link afiliacyjny</h2>
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-[#15151A] border border-[#25252D] rounded-xl px-4 py-2.5 text-sm text-[#9A9AA3] font-mono truncate">
            znajdzswojczas.pl/?ref={affiliate?.referral_code}
          </div>
          <button
            onClick={() => navigator.clipboard.writeText(`https://znajdzswojczas.pl/?ref=${affiliate?.referral_code}`)}
            className="px-4 py-2.5 bg-[#7C5CFC]/15 text-[#9277FF] rounded-xl text-sm font-medium hover:bg-[#7C5CFC]/25 transition whitespace-nowrap"
          >
            📋 Kopiuj
          </button>
        </div>
      </div>

      {/* Recent commissions */}
      <div className="bg-[#111114] border border-[#25252D] rounded-2xl p-6">
        <h2 className="text-sm font-bold text-[#F5F5F7] mb-4">Ostatnie prowizje</h2>

        {commissions && commissions.length > 0 ? (
          <div className="space-y-3">
            {commissions.map((c) => {
              const s = COMMISSION_STATUS[c.status] ?? COMMISSION_STATUS.pending
              const date = format(new Date(c.created_at), 'd.MM.yyyy', { locale: pl })
              return (
                <div key={c.id} className="flex items-center justify-between gap-4 bg-[#15151A] rounded-xl px-4 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#F5F5F7] truncate">{c.service_name ?? 'Zamówienie'}</p>
                    <p className="text-[10px] text-[#555]">{date}{c.promo_code ? ` · ${c.promo_code}` : ''}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-[#F5F5F7]">{Number(c.commission_amount).toLocaleString('pl-PL', { minimumFractionDigits: 2 })} zł</p>
                    <span className={`inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-medium border ${s.color}`}>
                      {s.label}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-[#555] text-sm">
            Brak prowizji. Udostępnij swój link lub kod, aby zacząć zarabiać.
          </div>
        )}
      </div>
    </div>
  )
}
