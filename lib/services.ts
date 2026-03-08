export interface Service {
  id: string
  emoji: string
  label: string
  basePrice: number
  priceNote: string
}

export interface Variant {
  id: string
  label: string
  sublabel: string
  price: number
}

export const SERVICES: Service[] = [
  { id: 'konsultacja-it',       emoji: '💻', label: 'Konsultacja IT',               basePrice: 80,   priceNote: 'za godzinę' },
  { id: 'instalacja-soft',      emoji: '🔧', label: 'Instalacja oprogramowania',    basePrice: 60,   priceNote: 'jednorazowo' },
  { id: 'konfiguracja-systemu', emoji: '⚙️',  label: 'Konfiguracja systemu',         basePrice: 100,  priceNote: 'jednorazowo' },
  { id: 'konfiguracja-sprzetu', emoji: '🖥️',  label: 'Konfiguracja sprzętu',         basePrice: 90,   priceNote: 'jednorazowo' },
  { id: 'diagnostyka',          emoji: '🛠️',  label: 'Diagnostyka i naprawa',        basePrice: 120,  priceNote: 'od (zależy od usterki)' },
  { id: 'bezpieczenstwo',       emoji: '🔒', label: 'Bezpieczeństwo i hasła',       basePrice: 80,   priceNote: 'jednorazowo' },
  { id: 'backup',               emoji: '☁️',  label: 'Backup i chmura',              basePrice: 70,   priceNote: 'jednorazowo' },
  { id: 'telefon-tablet',       emoji: '📱', label: 'Pomoc z telefonem / tabletem', basePrice: 60,   priceNote: 'za godzinę' },
  { id: 'napisanie-programu',   emoji: '🧑‍💻', label: 'Napisanie programu',           basePrice: 60,   priceNote: 'cena zależy od komplikacji kodu' },
  { id: 'strona-internetowa',   emoji: '🌐', label: 'Strona internetowa',           basePrice: 45,   priceNote: 'cena zależy od komplikacji kodu' },
  { id: 'inne',                 emoji: '📋', label: 'Inne',                          basePrice: 30,   priceNote: 'wycena indywidualna' },
]

export const SERVICE_OPTIONS: Record<string, string[]> = {
  'napisanie-programu': ['Rust', 'Python', 'Node.js', 'C#', 'C++'],
  'strona-internetowa': ['HTML', 'React', 'Next.js', 'Svelte', 'Vue.js', 'Angular', 'Astro', 'WordPress'],
}

export const SERVICE_VARIANTS: Record<string, Variant[]> = {
  'strona-internetowa': [
    { id: 'single-page', label: 'Single Page',     sublabel: 'Jedna strona / landing page (Idealne do portfolio)', price: 50  },
    { id: 'web-app',     label: 'Web Application', sublabel: 'Aplikacja webowa (bardziej rozbudowane projekty)',    price: 300 },
  ],
}

export const OPTION_PRICE = 5
export const PRIORITY_PRICE = 15
