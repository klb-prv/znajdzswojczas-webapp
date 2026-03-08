import { createAdminClient } from '@/lib/supabase/server'
import AdminDiscountCodesManager from '@/components/AdminDiscountCodesManager'
import Link from 'next/link'
import type { DiscountCode } from '@/lib/types'

export default async function AdminDiscountCodesPage() {
  const supabase = createAdminClient()
  const { data: codes } = await supabase
    .from('discount_codes')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Kody zniżkowe</h1>
          <Link href="/admin" className="text-sm text-blue-600 hover:underline">
            ← Panel admina
          </Link>
        </div>
        <AdminDiscountCodesManager initialCodes={(codes ?? []) as DiscountCode[]} />
      </div>
    </main>
  )
}
