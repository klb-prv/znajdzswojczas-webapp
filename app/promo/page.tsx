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

        /* ── CSS variables: light mode ── */
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

        /* ── CSS variables: dark mode (html.dark) ── */
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
          --border-sub:  #21262d;
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

        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: var(--bg);
          color: var(--text);
          padding: 40px 24px 80px;
          line-height: 1.6;
        }
        .wrap { max-width: 860px; margin: 0 auto; }

        h1 { font-size: 26px; font-weight: 700; margin-bottom: 6px; color: var(--text); }
        .subtitle { color: var(--text-sub); font-size: 14px; margin-bottom: 48px; }

        h2 { font-size: 18px; font-weight: 600; margin: 40px 0 12px; color: var(--text); }
        h3 { font-size: 13px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.08em; margin: 28px 0 8px; }

        /* Endpoint cards */
        .card {
          border: 1px solid var(--border);
          border-radius: 10px;
          overflow: hidden;
          margin-bottom: 28px;
          background: var(--bg-card);
        }
        .card-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 20px;
          background: var(--bg-header);
          border-bottom: 1px solid var(--border);
        }
        .method {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.06em;
          color: #1a7f37;
          background: rgba(26,127,55,0.1);
          border: 1px solid rgba(26,127,55,0.3);
          border-radius: 4px;
          padding: 2px 8px;
        }
        html.dark .method {
          color: #3fb950;
          background: rgba(63,185,80,0.1);
          border-color: rgba(63,185,80,0.3);
        }
        .path {
          font-family: 'SFMono-Regular', Consolas, monospace;
          font-size: 13px;
          color: var(--text-path);
          font-weight: 600;
        }
        .badge-size {
          margin-left: auto;
          font-size: 11px;
          color: var(--text-muted);
          background: var(--bg-badge);
          border: 1px solid var(--border);
          border-radius: 4px;
          padding: 2px 8px;
        }
        .card-body { padding: 18px 20px; }
        .card-desc { font-size: 13.5px; color: var(--text-sub); margin-bottom: 18px; }

        /* Code blocks */
        .code-block {
          background: var(--bg-code);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 14px 18px;
          margin-bottom: 10px;
          overflow-x: auto;
        }
        .code-block code {
          font-family: 'SFMono-Regular', Consolas, monospace;
          font-size: 12.5px;
          color: var(--text-code);
          white-space: pre;
        }
        .code-label {
          font-size: 11px;
          color: var(--text-muted);
          margin-bottom: 5px;
        }

        /* Params table */
        table { width: 100%; border-collapse: collapse; font-size: 13px; }
        th {
          text-align: left;
          padding: 8px 14px;
          border-bottom: 1px solid var(--border);
          color: var(--text-muted);
          font-weight: 600;
          font-size: 12px;
          background: var(--bg-header);
        }
        td {
          padding: 10px 14px;
          border-bottom: 1px solid var(--border-sub);
          vertical-align: top;
          color: var(--text);
        }
        tr:last-child td { border-bottom: none; }
        .param-name {
          font-family: 'SFMono-Regular', Consolas, monospace;
          color: var(--text-param);
          font-size: 12.5px;
        }
        .param-type {
          font-family: 'SFMono-Regular', Consolas, monospace;
          color: var(--text-type);
          font-size: 12px;
        }
        .param-default {
          font-family: 'SFMono-Regular', Consolas, monospace;
          color: var(--text-muted);
          font-size: 12px;
        }
        .tag-optional {
          display: inline-block;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.05em;
          color: var(--tag-color);
          background: var(--tag-bg);
          border: 1px solid var(--tag-border);
          border-radius: 3px;
          padding: 1px 5px;
          margin-left: 6px;
          vertical-align: middle;
        }

        /* Embed section */
        .embed-block {
          background: var(--bg-code);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 14px 18px;
          margin-top: 10px;
        }
        .embed-block code {
          font-family: 'SFMono-Regular', Consolas, monospace;
          font-size: 12px;
          color: var(--text-embed);
          white-space: pre-wrap;
          word-break: break-all;
        }

        .prose { font-size: 13.5px; color: var(--text-sub); margin-bottom: 10px; }
        .prose code { font-family: monospace; color: var(--text-embed); }
        .validation-note { font-size: 13.5px; color: var(--text-sub); margin-bottom: 14px; }
        .validation-note code { font-family: monospace; color: var(--text-param); }

        hr { border: none; border-top: 1px solid var(--border-sub); margin: 48px 0 0; }
        .footer { margin-top: 20px; font-size: 12px; color: var(--footer); }

        /* Try it button */
        .try-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          margin-left: auto;
          font-size: 11.5px;
          font-weight: 600;
          color: #0550ae;
          background: rgba(5,80,174,0.08);
          border: 1px solid rgba(5,80,174,0.25);
          border-radius: 6px;
          padding: 3px 10px;
          text-decoration: none;
          white-space: nowrap;
          transition: background 0.15s, border-color 0.15s;
        }
        .try-btn:hover {
          background: rgba(5,80,174,0.15);
          border-color: rgba(5,80,174,0.4);
        }
        html.dark .try-btn {
          color: #79c0ff;
          background: rgba(121,192,255,0.08);
          border-color: rgba(121,192,255,0.25);
        }
        html.dark .try-btn:hover {
          background: rgba(121,192,255,0.16);
          border-color: rgba(121,192,255,0.45);
        }
      `}</style>

      <div className="wrap">
        <h1>🖥️ API - Promo Widget</h1>
        <p className="subtitle">
          Animowane banery reklamowe do osadzania na stronach zewnętrznych, promujące usługi IT znajdzswojczas.pl
        </p>

        {/* ── Endpoints ── */}
        <h2>Endpointy</h2>
        {endpoints.map((ep) => (
          <div key={ep.id} className="card">
            <div className="card-header">
              <span className="method">GET</span>
              <span className="path">{ep.path}</span>
              <span className="badge-size">width: {ep.width}</span>
              <a
                href={ep.example}
                target="_blank"
                rel="noopener noreferrer"
                className="try-btn"
              >
                ▶ Try it
              </a>
            </div>
            <div className="card-body">
              <p className="card-desc">{ep.description}</p>
              <p className="code-label">Przykład – wersja domyślna</p>
              <div className="code-block"><code>{ep.example}</code></div>
              <p className="code-label">Przykład – wersja alternatywna (niebieski gradient, size=2)</p>
              <div className="code-block"><code>{ep.exampleAlt}</code></div>
            </div>
          </div>
        ))}

        {/* ── Parameters ── */}
        <h2>Parametry URL</h2>
        <div className="card">
          <table>
            <thead>
              <tr>
                <th>Parametr</th>
                <th>Typ</th>
                <th>Domyślnie</th>
                <th>Opis</th>
              </tr>
            </thead>
            <tbody>
              {params.map((p) => (
                <tr key={p.name}>
                  <td>
                    <span className="param-name">{p.name}</span>
                    <span className="tag-optional">optional</span>
                  </td>
                  <td><span className="param-type">{p.type}</span></td>
                  <td><span className="param-default">{p.default}</span></td>
                  <td>{p.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Embed ── */}
        <h2>Osadzanie (iframe)</h2>
        <p className="prose">
          Banery są zaprojektowane do osadzania jako <code>&lt;iframe&gt;</code> na stronach zewnętrznych.
        </p>
        <h3>Mini Block</h3>
        <div className="embed-block">
          <code>{`<iframe
  src="${BASE}/promo/mini_block?promo_code=OLKOFF26"
  width="380" height="48"
  frameborder="0" scrolling="no"
  style="border:none; overflow:hidden;"
