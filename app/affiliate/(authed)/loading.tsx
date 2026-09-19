function Card({ className = '' }: { className?: string }) {
  return <div className={`bg-white dark:bg-[#111114] border border-gray-200 dark:border-[#25252D] rounded-2xl animate-pulse ${className}`} />
}

export default function AffiliateLoading() {
  return (
    <div className="max-w-5xl mx-auto space-y-6" aria-busy="true" aria-live="polite">
      <div className="h-8 w-56 bg-gray-200 dark:bg-[#15151A] rounded-lg animate-pulse" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="h-28" />
        <Card className="h-28" />
        <Card className="h-28" />
      </div>
      <Card className="h-40" />
      <Card className="h-56" />
    </div>
  )
}
