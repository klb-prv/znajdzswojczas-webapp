export interface Service {
  id: string
  emoji: string
  label: string
  basePrice: number
  priceNote: string
  category: 'it' | 'streaming' | 'websites' | 'programming'
}

export interface Variant {
  id: string
  label: string
  sublabel: string
  price: number
}

export interface ServicePackage {
  id: string
  title: string
  emoji: string
  priceRange: string
  description: string
}

const PACKAGES: ServicePackage[] = [
  {
    id: 'live-setup',
    title: 'Konfiguracja streamu — podstawowy',
    emoji: '🎬',
    priceRange: 'od 180 zł',
    description: 'Konfiguracja OBS, scen, audio, integracji z aplikacją mobilną i testów live.',
  },
  {
    id: 'irl-setup',
    title: 'Konfiguracja streamu mobilnego — IRL',
    emoji: '📱',
    priceRange: 'od 150 zł',
    description: 'Konfiguracja streamu z telefonu i testy stabilności transmisji mobilnej.',
  },
  {
    id: 'live-infrastructure',
    title: 'Infrastruktura live',
    emoji: '🛠️',
    priceRange: 'od 300 zł',
    description: 'Serwer relay RTMP/SRT, automatyzacja, stabilizacja połączenia i routing OBS.',
  },
  {
    id: 'live-full-setup',
    title: 'Pełny setup live',
    emoji: '🚀',
    priceRange: 'od 500 zł',
    description: 'Kompleksowa konfiguracja OBS, streamu IRL, testów i optymalizacji.',
  },
]

export const SERVICE_PACKAGES: ServicePackage[] = PACKAGES

export const SERVICES: Service[] = [
  { id: 'konsultacja-it',       emoji: '💻', label: 'Konsultacja IT / pomoc techniczna',         basePrice: 100,  priceNote: 'za godzinę',  category: 'it' },
  { id: 'instalacja-soft',      emoji: '🔧', label: 'Instalacja i konfiguracja programu',        basePrice: 100,  priceNote: '',            category: 'it' },
  { id: 'konfiguracja-systemu', emoji: '⚙️',  label: 'Konfiguracja systemu',                      basePrice: 150,  priceNote: '',            category: 'it' },
  { id: 'diagnostyka',          emoji: '🛠️',  label: 'Diagnostyka problemu',                      basePrice: 150,  priceNote: '',            category: 'it' },
  { id: 'naprawa-programowa',   emoji: '🐛', label: 'Naprawa problemów programowych',            basePrice: 150,  priceNote: '',            category: 'it' },
  { id: 'konfiguracja-sprzetu', emoji: '🖥️',  label: 'Konfiguracja sprzętu',                      basePrice: 120,  priceNote: '',            category: 'it' },
  { id: 'bezpieczenstwo',       emoji: '🔒', label: 'Bezpieczeństwo, hasła, konta',              basePrice: 100,  priceNote: '',            category: 'it' },
  { id: 'backup',               emoji: '☁️',  label: 'Backup i konfiguracja chmury',              basePrice: 100,  priceNote: '',            category: 'it' },
  { id: 'telefon-tablet',       emoji: '📱', label: 'Pomoc z telefonem lub tabletem',            basePrice: 80,   priceNote: 'za godzinę',  category: 'it' },

  { id: 'diagnostyka-stream',       emoji: '🔍', label: 'Diagnostyka problemów ze streamem',         basePrice: 100,  priceNote: 'za godzinę',  category: 'streaming' },
  { id: 'automatyzacja-stream',     emoji: '🤖', label: 'Automatyzacja streamu / integracje',        basePrice: 300,  priceNote: '',            category: 'streaming' },

  { id: 'strona-internetowa',   emoji: '🌐', label: 'Strona internetowa',                       basePrice: 400,  priceNote: '',            category: 'websites' },
  { id: 'aplikacja-webowa',     emoji: '🌐', label: 'Aplikacja webowa',                         basePrice: 1500, priceNote: '',            category: 'websites' },

  { id: 'male-narzedzie',       emoji: '🔧', label: 'Mały skrypt / narzędzie',                   basePrice: 200,  priceNote: '',            category: 'programming' },
  { id: 'prosty-program',       emoji: '💻', label: 'Prosty program',                            basePrice: 500,  priceNote: '',            category: 'programming' },
  { id: 'program-sredniej',     emoji: '⚙️',  label: 'Program średniej złożoności',              basePrice: 1000, priceNote: '',            category: 'programming' },
  { id: 'automatyzacja-bot',     emoji: '🤖', label: 'Automatyzacja / bot / integracja',          basePrice: 500,  priceNote: '',            category: 'programming' },
  { id: 'rozbudowany-system',   emoji: '🏗️', label: 'Rozbudowany system',                        basePrice: 0,    priceNote: 'wycena indywidualna', category: 'programming' },
  { id: 'poprawki',             emoji: '🐛', label: 'Poprawki w istniejącym projekcie',           basePrice: 100,  priceNote: 'za godzinę',  category: 'programming' },
]

export const SERVICE_VARIANTS: Record<string, Variant[]> = {
  'strona-internetowa': [
    { id: 'landing-page', label: 'Landing Page',   sublabel: 'Jedna strona, responsywna, z formularzem kontaktowym',   price: 400 },
    { id: 'strona-firmowa', label: 'Strona firmowa', sublabel: 'Do 5 podstron, wersja mobilna, podstawowe SEO',         price: 800 },
    { id: 'rozbudowana',    label: 'Rozbudowana strona', sublabel: 'Panel administracyjny, integracje, niestandardowe funkcje', price: 1500 },
  ],
}

export const PRIORITY_PRICE = 15
export const EXTRA_PRIORITY_PRICE = 40
