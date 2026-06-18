export const dynamic = 'force-static'

const BASE = 'https://znajdzswojczas.pl'

const params = [
  {
    name: 'promo_code',
    type: 'string',
    required: false,
    default: '—',
    description: 'Kod rabatowy odczytywany z bazy danych. Musi być aktywny, nie wygasły i nie wyczerpany.',
  },
  {
    name: 'size',
    type: 'number (1–10)',
    required: false,
    default: '1',
    description: 'Mnożnik rozmiaru. Skala rośnie o połowę kroku (size=2 → 1.5×, size=3 → 2×). Max 10.',
  },
  {
    name: 'alternative_version',
    type: '"1"',
    required: false,
    default: '—',
    description: 'Wersja kolorystyczna. Wartość "1" włącza gradient #2D5AD5 → #1B1F2E zamiast domyślnego czarnego.',
  },
]

const endpoints = [
  {
    id: 'mini_block',
    label: 'Mini Block',
    description: 'Poziomy baner 380px - pierwsza linia adres + druga linia rabat i kod promocyjny.',
    width: '380px',
    path: '/promo/mini_block',
    example: `${BASE}/promo/mini_block?promo_code=OLKOFF26`,
    exampleAlt: `${BASE}/promo/mini_block?promo_code=OLKOFF26&size=2&alternative_version=1`,
  },
  {
    id: 'macro_block',
    label: 'Macro Block',
    description: 'Kompaktowy baner 320px - domena na górze, rabat i kod poniżej.',
    width: '320px',
    path: '/promo/macro_block',
    example: `${BASE}/promo/macro_block?promo_code=OLKOFF26`,
    exampleAlt: `${BASE}/promo/macro_block?promo_code=OLKOFF26&size=3&alternative_version=1`,
  },
]

