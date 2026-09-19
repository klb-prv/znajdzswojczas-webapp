import { createAdminClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import AdminLogoutButton from '@/components/AdminLogoutButton'
import AdminPayoutsManager from '@/components/AdminPayoutsManager'

export default async function AdminAffiliatePayoutsPage({ params }: { params: Promise<{ affiliateId: string }> }) {
  const { affiliateId } = await params

  let affiliateName = ''
  let mapped: Array<{ id: string; affiliate_id: string; affiliate_name: string; amount: number; status: string; rejection_reason: string | null; created_at: string; approved_at: string | null; paid_at: string | null }> = []

  try {
    const supabase = createAdminClient()

    const [{ data: affiliate }, { data: payouts }] = await Promise.all([
      supabase
        .from('affiliates')
        .select('id, name')
        .eq('id', affiliateId)
        .maybeSingle(),
      supabase
        .from('affiliate_payouts')
        .select('*, affiliates(name)')
        .eq('affiliate_id', affiliateId)
        .order('created_at', { ascending: false }) as { data: Array<{ id: string; affiliate_id: string; amount: number; status: string; rejection_reason: string | null; created_at: string; approved_at: string | null; paid_at: string | null; affiliates: { name: string } | null }> | null },
    ])

    if (!affiliate) notFound()
    affiliateName = affiliate.name

    mapped = (payouts ?? []).map((p) => ({
      id: p.id,
      affiliate_id: p.affiliate_id,
      affiliate_name: p.affiliates?.name ?? affiliateName,
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
            <Link href={`/admin/affiliates/${affiliateId}`} className="text-sm text-blue-600 hover:underline">← {affiliateName || 'Partner'}</Link>
            <h1 className="text-2xl font-bold text-gray-900 mt-1">Wypłaty — {affiliateName}</h1>
          </div>
          <AdminLogoutButton />
        </div>

        {mapped.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center text-gray-400">
            Brak wypłat dla tego partnera.
          </div>
        ) : (
          <AdminPayoutsManager payouts={mapped} />
        )}
      </div>
    </main>
  )
}
