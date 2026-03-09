import { createAdminClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{ promo_code?: string; size?: string; alternative_version?: string }>
}

async function fetchDiscount(code: string) {
  const supabase = createAdminClient()
  const { data: dc } = await supabase
    .from('discount_codes')
    .select('code, discount_type, discount_value, active, expires_at, max_uses, used_count')
    .eq('code', code.toUpperCase().trim())
    .single()

  if (!dc || !dc.active) return null
  if (dc.expires_at && new Date(dc.expires_at) < new Date()) return null
  if (dc.max_uses !== null && dc.used_count >= dc.max_uses) return null

  return dc as {
    code: string
    discount_type: 'percent' | 'fixed'
    discount_value: number
  }
}

export default async function MacroBlockPage({ searchParams }: PageProps) {
  const { promo_code, size: sizeParam, alternative_version } = await searchParams
  const size = Math.min(10, Math.max(1, parseFloat(sizeParam ?? '1') || 1))
  const isAlt = alternative_version === '1'
  const bg = isAlt
    ? 'linear-gradient(135deg, #2D5AD5 0%, #1B1F2E 100%)'
    : '#141414'
  const borderColor = isAlt ? 'rgba(100,150,255,0.25)' : 'rgba(255,255,255,0.09)'

  let discountLabel = '??% ZNIŻKI'
  let codeText = 'XXXXXXXX'

  if (promo_code) {
    const dc = await fetchDiscount(promo_code)
    if (dc) {
      discountLabel =
        dc.discount_type === 'percent'
          ? `${dc.discount_value}% ZNIŻKI`
          : `${dc.discount_value} ZŁ TANIEJ`
      codeText = dc.code
    }
  }

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body { display: block; background: transparent; }

        .banner {
          position: relative;
          display: flex;
          align-items: center;
          gap: 12px;
          width: 320px;
          padding: 11px 18px 11px 14px;
          zoom: ${1 + (size - 1) * 0.5};
          background: ${bg};
          border-radius: 10px;
          border: 1px solid ${borderColor};
          overflow: hidden;
          color: #fff;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          box-shadow: 0 2px 14px rgba(0,0,0,0.55);
        }

        /* ── Icon: bounce every 6 s ── */
        .icon {
          font-size: 28px;
          flex-shrink: 0;
          line-height: 1;
          transform-origin: center bottom;
          animation: iconBounce 6s ease-in-out infinite;
        }

        @keyframes iconBounce {
          0%,  12%, 100% { transform: scale(1) rotate(0deg);    filter: drop-shadow(0 0 3px rgba(255,255,255,0.15)); }
          3%             { transform: scale(1.2) rotate(-8deg);  filter: drop-shadow(0 0 10px rgba(160,210,255,0.7)); }
          6%             { transform: scale(1.15) rotate(6deg);  filter: drop-shadow(0 0 8px rgba(160,210,255,0.5)); }
          9%             { transform: scale(1.06) rotate(-3deg); filter: drop-shadow(0 0 5px rgba(160,210,255,0.3)); }
        }

        .text { flex: 1; display: flex; flex-direction: column; gap: 3px; overflow: hidden; }

        /* ── Domain: slides + shines every 7 s ── */
        .domain {
          font-size: 13.5px;
          font-weight: 700;
          letter-spacing: 0.01em;
          color: #fff;
          white-space: nowrap;
          animation: domainSlide 7s ease-in-out infinite;
        }

        @keyframes domainSlide {
          0%,  8%, 100% { opacity: 1;   transform: translateX(0);    color: rgba(255,255,255,0.9); }
          1%            { opacity: 0;   transform: translateX(-8px); }
          4%            { opacity: 1;   transform: translateX(0);    color: #fff; text-shadow: 0 0 14px rgba(180,220,255,0.6); }
          7%            { color: rgba(255,255,255,0.9); text-shadow: none; }
        }

        /* ── Promo line: pops every 7 s (offset) ── */
        .promo {
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.025em;
          white-space: nowrap;
          color: rgba(255,255,255,0.8);
          animation: promoPop 7s ease-in-out infinite 0.4s;
        }

        @keyframes promoPop {
          0%,  8%, 100% { transform: scale(1);    color: rgba(255,255,255,0.8); }
          3%            { transform: scale(1.04); color: #fff; }
          6%            { transform: scale(1);    color: rgba(255,255,255,0.8); }
        }

        /* ── Code: neon pulse every 5 s ── */
        .code {
          display: inline-block;
          color: #fff;
          font-weight: 800;
          animation: codeNeon 5s ease-in-out infinite 1.2s;
        }

        @keyframes codeNeon {
          0%,  15%, 100% { text-shadow: 0 0 4px rgba(255,255,255,0.2); }
          5%             { text-shadow: 0 0 12px rgba(130,200,255,1), 0 0 26px rgba(130,200,255,0.5), 0 0 44px rgba(130,200,255,0.2); }
          10%            { text-shadow: 0 0 5px rgba(130,200,255,0.35); }
        }

        /* ── Shimmer sweep every 7 s ── */
        .shimmer {
          position: absolute;
          top: 0; left: -70%;
          width: 50%;
          height: 100%;
          background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.07) 50%, transparent 100%);
          transform: skewX(-14deg);
          animation: shimmer 7s ease-in-out infinite 2.5s;
          pointer-events: none;
        }

        @keyframes shimmer {
          0%,  100% { left: -70%; opacity: 0; }
          5%         { opacity: 0; }
          6%         { left: -70%; opacity: 1; }
          22%        { left: 160%; opacity: 1; }
          23%        { opacity: 0; }
        }
      `}</style>

      <div className="banner">
        <div className="icon">🖥️</div>
        <div className="text">
          <div className="domain">znajdzswojczas.pl</div>
          <div className="promo">
            <span>{discountLabel} &nbsp;–&nbsp; KOD </span>
            <span className="code">{codeText}</span>
          </div>
        </div>
        <div className="shimmer" aria-hidden="true" />
      </div>
    </>
  )
}
