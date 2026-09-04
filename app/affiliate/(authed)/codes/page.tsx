import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/server'
import { verifyAffiliateSession, AFFILIATE_SESSION_COOKIE } from '@/lib/affiliate-session'

const STATUS: Record<string, { label: string; color: string }> = {
  active:   { label: 'Aktywny',   color: 'bg-emerald-900/30 text-emerald-400 border-emerald-800/50' },
  inactive: { label: 'Nieaktywny', color: 'bg-gray-900/30 text-gray-400 border-gray-700/50' },
  archived: { label: 'Archiwalny', color: 'bg-red-900/30 text-red-400 border-red-800/50' },
}

export default async function AffiliateCodesPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get(AFFILIATE_SESSION_COOKIE)?.value
  if (!token) redirect('/affiliate/login')

  const affiliateId = await verifyAffiliateSession(token)
  if (!affiliateId) redirect('/affiliate/login')

  const supabase = createAdminClient()

  let codes: { id: string; code: string; client_discount_rate: number; affiliate_commission_rate: number; status: string; usage_count: number; created_at: string }[] = []
  let discountAssignments: { id: string; code: string; discount_type: string; discount_value: number; affiliate_commission_rate: number; used_count: number }[] = []

  try {
    const { data } = await supabase
      .from('affiliate_promo_codes')
      .select('*')
      .eq('affiliate_id', affiliateId)
      .order('created_at', { ascending: false }) as { data: { id: string; code: string; client_discount_rate: number; affiliate_commission_rate: number; status: string; usage_count: number; created_at: string }[] | null }
    codes = data ?? []

    const { data: dcData } = await supabase
      .from('affiliate_discount_code_assignments')
      .select('id, affiliate_commission_rate, discount_codes(id, code, discount_type, discount_value, used_count)')
      .eq('affiliate_id', affiliateId)
      .order('created_at', { ascending: false })

    discountAssignments = (dcData ?? []).map((row: Record<string, unknown>) => {
      const dc = row.discount_codes as Record<string, unknown> | null
      return {
        id: row.id as string,
        code: (dc?.code as string) ?? '',
        discount_type: (dc?.discount_type as string) ?? '',
        discount_value: (dc?.discount_value as number) ?? 0,
        affiliate_commission_rate: row.affiliate_commission_rate as number,
        used_count: (dc?.used_count as number) ?? 0,
      }
    })
  } catch {}

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-[#F5F5F7]">🎟️ Moje kody promocyjne</h1>

      <div className="bg-[#111114] border border-[#25252D] rounded-2xl p-6">
        <p className="text-sm text-[#9A9AA3] mb-4">
          Udostępniaj te kody klientom. Każdy użyty kod generuje prowizję przypisaną do Twojego konta.
        </p>

        {codes && codes.length > 0 ? (
          <div className="space-y-3">
            {codes.map((c) => {
              const s = STATUS[c.status] ?? STATUS.inactive
              return (
                <div key={c.id} className="bg-[#15151A] border border-[#25252D] rounded-xl p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-[#F5F5F7] text-lg">{c.code}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${s.color}`}>
                          {s.label}
                        </span>
                      </div>
                      <div className="flex gap-4 mt-2 text-xs text-[#555]">
                        <span>Zniżka klienta: <strong className="text-[#9A9AA3]">{c.client_discount_rate}%</strong></span>
                        <span>Prowizja: <strong className="text-[#9A9AA3]">{c.affiliate_commission_rate}%</strong></span>
                        <span>Użycia: <strong className="text-[#9A9AA3]">{c.usage_count}</strong></span>
                      </div>
                    </div>
                    <button
                      onClick={() => navigator.clipboard.writeText(c.code)}
                      className="px-3 py-1.5 bg-[#7C5CFC]/15 text-[#9277FF] rounded-lg text-xs font-medium hover:bg-[#7C5CFC]/25 transition flex-shrink-0"
                    >
                      📋 Kopiuj
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-[#555] text-sm">
            Nie masz jeszcze przypisanych kodów promocyjnych. Skontaktuj się z administratorem.
          </div>
        )}
      </div>

      <div className="bg-[#111114] border border-[#25252D] rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-[#F5F5F7] mb-2">🎟️ Przypisane kody rabatowe</h2>
        <p className="text-sm text-[#9A9AA3] mb-4">
          Kody te zostały przypisane przez administratora.
        </p>

        {discountAssignments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#25252D]">
                  {['Kod', 'Zniżka', 'Twoja prowizja', 'Użycia', 'Akcje'].map((h) => (
                    <th key={h} className="text-left px-3 py-2 text-[#555] font-medium text-xs">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {discountAssignments.map((a) => {
                  const discLabel = a.discount_type === 'percent' ? `${a.discount_value}%` : `${a.discount_value} zł`
                  return (
                    <tr key={a.id} className="border-b border-[#25252D]/50">
                      <td className="px-3 py-2.5 font-mono font-medium text-[#F5F5F7]">{a.code}</td>
                      <td className="px-3 py-2.5 text-[#9A9AA3]">{discLabel}</td>
                      <td className="px-3 py-2.5 text-[#9A9AA3]">{a.affiliate_commission_rate}%</td>
                      <td className="px-3 py-2.5 text-[#555]">{a.used_count}</td>
                      <td className="px-3 py-2.5">
                        <button
                          onClick={() => navigator.clipboard.writeText(a.code)}
                          className="px-3 py-1.5 bg-[#7C5CFC]/15 text-[#9277FF] rounded-lg text-xs font-medium hover:bg-[#7C5CFC]/25 transition"
                        >
                          📋 Kopiuj
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-[#555] text-sm">
            Nie masz jeszcze przypisanych kodów rabatowych.
          </div>
        )}
      </div>
    </div>
  )
}
