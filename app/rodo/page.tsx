import Link from 'next/link'

export default function RodoPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link href="/" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">← Wróć</Link>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl shadow-blue-100/60 dark:shadow-none border border-gray-100/80 dark:border-gray-800 p-8">
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-gray-50 mb-2">RODO - Twoje prawa</h1>
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-8">
            Zgodnie z Rozporządzeniem Parlamentu Europejskiego i Rady (UE) 2016/679 z dnia 27 kwietnia 2016 r. (RODO)
          </p>

          <div className="prose prose-sm text-gray-600 dark:text-gray-400 space-y-6">

            <section>
              <h2 className="font-bold text-gray-800 dark:text-gray-100 text-base mb-3">Administrator danych osobowych</h2>
              <p>
                Administratorem Twoich danych osobowych jest właściciel serwisu <strong>znajdźswójczas.pl</strong>.
                W sprawach związanych z ochroną danych osobowych możesz skontaktować się pod adresem:{' '}
                <a href="mailto:rodo@znajdzswojczas.pl" className="text-blue-600 hover:underline font-medium">
                  rodo@znajdzswojczas.pl
                </a>
              </p>
            </section>

            <section>
              <h2 className="font-bold text-gray-800 dark:text-gray-100 text-base mb-3">Jakie dane przetwarzamy?</h2>
              <ul className="space-y-1 list-disc pl-5">
                <li>Imię i nazwisko</li>
                <li>Adres e-mail</li>
                <li>Opis zgłoszenia i wybrany termin</li>
                <li>Adres IP urządzenia użytego do złożenia zgłoszenia</li>
                <li>Opcjonalnie: nick Discord (jeśli zostanie podany jako forma kontaktu)</li>
              </ul>
            </section>

            <section>
              <h2 className="font-bold text-gray-800 dark:text-gray-100 text-base mb-3">Twoje prawa</h2>
              <p className="mb-3">Na podstawie RODO przysługują Ci następujące prawa:</p>
              <div className="space-y-3">
                {[
                  { icon: '👁️', title: 'Prawo dostępu', desc: 'Masz prawo uzyskać informację, czy Twoje dane są przetwarzane, a jeśli tak - otrzymać ich kopię.' },
                  { icon: '✏️', title: 'Prawo do sprostowania', desc: 'Masz prawo żądać poprawienia nieprawidłowych lub uzupełnienia niekompletnych danych osobowych.' },
                  { icon: '🗑️', title: 'Prawo do usunięcia', desc: 'Masz prawo żądać usunięcia swoich danych osobowych („prawo do bycia zapomnianym"), jeśli nie zachodzi podstawa prawna do ich dalszego przetwarzania.' },
                  { icon: '⏸️', title: 'Prawo do ograniczenia przetwarzania', desc: 'Masz prawo żądać ograniczenia przetwarzania Twoich danych w określonych przypadkach.' },
                  { icon: '📦', title: 'Prawo do przenoszenia danych', desc: 'Masz prawo otrzymać swoje dane w ustrukturyzowanym, powszechnie używanym formacie.' },
                  { icon: '🚫', title: 'Prawo do sprzeciwu', desc: 'Masz prawo wnieść sprzeciw wobec przetwarzania danych opartego na uzasadnionym interesie administratora.' },
                  { icon: '⚖️', title: 'Prawo do skargi', desc: 'Masz prawo wnieść skargę do organu nadzorczego - Prezesa Urzędu Ochrony Danych Osobowych (UODO), ul. Stawki 2, 00-193 Warszawa.' },
                ].map(({ icon, title, desc }) => (
                  <div key={title} className="flex gap-3 bg-gray-50 dark:bg-gray-800/60 rounded-xl p-3">
                    <span className="text-xl flex-shrink-0">{icon}</span>
                    <div>
                      <p className="font-semibold text-gray-800 dark:text-gray-100 text-sm">{title}</p>
                      <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-2xl p-6">
              <h2 className="font-bold text-gray-800 dark:text-gray-100 text-base mb-3">📩 Jak złożyć wniosek?</h2>
              <p className="mb-3">
                Aby skorzystać ze swoich praw, wyślij wiadomość na adres:{' '}
                <a href="mailto:rodo@znajdzswojczas.pl" className="text-blue-600 dark:text-blue-400 hover:underline font-semibold">
                  rodo@znajdzswojczas.pl
                </a>
              </p>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">W treści wiadomości podaj:</p>
              <ul className="space-y-1 list-disc pl-5 text-sm text-gray-600 dark:text-gray-400">
                <li>Temat: <strong>RODO - [rodzaj żądania]</strong>, np. <em>RODO - usunięcie danych</em> lub <em>RODO - sprostowanie danych</em></li>
                <li>Imię i nazwisko użyte podczas składania zgłoszenia</li>
                <li>Adres e-mail użyty podczas składania zgłoszenia</li>
                <li>Numer zgłoszenia (jeśli posiadasz, np. <code className="bg-white dark:bg-gray-800 px-1 py-0.5 rounded text-xs">#A1B2C3D4</code>)</li>
                <li>Opis żądania - co chcesz, żebyśmy zrobili z Twoimi danymi</li>
              </ul>
              <p className="mt-3 text-xs text-gray-500 dark:text-gray-500">
                Na Twoje żądanie odpowiemy bez zbędnej zwłoki, nie później niż w ciągu <strong>30 dni</strong> od jego otrzymania (art. 12 ust. 3 RODO).
              </p>
            </section>

          </div>
        </div>

        <p className="text-center text-xs text-gray-400 dark:text-gray-600 mt-6">
          <Link href="/polityka-prywatnosci" className="hover:underline">Polityka prywatności</Link>
          {' · '}
          <Link href="/regulamin" className="hover:underline">Regulamin</Link>
        </p>
      </div>
    </main>
  )
}