export default function PromoDocsPage() {
  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --bg:          #f6f8fa;
          --bg-card:     #ffffff;
          --bg-header:   #f0f2f5;
          --bg-code:     #f0f2f5;
          --bg-badge:    #eaecef;
          --border:      #d0d7de;
          --border-sub:  #e8eaed;
          --text:        #1f2328;
          --text-sub:    #57606a;
          --text-muted:  #6e7781;
          --text-code:   #0550ae;
          --text-embed:  #0550ae;
          --text-param:  #953800;
          --text-type:   #0550ae;
          --text-path:   #1f2328;
          --footer:      #9ea7b0;
          --tag-bg:      #eaecef;
          --tag-border:  #d0d7de;
          --tag-color:   #57606a;
        }
        html.dark {
          --bg:          #0d1117;
          --bg-card:     #0d1117;
          --bg-header:   #161b22;
          --bg-code:     #161b22;
          --bg-badge:    #21262d;
          --border:      #30363d;
          --border-sub:  #21262d;
          --text:        #e6edf3;
          --text-sub:    #b0bec9;
          --text-muted:  #8b949e;
          --text-code:   #79c0ff;
          --text-embed:  #a5d6ff;
          --text-param:  #ffa657;
          --text-type:   #79c0ff;
          --text-path:   #e6edf3;
          --footer:      #484f58;
          --tag-bg:      #21262d;
          --tag-border:  #30363d;
          --tag-color:   #8b949e;
        }
      `}</style>

      <main className="min-h-screen bg-[var(--bg)] text-[var(--text)] p-3 sm:p-6 sm:py-10 leading-relaxed" style={{ paddingBottom: '80px' }}>
        <div className="max-w-[860px] mx-auto">
          <h1 className="text-xl sm:text-[26px] font-bold mb-1.5 text-[var(--text)] ml-2 mt-4">🖥️ API - Promo Widget</h1>
          <p className="text-sm text-[var(--text-sub)] mb-12 ml-2">
            Animowane banery reklamowe do osadzania na stronach zewnętrznych, promujące usługi IT znajdzswojczas.pl
          </p>

          {/* ── Endpoints ── */}
          <h2 className="text-lg font-semibold mt-10 mb-3 text-[var(--text)]">Endpointy</h2>
          {endpoints.map((ep) => (
            <div key={ep.id} className="border border-[var(--border)] rounded-xl overflow-hidden mb-7 bg-[var(--bg-card)]">
              <div className="flex items-center gap-2 sm:gap-3 p-3 sm:px-5 sm:py-3.5 bg-[var(--bg-header)] border-b border-[var(--border)] flex-wrap">
                <span className="text-[11px] font-bold tracking-wider text-[#1a7f37] dark:text-[#3fb950] bg-[rgba(26,127,55,0.1)] dark:bg-[rgba(63,185,80,0.1)] border border-[rgba(26,127,55,0.3)] dark:border-[rgba(63,185,80,0.3)] rounded px-2 py-0.5">GET</span>
                <span className="font-mono text-[13px] text-[var(--text-path)] font-semibold">{ep.path}</span>
                <span className="sm:ml-auto text-[11px] text-[var(--text-muted)] bg-[var(--bg-badge)] border border-[var(--border)] rounded px-2 py-0.5">width: {ep.width}</span>
                <a
                  href={ep.example}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-[#0550ae] dark:text-[#79c0ff] bg-[rgba(5,80,174,0.08)] dark:bg-[rgba(121,192,255,0.08)] border border-[rgba(5,80,174,0.25)] dark:border-[rgba(121,192,255,0.25)] rounded-md px-2.5 py-0.5 no-underline whitespace-nowrap hover:bg-[rgba(5,80,174,0.15)] dark:hover:bg-[rgba(121,192,255,0.16)] hover:border-[rgba(5,80,174,0.4)] dark:hover:border-[rgba(121,192,255,0.45)] transition sm:ml-auto"
                >
                  ▶ Try it
                </a>
              </div>
              <div className="p-3.5 sm:px-5 sm:py-4.5">
                <p className="text-[13.5px] text-[var(--text-sub)] mb-[18px]">{ep.description}</p>
                <p className="text-[11px] text-[var(--text-muted)] mb-1">Przykład – wersja domyślna</p>
                <div className="bg-[var(--bg-code)] border border-[var(--border)] rounded-lg p-3.5 sm:px-[18px] sm:py-[14px] mb-2.5 overflow-x-auto">
                  <code className="font-mono text-[12.5px] text-[var(--text-code)] whitespace-pre">{ep.example}</code>
                </div>
                <p className="text-[11px] text-[var(--text-muted)] mb-1">Przykład – wersja alternatywna (niebieski gradient, size=2)</p>
                <div className="bg-[var(--bg-code)] border border-[var(--border)] rounded-lg p-3.5 sm:px-[18px] sm:py-[14px] mb-2.5 overflow-x-auto">
                  <code className="font-mono text-[12.5px] text-[var(--text-code)] whitespace-pre">{ep.exampleAlt}</code>
                </div>
              </div>
            </div>
          ))}

          {/* ── Parameters ── */}
          <h2 className="text-lg font-semibold mt-10 mb-3 text-[var(--text)]">Parametry URL</h2>
          <div className="border border-[var(--border)] rounded-xl overflow-hidden mb-7 bg-[var(--bg-card)]">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-[13px]">
                <thead>
                  <tr className="text-left px-3.5 py-2 border-b border-[var(--border)] text-[var(--text-muted)] font-semibold text-[12px] bg-[var(--bg-header)]">
                    <th className="px-3.5 py-2 border-b border-[var(--border)] text-[var(--text-muted)] font-semibold text-[12px] bg-[var(--bg-header)]">Parametr</th>
                    <th className="px-3.5 py-2 border-b border-[var(--border)] text-[var(--text-muted)] font-semibold text-[12px] bg-[var(--bg-header)]">Typ</th>
                    <th className="px-3.5 py-2 border-b border-[var(--border)] text-[var(--text-muted)] font-semibold text-[12px] bg-[var(--bg-header)]">Domyślnie</th>
                    <th className="px-3.5 py-2 border-b border-[var(--border)] text-[var(--text-muted)] font-semibold text-[12px] bg-[var(--bg-header)]">Opis</th>
                  </tr>
                </thead>
                <tbody>
                  {params.map((p) => (
                    <tr key={p.name}>
                      <td className="px-3.5 py-2.5 border-b border-[var(--border-sub)] align-top text-[var(--text)]">
                        <span className="font-mono text-[var(--text-param)] text-[12.5px]">{p.name}</span>
                        <span className="inline-block text-[10px] font-semibold tracking-wider text-[var(--tag-color)] bg-[var(--tag-bg)] border border-[var(--tag-border)] rounded-sm px-1 py-px ml-1.5 align-middle">optional</span>
                      </td>
                      <td className="px-3.5 py-2.5 border-b border-[var(--border-sub)] align-top text-[var(--text)]"><span className="font-mono text-[var(--text-type)] text-[12px]">{p.type}</span></td>
                      <td className="px-3.5 py-2.5 border-b border-[var(--border-sub)] align-top text-[var(--text)]"><span className="font-mono text-[var(--text-muted)] text-[12px]">{p.default}</span></td>
                      <td className="px-3.5 py-2.5 border-b border-[var(--border-sub)] align-top text-[var(--text)]">{p.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Embed ── */}
          <h2 className="text-lg font-semibold mt-10 mb-3 text-[var(--text)]">Osadzanie (iframe)</h2>
          <p className="text-[13.5px] text-[var(--text-sub)] mb-2.5">
            Banery są zaprojektowane do osadzania jako <code className="font-mono text-[var(--text-embed)]">{'<iframe>'}</code> na stronach zewnętrznych.
          </p>
          <h3 className="text-[13px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mt-7 mb-2">Mini Block</h3>
          <div className="bg-[var(--bg-code)] border border-[var(--border)] rounded-lg p-3.5 sm:px-[18px] sm:py-[14px] mt-2.5 overflow-x-auto">
            <code className="font-mono text-[12px] text-[var(--text-embed)] whitespace-pre-wrap break-all">{`<iframe
  src="${BASE}/promo/mini_block?promo_code=OLKOFF26"
  width="380" height="48"
  frameborder="0" scrolling="no"
  style="border:none; overflow:hidden;"
