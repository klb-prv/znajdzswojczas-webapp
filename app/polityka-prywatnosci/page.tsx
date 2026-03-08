import Link from 'next/link'

export default function PolitykaPrywatnosci() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link href="/" className="text-sm text-blue-600 hover:underline">← Wróć</Link>
        </div>
        <div className="bg-white rounded-3xl shadow-xl shadow-blue-100/60 border border-gray-100/80 p-8">
          <h1 className="text-2xl font-extrabold text-gray-900 mb-6">Polityka prywatności</h1>
          <div className="prose prose-sm text-gray-600 space-y-4">
            <section>
              <h2 className="font-semibold text-gray-800 text-base mb-2">1. Administrator danych</h2>
              <p>Administratorem danych osobowych jest właściciel serwisu <strong>znajdźswójczas.pl</strong>. Dane kontaktowe: adres e-mail podany w serwisie.</p>
            </section>
            <section>
              <h2 className="font-semibold text-gray-800 text-base mb-2">2. Zakres zbieranych danych</h2>
              <p>W trakcie składania rezerwacji zbieramy następujące dane:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Imię i nazwisko</li>
                <li>Adres e-mail</li>
                <li>Opis zgłoszenia</li>
                <li>Wybrany termin</li>
              </ul>
            </section>
            <section>
              <h2 className="font-semibold text-gray-800 text-base mb-2">3. Cel przetwarzania</h2>
              <p>Dane zbierane są w celu realizacji usług konsultacyjnych i technicznych, a także w celu komunikacji z klientem (potwierdzenia rezerwacji, informacje o zmianach w zgłoszeniu).</p>
            </section>
            <section>
              <h2 className="font-semibold text-gray-800 text-base mb-2">4. Podstawa prawna</h2>
              <p>Przetwarzanie odbywa się na podstawie art. 6 ust. 1 lit. b RODO (niezbędność do wykonania umowy) oraz art. 6 ust. 1 lit. f RODO (uzasadniony interes administratora).</p>
            </section>
            <section>
              <h2 className="font-semibold text-gray-800 text-base mb-2">5. Okres przechowywania</h2>
              <p>Dane przechowywane są przez czas niezbędny do realizacji usługi, a po jej zakończeniu przez okres zgodny z przepisami prawa lub do czasu wniesienia sprzeciwu.</p>
            </section>
            <section>
              <h2 className="font-semibold text-gray-800 text-base mb-2">6. Prawa użytkownika</h2>
              <p>Masz prawo do: dostępu do danych, ich sprostowania, usunięcia, ograniczenia przetwarzania, przenoszenia danych oraz wniesienia skargi do organu nadzorczego (UODO).</p>
            </section>
            <section>
              <h2 className="font-semibold text-gray-800 text-base mb-2">7. Przekazywanie danych</h2>
              <p>Dane mogą być przekazywane dostawcom usług technicznych (hosting, baza danych, wysyłka e-mail) wyłącznie w zakresie niezbędnym do realizacji usługi.</p>
            </section>
            <section>
              <h2 className="font-semibold text-gray-800 text-base mb-2">8. Pliki cookie</h2>
              <p>Serwis może używać plików cookie w celach funkcjonalnych (np. preferencja motywu). Pliki cookie nie są wykorzystywane do celów marketingowych.</p>
            </section>
          </div>
        </div>
      </div>
    </main>
  )
}