></iframe>`}</code>
        </div>
        <h3>Macro Block</h3>
        <div className="embed-block">
          <code>{`<iframe
  src="${BASE}/promo/macro_block?promo_code=OLKOFF26"
  width="320" height="48"
  frameborder="0" scrolling="no"
  style="border:none; overflow:hidden;"
></iframe>`}</code>
        </div>

        {/* ── Walidacja ── */}
        <h2>Walidacja kodu</h2>
        <div className="card">
          <div className="card-body">
            <p className="validation-note">
              Baner automatycznie weryfikuje kod przy każdym żądaniu. Jeśli kod nie przejdzie walidacji, wyświetlany jest placeholder <code>??% ZNIŻKI / XXXXXXXX</code>.
            </p>
            <table>
              <thead>
                <tr>
                  <th>Warunek</th>
                  <th>Zachowanie</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Kod nieprawidłowy</td><td>Placeholder</td></tr>
                <tr><td><span className="param-name">active = false</span></td><td>Placeholder</td></tr>
                <tr><td><span className="param-name">expires_at</span> w przeszłości</td><td>Placeholder</td></tr>
                <tr><td><span className="param-name">used_count &gt;= max_uses</span></td><td>Placeholder</td></tr>
                <tr><td>Kod prawidłowy</td><td>Wyświetla wartość z DB (<span className="param-type">percent</span> lub <span className="param-type">fixed</span>)</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <hr />
        <p className="footer">znajdzswojczas.pl · Promo Widget API</p>
      </div>
    </>
  )
}