></iframe>`}</code>
          </div>
          <h3 className="text-[13px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mt-7 mb-2">Macro Block</h3>
          <div className="bg-[var(--bg-code)] border border-[var(--border)] rounded-lg p-3.5 sm:px-[18px] sm:py-[14px] mt-2.5 overflow-x-auto">
            <code className="font-mono text-[12px] text-[var(--text-embed)] whitespace-pre-wrap break-all">{`<iframe
  src="${BASE}/promo/macro_block?promo_code=OLKOFF26"
  width="320" height="48"
  frameborder="0" scrolling="no"
  style="border:none; overflow:hidden;"
></iframe>`}</code>
          </div>

          {/* ── Walidacja ── */}
          <h2 className="text-lg font-semibold mt-10 mb-3 text-[var(--text)]">Walidacja kodu</h2>
          <div className="border border-[var(--border)] rounded-xl overflow-hidden mb-7 bg-[var(--bg-card)]">
            <div className="p-3.5 sm:px-5 sm:py-4.5">
              <p className="text-[13.5px] text-[var(--text-sub)] mb-3.5">
                Baner automatycznie weryfikuje kod przy każdym żądaniu. Jeśli kod nie przejdzie walidacji, wyświetlany jest placeholder <code className="font-mono text-[var(--text-param)]">??% ZNIŻKI / XXXXXXXX</code>.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-[13px]">
                  <thead>
                    <tr>
                      <th className="text-left px-3.5 py-2 border-b border-[var(--border)] text-[var(--text-muted)] font-semibold text-[12px] bg-[var(--bg-header)]">Warunek</th>
                      <th className="text-left px-3.5 py-2 border-b border-[var(--border)] text-[var(--text-muted)] font-semibold text-[12px] bg-[var(--bg-header)]">Zachowanie</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td className="px-3.5 py-2.5 border-b border-[var(--border-sub)] align-top text-[var(--text)]">Kod nieprawidłowy</td><td className="px-3.5 py-2.5 border-b border-[var(--border-sub)] align-top text-[var(--text)]">Placeholder</td></tr>
                    <tr><td className="px-3.5 py-2.5 border-b border-[var(--border-sub)] align-top text-[var(--text)]"><span className="font-mono text-[var(--text-param)] text-[12.5px]">active = false</span></td><td className="px-3.5 py-2.5 border-b border-[var(--border-sub)] align-top text-[var(--text)]">Placeholder</td></tr>
                    <tr><td className="px-3.5 py-2.5 border-b border-[var(--border-sub)] align-top text-[var(--text)]"><span className="font-mono text-[var(--text-param)] text-[12.5px]">expires_at</span> w przeszłości</td><td className="px-3.5 py-2.5 border-b border-[var(--border-sub)] align-top text-[var(--text)]">Placeholder</td></tr>
                    <tr><td className="px-3.5 py-2.5 border-b border-[var(--border-sub)] align-top text-[var(--text)]"><span className="font-mono text-[var(--text-param)] text-[12.5px]">used_count &gt;= max_uses</span></td><td className="px-3.5 py-2.5 border-b border-[var(--border-sub)] align-top text-[var(--text)]">Placeholder</td></tr>
                    <tr><td className="px-3.5 py-2.5 border-b border-[var(--border-sub)] align-top text-[var(--text)]">Kod prawidłowy</td><td className="px-3.5 py-2.5 border-b border-[var(--border-sub)] align-top text-[var(--text)]">Wyświetla wartość z DB (<span className="font-mono text-[var(--text-type)] text-[12px]">percent</span> lub <span className="font-mono text-[var(--text-type)] text-[12px]">fixed</span>)</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <hr className="border-none border-t border-[var(--border-sub)] mt-12" />
          <p className="mt-5 text-[12px] text-[var(--footer)]">znajdzswojczas.pl · Promo Widget API</p>
        </div>
      </main>
    </>
  )
}
