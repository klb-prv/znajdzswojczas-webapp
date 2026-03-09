export default function PromoLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style>{`
        html, body {
          margin: 0 !important;
          padding: 0 !important;
          background: transparent !important;
          width: 100%;
        }
        /* Hide ThemeToggle on promo pages */
        button[aria-label="Przełącz na jasny motyw"],
        button[aria-label="Przełącz na ciemny motyw"] {
          display: none !important;
        }
      `}</style>
      {children}
    </>
  )
}
