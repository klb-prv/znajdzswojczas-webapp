import { requireAffiliateContext } from '@/lib/affiliate-auth'
import AffiliateSidebar from '@/components/AffiliateSidebar'

export default async function AffiliateAuthedLayout({ children }: { children: React.ReactNode }) {
  // Cached per request - shared with pages, no duplicate DB round-trip
  const affiliate = await requireAffiliateContext()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#09090B] flex">
      <AffiliateSidebar affiliateName={affiliate.name} affiliateLogin={affiliate.login} />
      <main className="flex-1 p-6 pt-16 lg:p-8 lg:pt-8 lg:ml-64">
        {children}
      </main>
    </div>
  )
}
