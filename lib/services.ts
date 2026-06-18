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

export interface ServicePackage {
  id: string
  title: string
  emoji: string
  priceRange: string
  services: Service[]
  description: string
}

// Pakiet - Price from 125 to 180 zł
export const SERVICES_LIVE_SETUP: Service[] = [
  { id: 'konfiguracja-obs', emoji:'💻', label: 'Konfiguracja OBS Studio', basePrice: 0, priceNote: 'w pakiecie'},
  { id: 'sceny-audio-obs', emoji: '⚙️', label: 'Ustawienie scen + audio', basePrice: 0, priceNote: 'w pakiecie'},
  { id: 'integracja-apki-irl', emoji: '📱', label: 'Integracja IRL Pro / Larix Broadcaster', basePrice: 0, priceNote: 'w pakiecie'},
  { id: 'test-live', emoji: '🌐', label: 'Live testowy (na obciązeniu)', basePrice: 0, priceNote: 'w pakiecie'}
]

// Pakiet - Price from 100 to 150 zł
export const SERVICES_IRL: Service[] = [
  {id: 'konfiguracja-irl', emoji: '📱', label: 'Konfiguracja streamu z tel/mobilnego', basePrice: 0, priceNote: 'w pakiecie'},
  {id: 'stabilzacja-irl', emoji: '🔧', label: 'Testy i sprawdzenie stabilności transmisji mobilnej', basePrice: 0, priceNote: 'w pakiecie'}
]

// Pakiet - Price from 150 to 300 zł
export const SERVICES_LIVE_INFRASTRUCTURE: Service[] = [
  { id: 'konfiguracja-relay', emoji: '🛠️', label: 'Konfiguracja servera relay (RTMP/SRT)', basePrice: 0, priceNote: 'w pakiecie'},
  { id: 'noalbs-proxy', emoji: '🔒', label: 'Automatyzacja live z NOALBS', basePrice: 0, priceNote: 'w pakiecie'},
  { id: 'stabilizacja-live', emoji: '⚙️', label: 'Stabilizacja połączenia', basePrice: 0, priceNote: 'w pakiecie'},
  { id: 'routing-live', emoji: '🧑‍💻', label: 'Routing / Konfiguracja prywatnego obs', basePrice: 0, priceNote: 'w pakiecie'}
]

// Pakiet - Price from 275 to 460 zł
export const SERVICES_LIVE_FULL_SETUP: Service[] = [
  {id: 'konfiguracja-obs-full', emoji: '🖥️', label: 'Pełna konfiguracja obs', basePrice: 0, priceNote: 'w pakiecie'},
  {id: 'konfiguracja-irl-full', emoji: '📱', label: 'Pełna konfiguracja do irl', basePrice: 0, priceNote: 'w pakiecie'},
  {id: 'testy-full', emoji: '🔧', label: 'Kompletny zestaw testów', basePrice: 0, priceNote: 'w pakiecie'},
  {id: 'optymalizacja-full', emoji: '🔒', label: 'Optymalizacja skryptów + ustawień', basePrice: 0, priceNote: 'w pakiecie'}
]

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

export const SERVICE_PACKAGES: ServicePackage[] = [
  {
    id: 'live-setup',
    title: 'Konfiguracja streamu (podstawowy)',
    emoji: '🎬',
    priceRange: '125 – 180 zł',
    description: 'Pakiet konfiguracji OBS, scen, audio, integracji z aplikacją mobilną i testów live.',
    services: SERVICES_LIVE_SETUP,
  },
  {
    id: 'irl-setup',
    title: 'Konfiguracja streamu mobilnego (IRL)',
    emoji: '📱',
    priceRange: '100 – 150 zł',
    description: 'Konfiguracja streamu z telefonu i testy stabilności transmisji mobilnej.',
    services: SERVICES_IRL,
  },
  {
    id: 'live-infrastructure',
    title: 'Infrastruktura live',
    emoji: '🛠️',
    priceRange: '150 – 300 zł',
    description: 'Serwer relay RTMP/SRT, automatyzacja z NOALBS, stabilizacja połączenia i routing OBS.',
    services: SERVICES_LIVE_INFRASTRUCTURE,
  },
  {
    id: 'live-full-setup',
    title: 'Pełny setup live',
    emoji: '🚀',
    priceRange: '275 – 460 zł',
    description: 'Kompleksowa konfiguracja OBS, streamu IRL, testów i optymalizacji w jednym pakiecie.',
    services: SERVICES_LIVE_FULL_SETUP,
  },
]

export const OPTION_PRICE = 5
export const PRIORITY_PRICE = 15
export const EXTRA_PRIORITY_PRICE = 40
