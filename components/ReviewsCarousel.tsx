'use client'

import { useRef, useState, useEffect } from 'react'

export interface Review {
  id: number
  nickname: string
  avatarUrl?: string
  avatar_url?: string
  rating: number
  description: string
  verified?: boolean
  channel_link?: string
  published_at?: string  // yyyy-MM-dd
}

interface Props {
  reviews: Review[]
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg
          key={s}
          className={`w-5 h-5 ${s <= rating ? 'text-amber-400' : 'text-gray-200'}`}
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.286 3.957c.3.921-.755 1.688-1.54 1.118L10 14.347l-3.37 2.448c-.784.57-1.838-.197-1.539-1.118l1.286-3.957a1 1 0 00-.364-1.118L2.643 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69L9.05 2.927z" />
        </svg>
      ))}
    </div>
  )
}

function ReviewCard({ review }: { review: Review }) {
  const initials = review.nickname
    .split(' ')
    .map((w) => w[0]?.toUpperCase() ?? '')
    .slice(0, 2)
    .join('')

  return (
    <div className="relative flex-shrink-0 w-[304px] bg-gray-100 dark:bg-[#0d1526] rounded-2xl shadow-sm border border-gray-200/60 dark:border-[#1a2235] p-4 flex flex-col items-center gap-2 select-none">
      {/* Media creator badge + date */}
      {review.channel_link && (
        <div className="absolute top-2 right-2 flex flex-col items-center gap-1">
          <span className="bg-gradient-to-r from-rose-500 to-pink-600 text-white text-[10px] font-extrabold px-2.5 py-1.5 rounded-xl leading-tight tracking-widest uppercase shadow shadow-rose-500/30 text-center">
            Media<br />creator
          </span>
          {review.published_at && (
            <span className="text-[9px] text-gray-400 dark:text-gray-500">
              {review.published_at}
            </span>
          )}
        </div>
      )}

      {/* Avatar */}
      <div className="w-20 h-20 rounded-full overflow-hidden ring-2 ring-white dark:ring-[#1a2235] shadow -mt-10 bg-white dark:bg-[#0a0f1e] flex items-center justify-center">
        {(review.avatarUrl ?? review.avatar_url) ? (
          <img
            src={(review.avatarUrl ?? review.avatar_url)!}
            alt={review.nickname}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-2xl font-bold text-blue-600 dark:text-blue-400 select-none">
            {initials}
          </span>
        )}
      </div>

      {/* Nickname */}
      {review.channel_link ? (
        <a
          href={review.channel_link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-bold text-blue-600 dark:text-blue-400 tracking-wide uppercase text-center leading-tight hover:underline underline-offset-2 transition-colors"
        >
          {review.nickname}
        </a>
      ) : (
        <p className="text-sm font-bold text-gray-800 dark:text-gray-100 tracking-wide uppercase text-center leading-tight">
          {review.nickname}
        </p>
      )}

      {/* Stars */}
      <div className="bg-white dark:bg-[#0a0f1e] rounded-full px-3 py-1 shadow-sm">
        <Stars rating={review.rating} />
      </div>

      {/* Description */}
      <p className="text-xs text-gray-900 dark:text-gray-400 text-center leading-relaxed line-clamp-3">
        {review.description}
      </p>

      {/* Verified badge */}
      {review.verified && (
        <p className="text-[10px] font-semibold text-green-600 dark:text-green-400 mt-auto flex items-center gap-1">
          <svg className="w-3 h-3 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Opinia potwierdzona zamówieniem
        </p>
      )}
    </div>
  )
}

export default function ReviewsCarousel({ reviews }: Props) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [canLeft, setCanLeft] = useState(false)
  const [canRight, setCanRight] = useState(true)

  const CARD_WIDTH = 320 // px including gap

  function updateArrows() {
    const el = trackRef.current
    if (!el) return
    setCanLeft(el.scrollLeft > 4)
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4)
  }

  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    updateArrows()
    el.addEventListener('scroll', updateArrows, { passive: true })
    return () => el.removeEventListener('scroll', updateArrows)
  }, [])

  function scroll(dir: 'left' | 'right') {
    const el = trackRef.current
    if (!el) return
    el.scrollBy({ left: dir === 'left' ? -CARD_WIDTH : CARD_WIDTH, behavior: 'smooth' })
  }

  if (!reviews.length) return null

  return (
    <div className="relative mt-5 mb-1">
      {/* Arrow – left */}
      <button
        onClick={() => scroll('left')}
        disabled={!canLeft}
        aria-label="Poprzednia opinia"
        className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 -translate-x-1 w-7 h-7 rounded-full bg-white dark:bg-[#0a0f1e] border border-gray-200 dark:border-[#1a2235] shadow flex items-center justify-center transition-opacity ${canLeft ? 'opacity-100 hover:bg-gray-50 dark:hover:bg-[#0d1526]' : 'hidden'}`}
      >
        <svg className="w-3.5 h-3.5 text-gray-600 dark:text-gray-300" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      </button>

      {/* Scrollable track */}
      <div
        ref={trackRef}
        className={`flex gap-3 overflow-x-auto scroll-smooth px-4 pt-8 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${reviews.length === 1 ? 'justify-center' : ''}`}
      >
        {reviews.map((r) => (
          <ReviewCard key={r.id} review={r} />
        ))}
      </div>

      {/* Arrow – right */}
      <button
        onClick={() => scroll('right')}
        disabled={!canRight}
        aria-label="Następna opinia"
        className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 translate-x-1 w-7 h-7 rounded-full bg-white dark:bg-[#0a0f1e] border border-gray-200 dark:border-[#1a2235] shadow flex items-center justify-center transition-opacity ${canRight ? 'opacity-100 hover:bg-gray-50 dark:hover:bg-[#0d1526]' : 'hidden'}`}
      >
        <svg className="w-3.5 h-3.5 text-gray-600 dark:text-gray-300" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  )
}
