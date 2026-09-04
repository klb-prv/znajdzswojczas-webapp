import { createAdminClient } from '@/lib/supabase/server'
import Link from 'next/link'
import AdminLogoutButton from '@/components/AdminLogoutButton'
import AdminPayoutsManager from '@/components/AdminPayoutsManager'

export default async function AdminPayoutsPage() {
  let mapped: Array<{ id: string; affiliate_id: string; affiliate_name: string; amount: number; status: string; rejection_reason: string | null; created_at: string; approved_at: string | null; paid_at: string | null }> = []

  try {
    const supabase = createAdminClient()

    const { data: payouts } = await supabase
      .from('affiliate_payouts')
      .select('*, affiliates(name)')
      .order('created_at', { ascending: false }) as { data: Array<{ id: string; affiliate_id: string; amount: number; status: string; rejection_reason: string | null; created_at: string; approved_at: string | null; paid_at: string | null; affiliates: { name: string } | null }> | null }

    mapped = (payouts ?? []).map((p) => ({
      id: p.id,
      affiliate_id: p.affiliate_id,
      affiliate_name: p.affiliates?.name ?? 'Nieznany',
      amount: p.amount,
      status: p.status,
      rejection_reason: p.rejection_reason,
      created_at: p.created_at,
      approved_at: p.approved_at,
      paid_at: p.paid_at,
    }))
  } catch {}

  return (
    <main className="min-h-screen bg-gray-50 py-6 sm:py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div>
            <Link href="/admin" className="text-sm text-blue-600 hover:underline">← Panel admina</Link>
            <h1 className="text-2xl font-bold text-gray-900 mt-1">Wypłaty afiliacyjne</h1>
          </div>
          <AdminLogoutButton />
        </div>

        {mapped.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center text-gray-400">
            Brak wypłat lub tabele nie zostały jeszcze utworzone.
          </div>
        ) : (
          <AdminPayoutsManager payouts={mapped} />
        )}
      </div>
    </main>
  )
}
