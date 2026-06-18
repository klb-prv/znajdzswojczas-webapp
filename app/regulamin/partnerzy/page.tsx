import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Program partnerski - Znajdź swój czas',
  description: 'Regulamin programu partnerskiego – zasady, prowizje, kody polecające.',
}

export default function PartnerzyPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link href="/regulamin" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">← Regulamin serwisu</Link>
        </div>
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-2xl p-4 mb-4">
          <div className="flex items-start gap-3">
            <span className="text-lg leading-none mt-0.5">🚧</span>
            <div>
              <p className="text-sm font-bold text-amber-800 dark:text-amber-300">Trwa nabór do programu partnerskiego</p>
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">Niektóre funkcje będą dostępne dopiero wkrótce. Wybrane osoby dostaną możliwość uczestnictwa w programie poprzez kontakt (Discord lub mailowo).</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl shadow-blue-100/60 dark:shadow-none border border-gray-100/80 dark:border-gray-800 p-8">
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-gray-50 mb-1">Program partnerski</h1>
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-8">Regulamin programu partnerskiego</p>

          <div className="prose prose-sm text-gray-600 dark:text-gray-400 space-y-6">

            {/* §1 */}
            <section>
              <h2 className="font-bold text-gray-800 dark:text-gray-100 text-base mb-3">§1. Definicje programu</h2>
              <p>Program partnerski umożliwia przypisywanie klientów do partnerów za pomocą unikalnych kodów polecających. Każdy kod jest przypisany do jednej osoby i stanowi jej indywidualne źródło prowizji.</p>
            </section>

            {/* §2 */}
            <section>
              <h2 className="font-bold text-gray-800 dark:text-gray-100 text-base mb-3">§2. System kodów</h2>
              <ul className="space-y-1 list-disc pl-5">
                <li className="text-sm">Każdy partner otrzymuje unikalny kod (np. KAMIL2510)</li>
                <li className="text-sm">Kod jest przypisany na stałe do jednej osoby</li>
                <li className="text-sm">Kod nie może być sprzedawany, wymieniany ani przekazywany</li>
                <li className="text-sm">Kody bez aktywnego partnera są automatycznie unieważniane</li>
                <li className="text-sm">System może dezaktywować kod w dowolnym momencie</li>
              </ul>
            </section>

            {/* §3 */}
            <section>
              <h2 className="font-bold text-gray-800 dark:text-gray-100 text-base mb-3">§3. Prowizje</h2>
              <ul className="space-y-1 list-disc pl-5">
                <li className="text-sm">Standardowa prowizja: <strong className="font-bold text-gray-700 dark:text-gray-200">3%</strong> od opłaconej transakcji</li>
                <li className="text-sm">Prowizja liczona od finalnej kwoty usługi</li>
                <li className="text-sm">Prowizja nie obejmuje anulowanych lub zwróconych płatności</li>
                <li className="text-sm">Wypłata środków możliwa od <strong className="font-bold text-gray-700 dark:text-gray-200">10,00 zł</strong> salda</li>
              </ul>
            </section>

            {/* §4 */}
            <section>
              <h2 className="font-bold text-gray-800 dark:text-gray-100 text-base mb-3">§4. Rabat dla klienta</h2>
              <ul className="space-y-1 list-disc pl-5">
                <li className="text-sm">Kod partnerski może aktywować rabat dla klienta</li>
                <li className="text-sm">Wysokość rabatu ustalana indywidualnie</li>
                <li className="text-sm">Rabaty nie łączą się z innymi promocjami, chyba że określono inaczej</li>
                <li className="text-sm">Rabat i prowizja są naliczane niezależnie</li>
              </ul>
            </section>

            {/* §5 */}
            <section>
              <h2 className="font-bold text-gray-800 dark:text-gray-100 text-base mb-3">§5. Unieważnienie kodów</h2>
              <ul className="space-y-1 list-disc pl-5">
                <li className="text-sm">Kod bez przypisanego partnera jest natychmiast unieważniany</li>
                <li className="text-sm">Kod może zostać dezaktywowany w przypadku:</li>
              </ul>
              <ul className="list-disc pl-8 mt-1 space-y-0.5 text-xs text-gray-500 dark:text-gray-400">
                <li>braku aktywności partnera</li>
                <li>naruszenia regulaminu</li>
                <li>prób nadużycia systemu</li>
                <li>fałszywego generowania transakcji</li>
              </ul>
              <ul className="space-y-1 list-disc pl-5 mt-1">
                <li className="text-sm">Unieważnienie kodu oznacza brak dalszych prowizji</li>
              </ul>
            </section>

            {/* §6 */}
            <section>
              <h2 className="font-bold text-gray-800 dark:text-gray-100 text-base mb-3">§6. Zakaz nadużyć</h2>
              <p className="mb-2">Zabrania się:</p>
              <ul className="space-y-1 list-disc pl-5">
                <li className="text-sm">generowania sztucznych transakcji (self-referral)</li>
                <li className="text-sm">używania wielu kodów do jednej transakcji</li>
                <li className="text-sm">manipulacji systemem rabatów</li>
                <li className="text-sm">tworzenia fałszywych poleceń</li>
                <li className="text-sm">odsprzedawania lub handlu kodami</li>
                <li className="text-sm">podszywania się pod innych partnerów</li>
                <li className="text-sm">dzielenia prowizji poza systemem</li>
                <li className="text-sm">omijania systemu rezerwacji</li>
                <li className="text-sm">prób ingerencji w system naliczania</li>
                <li className="text-sm">wykorzystywania błędów systemu bez zgłoszenia</li>
              </ul>
            </section>

            {/* §7 */}
            <section>
              <h2 className="font-bold text-gray-800 dark:text-gray-100 text-base mb-3">§7. Rozliczenia</h2>
              <ul className="space-y-1 list-disc pl-5">
                <li className="text-sm">Rozliczenia prowadzone są cyklicznie lub ręcznie</li>
                <li className="text-sm">Wypłaty realizowane są po osiągnięciu minimum <strong className="font-bold text-gray-700 dark:text-gray-200">10 zł</strong></li>
                <li className="text-sm">Czas realizacji wypłat: do ustalenia indywidualnie</li>
                <li className="text-sm">Operator może wstrzymać wypłatę w przypadku weryfikacji</li>
              </ul>
            </section>

            {/* §8 */}
            <section>
              <h2 className="font-bold text-gray-800 dark:text-gray-100 text-base mb-3">§8. Odpowiedzialność</h2>
              <ul className="space-y-1 list-disc pl-5">
                <li className="text-sm">Operator nie odpowiada za błędne użycie kodu przez klienta</li>
                <li className="text-sm">Ostateczna decyzja o naliczeniu prowizji należy do systemu</li>
                <li className="text-sm">W przypadku sporu decydują dane z systemu rezerwacji</li>
              </ul>
            </section>

            {/* §9 */}
            <section>
              <h2 className="font-bold text-gray-800 dark:text-gray-100 text-base mb-3">§9. Zmiany regulaminu</h2>
              <p>Regulamin może być aktualizowany w dowolnym momencie. Zmiany obowiązują od momentu publikacji. Partnerzy są zobowiązani do ich akceptacji.</p>
            </section>

            {/* §10 */}
            <section>
              <h2 className="font-bold text-gray-800 dark:text-gray-100 text-base mb-3">§10. Postanowienia końcowe</h2>
              <ul className="space-y-1 list-disc pl-5">
                <li className="text-sm">Udział w programie oznacza akceptację niniejszego regulaminu</li>
                <li className="text-sm">Program ma charakter partnerski i promocyjny</li>
                <li className="text-sm">Nadużycia mogą skutkować natychmiastowym wykluczeniem</li>
                <li className="text-sm">System ma charakter zamknięty (invite-only / zaufani partnerzy)</li>
              </ul>
            </section>

            <div className="border-t border-gray-100 dark:border-gray-800 pt-4 mt-6">
              <p className="text-xs text-gray-400 dark:text-gray-600 text-center">
                Regulamin programu partnerskiego obowiązuje od dnia publikacji.
              </p>
            </div>

          </div>
        </div>
      </div>
    </main>
  )
}
