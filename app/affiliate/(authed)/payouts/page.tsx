import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/server'
import { verifyAffiliateSession, AFFILIATE_SESSION_COOKIE } from '@/lib/affiliate-session'
import { format } from 'date-fns'
import { pl } from 'date-fns/locale'
import AffiliatePayoutButton from '@/components/AffiliatePayoutButton'

const PAYOUT_STATUS: Record<string, { label: string; color: string }> = {
  pending:  { label: 'Oczekuje',   color: 'bg-amber-900/30 text-amber-400 border-amber-800/50' },
  approved: { label: 'Zaakceptowana', color: 'bg-emerald-900/30 text-emerald-400 border-emerald-800/50' },
  paid:     { label: 'Wypłacona',  color: 'bg-[#7C5CFC]/15 text-[#9277FF] border-[#7C5CFC]/30' },
  rejected: { label: 'Odrzucona',  color: 'bg-red-900/30 text-red-400 border-red-800/50' },
}

export default async function AffiliatePayoutsPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get(AFFILIATE_SESSION_COOKIE)?.value
  if (!token) redirect('/affiliate/login')

  const affiliateId = await verifyAffiliateSession(token)
  if (!affiliateId) redirect('/affiliate/login')

  const supabase = createAdminClient()

  const { data: commissions } = await supabase
    .from('affiliate_commissions')
    .select('commission_amount, status')
    .eq('affiliate_id', affiliateId) as { data: { commission_amount: number; status: string }[] | null }

  const { data: payouts } = await supabase
    .from('affiliate_payouts')
    .select('*')
    .eq('affiliate_id', affiliateId)
    .order('created_at', { ascending: false }) as { data: { id: string; amount: number; status: string; rejection_reason: string | null; created_at: string }[] | null }

  const totalAvailable = commissions
    ?.filter((c) => c.status === 'available')
    .reduce((sum, c) => sum + Number(c.commission_amount), 0) ?? 0

  const totalPaid = payouts
    ?.filter((p) => p.status === 'paid')
    .reduce((sum, p) => sum + Number(p.amount), 0) ?? 0

  const pendingPayouts = payouts
    ?.filter((p) => p.status === 'pending' || p.status === 'approved')
    .reduce((sum, p) => sum + Number(p.amount), 0) ?? 0

  const reserved = pendingPayouts
  const available = Math.max(0, totalAvailable - reserved)

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold text-[#F5F5F7]">💸 Wypłaty</h1>

      {/* Balance */}
      <div className="bg-[#111114] border border-[#25252D] rounded-2xl p-8 text-center">
        <p className="text-xs text-[#555] mb-2">Dostępne do wypłaty</p>
        <p className="text-4xl font-bold text-[#F5F5F7]">
          {available.toLocaleString('pl-PL', { minimumFractionDigits: 2 })} zł
        </p>
        <p className="text-[10px] text-[#555] mt-2">Minimalna kwota wypłaty: 10 zł</p>

        <div className="mt-6">
          <AffiliatePayoutButton available={available} />
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#111114] border border-[#25252D] rounded-2xl p-5">
          <p className="text-xs text-[#555] mb-1">⏳ Zarezerwowane</p>
          <p className="text-xl font-bold text-amber-400">{reserved.toLocaleString('pl-PL', { minimumFractionDigits: 2 })} zł</p>
        </div>
        <div className="bg-[#111114] border border-[#25252D] rounded-2xl p-5">
          <p className="text-xs text-[#555] mb-1">💸 Wypłacone</p>
          <p className="text-xl font-bold text-[#9277FF]">{totalPaid.toLocaleString('pl-PL', { minimumFractionDigits: 2 })} zł</p>
        </div>
      </div>

      {/* Payout history */}
      <div className="bg-[#111114] border border-[#25252D] rounded-2xl p-6">
        <h2 className="text-sm font-bold text-[#F5F5F7] mb-4">Historia wypłat</h2>

        {payouts && payouts.length > 0 ? (
          <div className="space-y-3">
            {payouts.map((p) => {
              const s = PAYOUT_STATUS[p.status] ?? PAYOUT_STATUS.pending
              const date = format(new Date(p.created_at), 'd.MM.yyyy', { locale: pl })
              return (
                <div key={p.id} className="flex items-center justify-between gap-4 bg-[#15151A] rounded-xl px-4 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#F5F5F7]">{date}</p>
                    {p.rejection_reason && (
                      <p className="text-[10px] text-red-400 mt-0.5 truncate">Powód: {p.rejection_reason}</p>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-[#F5F5F7]">{Number(p.amount).toLocaleString('pl-PL', { minimumFractionDigits: 2 })} zł</p>
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
            Brak wypłat
          </div>
        )}
      </div>
    </div>
  )
}
