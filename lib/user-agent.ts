/** Krótki opis urządzenia/przeglądarki z User-Agent do widoków "Ostatnie logowania". */
export function summarizeUserAgent(ua: string | null | undefined): string {
  if (!ua) return 'Nieznane urządzenie'

  const browsers: [RegExp, string][] = [
    [/Edg\/[\d.]+/, 'Edge'],
    [/OPR\/|Opera/, 'Opera'],
    [/SamsungBrowser/, 'Samsung Internet'],
    [/Chrome\/[\d.]+/, 'Chrome'],
    [/Firefox\/[\d.]+/, 'Firefox'],
    [/Safari\/[\d.]+/, 'Safari'],
  ]
  const oses: [RegExp, string][] = [
    [/Windows NT 10/, 'Windows'],
    [/Windows/, 'Windows'],
    [/Android/, 'Android'],
    [/iPhone|iPad|iPod/, 'iOS'],
    [/Mac OS X/, 'macOS'],
    [/CrOS/, 'ChromeOS'],
    [/Linux/, 'Linux'],
  ]

  const browser = browsers.find(([re]) => re.test(ua))?.[1] ?? 'Przeglądarka'
  const os = oses.find(([re]) => re.test(ua))?.[1] ?? ''

  return os ? `${browser} · ${os}` : browser
}
