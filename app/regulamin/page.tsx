import Link from 'next/link'

export default function RegulamingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 py-12 px-4" style={{ marginLeft: '7px' }}>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link href="/" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">← Wróć</Link>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl shadow-blue-100/60 dark:shadow-none border border-gray-100/80 dark:border-gray-800 p-8">
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-gray-50 mb-2">Regulamin</h1>
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-8">Obowiązuje od dnia 08.03.2026 r.</p>

          <div className="prose prose-sm text-gray-600 dark:text-gray-400 space-y-10">

            {/* §1 */}
            <section>
                             <h2 className="font-bold text-gray-800 dark:text-gray-100 text-base mb-4">§1. Definicje</h2>
              <p className="mb-3">Pojęcia użyte w Regulaminie</p>
              <ul className="space-y-2 list-none pl-0">
                <li><strong>Klient</strong> - wyłącznie osoba fizyczna (w tym osoba fizyczna prowadząca jednoosobową działalność gospodarczą) składająca Zgłoszenie za pośrednictwem Formularza dostępnego w Serwisie.</li>
                <li><strong>Realizator Usługi</strong> - administrator serwisu znajdzswojczas.pl, świadczący Usługi na rzecz Klientów.</li>
                <li><strong>Usługa</strong> - świadczenie oferowane przez Realizatora Usługi, w szczególności konsultacje, tworzenie stron internetowych, programowanie i inne usługi techniczne lub doradcze.</li>
                <li><strong>Serwis</strong> - strona internetowa dostępna pod adresem znajdzswojczas.pl wraz z całą infrastrukturą techniczną.</li>
                <li><strong>Formularz</strong> - elektroniczny formularz dostępny w Serwisie, umożliwiający Klientowi złożenie Zgłoszenia.</li>
                <li><strong>Zgłoszenie</strong> - żądanie realizacji Usługi złożone przez Klienta za pośrednictwem Formularza, potwierdzone kodem jednorazowym.</li>
              </ul>
            </section>

            {/* §2 */}
            <section>
                             <h2 className="font-bold text-gray-800 dark:text-gray-100 text-base mb-4">§2. Postanowienia ogólne</h2>
              <p>Niniejszy Regulamin określa zasady korzystania z Serwisu <strong>znajdzswojczas.pl</strong>, składania Zgłoszeń oraz realizacji Usług przez Realizatora Usługi.</p>
              <p className="mt-3">Korzystanie z Serwisu jest równoznaczne z akceptacją całego Regulaminu.</p>
              <p className="mt-3">Usługi świadczone za pośrednictwem Serwisu przeznaczone są wyłącznie dla osób fizycznych, w tym osób fizycznych prowadzących jednoosobową działalność gospodarczą. Realizator Usługi nie realizuje Zgłoszeń na rzecz <strong>osób prawnych</strong> (np. spółek z o.o., spółek akcyjnych) ani <strong>jednostek organizacyjnych nieposiadających osobowości prawnej</strong>. Zgłoszenie złożone przez taki podmiot może zostać odrzucone lub anulowane.</p>
              <p className="mt-3">Zgłoszenia przyjmowane są wyłącznie w celach prywatnych, niezwiązanych bezpośrednio z działalnością gospodarczą lub zawodową Klienta. Składając Zgłoszenie Klient oświadcza, że działa w celach niezwiązanych bezpośrednio z jego działalnością gospodarczą lub zawodową.</p>
            </section>

            {/* §3 */}
            <section>
                             <h2 className="font-bold text-gray-800 dark:text-gray-100 text-base mb-4">§3. Rezerwacje i zgłoszenia</h2>
              <p>Poprzez Formularz Klient zgłasza chęć realizacji Usługi w wybranym terminie. Zgłoszenie wymaga potwierdzenia adresu e-mail za pomocą kodu jednorazowego przesłanego przez Serwis.</p>
              <p className="mt-3">Realizator Usługi zastrzega sobie prawo do odwołania lub przełożenia terminu realizacji Usługi z uzasadnionych przyczyn, o czym Klient zostanie niezwłocznie poinformowany drogą elektroniczną.</p>
            </section>

            {/* §4 */}
            <section>
                             <h2 className="font-bold text-gray-800 dark:text-gray-100 text-base mb-4">§4. Ceny i płatności</h2>
              <p>Ceny podane w Serwisie mają charakter szacunkowy i orientacyjny. Ostateczna cena Usługi ustalana jest indywidualnie i przesyłana Klientowi drogą elektroniczną po realizacji Usługi.</p>
              <p className="mt-3">Podanie konkretnych wymagań technologicznych (np. konkretnej technologii, języka programowania lub frameworku) w polu „Szczegółowy opis problemu" w Formularzu — analogicznie jak zaznaczenie odpowiedniej opcji w sekcji „Konkretne wymagania" — może skutkować naliczeniem dodatkowej opłaty za realizację Usługi.</p>
              <p className="mt-3">Klient zobowiązany jest do uregulowania należności w następujących terminach od daty wystawienia do zapłaty:</p>
              <ul className="mt-3 space-y-1 list-disc pl-5">
                <li><strong>do 14 dni</strong> – w przypadku konsultacji oraz usług niewymagających znacznego nakładu pracy,</li>
                <li><strong>do 7 dni</strong> – w przypadku usług wymagających znacznego nakładu pracy, w szczególności tworzenia stron internetowych i programowania.</li>
              </ul>
              <p className="mt-3">Szczegółowy termin płatności zostanie wskazany w wiadomości e-mail przesłanej po realizacji Usługi.</p>
              <p className="mt-3">W przypadku nieterminowej płatności Realizator Usługi zastrzega sobie prawo do naliczania odsetek ustawowych za opóźnienie, zgodnie z art. 481 ustawy z dnia 23 kwietnia 1964 r. – Kodeks cywilny.</p>
              <p className="font-semibold text-gray-700 dark:text-gray-300 mt-3 mb-1">Dokumentacja sprzedaży:</p>
              <p>Realizator Usługi dokumentuje sprzedaż zgodnie z obowiązującymi przepisami podatkowymi — <strong>paragonem fiskalnym</strong> (jeżeli dotyczy) lub <strong>fakturą</strong> wystawioną na dane osobowe Klienta, bez numeru NIP nabywcy. Ze względu na prywatny charakter świadczonych Usług, <strong>nie ma możliwości wystawienia faktury VAT z numerem NIP nabywcy na dane prowadzonej działalności gospodarczej</strong>. Klient przyjmuje te warunki składając Zgłoszenie.</p>
            </section>

            {/* §5 */}
            <section>
                             <h2 className="font-bold text-gray-800 dark:text-gray-100 text-base mb-4">§5. Zaliczki i zadatek</h2>
              <p className="mt-3">W przypadku Usług o wartości przekraczającej <strong>250 zł</strong> lub charakteryzujących się wysokim stopniem złożoności (w szczególności konfiguracja dedykowanych serwerów, rozbudowane systemy automatyzacji transmisji, pakiety usług oraz pełny setup live), Realizator Usługi zastrzega sobie prawo do uzależnienia rozpoczęcia prac od wpłaty <strong>zadatku</strong> w wysokości do <strong>50%</strong> szacunkowej wartości Zlecenia.</p>
              <p className="mt-3">Zadatek, o którym mowa w ust. 1, jest płatny na podstawie <strong>instrukcji płatniczej przesłanej przez Realizatora (elektronicznie lub za pośrednictwem poczty e-mail)</strong> w terminie <strong>7 dni</strong> od dnia jej otrzymania przez Klienta. <strong>Rozpoczęcie realizacji Usługi następuje nie wcześniej niż po zaksięgowaniu</strong> zadatku na rachunku bankowym Realizatora Usługi.</p>
              <p className="mt-3">W przypadku rezygnacji z realizacji Usługi z winy Klienta po rozpoczęciu prac przez Realizatora Usługi, wpłacony zadatek <strong>nie podlega zwrotowi</strong>, zgodnie z art. 394 ustawy z dnia 23 kwietnia 1964 r. – Kodeks cywilny. W przypadku niewykonania Usługi z przyczyn leżących wyłącznie po stronie Realizatora Usługi, Klientowi przysługuje prawo żądania zwrotu zadatku w podwójnej wysokości.</p>
              <p className="mt-3">Autorskie prawa majątkowe oraz licencja na przygotowane profile konfiguracyjne, skrypty, sceny OBS, ustawienia NOALBS i inne utwory powstałe w trakcie realizacji Usługi przechodzą na Klienta dopiero po <strong>całkowitym uregulowaniu należności</strong> za zrealizowaną Usługę. Do momentu pełnej zapłaty utwory te pozostają własnością intelektualną Realizatora Usługi.</p>
            </section>

            {/* §6 */}
            <section>
                             <h2 className="font-bold text-gray-800 dark:text-gray-100 text-base mb-4">§6. Kody zniżkowe i program partnerski</h2>
              <p>Kody zniżkowe są jednorazowe i mogą posiadać datę ważności lub limit użyć. Nie można łączyć kilku kodów jednocześnie. Kod zniżkowy obniża wartość szacunkową Usługi i nie wpływa na ostateczną cenę ustaloną indywidualnie.</p>
              <p className="mt-3">Kody zniżkowe obejmują wyłącznie wartość bazową Usługi oraz dopłaty za konkretne wymagania technologiczne. <strong>Nie obejmują one usług dodatkowych</strong>, w szczególności Priorytetowej i Natychmiastowej realizacji – dopłaty z tytułu tych usług doliczane są w pełnej wysokości, niezależnie od zastosowanego kodu zniżkowego.</p>
              <p className="mt-3">W przypadku wykrycia, że Klient zastosował kod rabatowy w sposób niezgodny z jego przeznaczeniem (w szczególności w celu obniżenia ceny usługi dodatkowej wyłączonej z promocji), Realizator Usługi ma prawo <strong>anulować Zgłoszenie</strong> lub <strong>wezwać Klienta do dopłaty</strong> różnicy. Realizacja Usługi zostaje wstrzymana do momentu uregulowania pełnej, prawidłowej kwoty.</p>
              <p className="mt-3">
                Szczegóły dotyczące programu partnerskiego dostępne są w osobnym regulaminie:{' '}
                <a href="/regulamin/partnerzy" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Regulamin programu partnerskiego →</a>
              </p>
            </section>

            {/* §7 */}
            <section>
                             <h2 className="font-bold text-gray-800 dark:text-gray-100 text-base mb-4">§7. Usługi dodatkowe</h2>
              <p>W Serwisie dostępne są następujące usługi dodatkowe:</p>
              <ul className="mt-3 space-y-2 list-disc pl-5">
                <li>
                  <strong>Priorytetowa realizacja</strong> - usługa polegająca na realizacji Zgłoszenia w skróconym czasie, do <strong>3 dni roboczych</strong> od daty potwierdzenia Zgłoszenia, w miarę dostępności Realizatora Usługi. Opcja objęta jest dodatkową opłatą zgodnie z cennikiem podanym w Formularzu.
                </li>
                <li>
                  <strong>Natychmiastowa realizacja</strong> - usługa polegająca na realizacji Zgłoszenia w trybie przyspieszonym, do <strong>24 godzin</strong> od daty potwierdzenia Zgłoszenia, w miarę dostępności Realizatora Usługi. Opcja objęta jest dodatkową opłatą zgodnie z cennikiem podanym w Formularzu.
                </li>
                <li>
                  <strong>Pakiety usług</strong> - z góry skonfigurowane zestawy Usług (np. konfiguracja streamu, infrastruktura live, pełny setup live) oferowane w stałym przedziale cenowym. Szczegółowy zakres pakietu określony jest w Serwisie.
                </li>
              </ul>
              <p className="mt-3">Realizator Usługi zastrzega sobie prawo do odmowy przyjęcia Zgłoszenia z usługą dodatkową (Priorytetowa lub Natychmiastowa realizacja) w przypadku braku dostępności, o czym Klient zostanie poinformowany.</p>
              <p className="mt-1">Kody zniżkowe nie obejmują dopłat za usługi dodatkowe (Priorytetowa i Natychmiastowa realizacja).</p>
            </section>

            {/* §8 */}
            <section>
                             <h2 className="font-bold text-gray-800 dark:text-gray-100 text-base mb-4">§8. Prawo odstąpienia od umowy, zwroty i reklamacje</h2>
              <p className="font-semibold text-gray-700 dark:text-gray-300 mb-1">Prawo odstąpienia od umowy:</p>
              <p>Zgodnie z art. 38 ust. 1 pkt 1 ustawy z dnia 30 maja 2014 r. o prawach konsumenta (Dz.U. 2014 poz. 827 ze zm.), <strong>prawo odstąpienia od umowy zawartej na odległość nie przysługuje</strong> Klientowi w odniesieniu do umów o świadczenie usług, jeżeli Realizator Usługi wykonał w pełni Usługę za wyraźną zgodą Klienta, który został poinformowany przed rozpoczęciem świadczenia, że po spełnieniu świadczenia utraci prawo odstąpienia od umowy.</p>
              <p className="mt-3">Składając Zgłoszenie, Klient <strong>wyraźnie żąda</strong> rozpoczęcia świadczenia Usługi przed upływem ustawowego terminu na odstąpienie od umowy oraz przyjmuje do wiadomości, że po pełnym zrealizowaniu Usługi przez Realizatora Usługi prawo do odstąpienia od umowy <strong>wygasa</strong>.</p>
              <p className="font-semibold text-gray-700 dark:text-gray-300 mt-3 mb-1">Brak zwrotów kosztów za zrealizowane Usługi:</p>
              <p className="font-bold text-gray-900 dark:text-gray-100 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/60 rounded-xl p-3 mt-3">
                ⚠️ Realizacja Usługi (w tym Usług dodatkowych) <strong>rozpoczyna się niezwłocznie</strong> po potwierdzeniu zgłoszenia klienta. Z tego względu <strong>rozpoczęta lub w pełni zrealizowana Usługa nie podlega zwrotowi</strong>. Klientowi przysługuje wyłącznie prawo do reklamacji zgodnie z tym paragrafem (§8).
              </p>
              <p className="mt-3">Usługi, które zostały w pełni zrealizowane, nie podlegają zwrotowi kosztów — z zastrzeżeniem powyższego przepisu o prawie odstąpienia oraz przypadków wyraźnie przewidzianych przez obowiązujące przepisy prawa.</p>
              <p className="mt-3">Usługi dodatkowe (w tym Priorytetowa i Natychmiastowa realizacja) stanowią świadczenia pomocnicze i po ich rozpoczęciu lub zrealizowaniu nie podlegają zwrotowi, chyba że zostały niewykonane z przyczyn leżących po stronie Realizatora Usługi.</p>
              <p id="reklamacje" className="font-semibold text-gray-700 dark:text-gray-300 mt-3 mb-1 scroll-mt-30">Reklamacje:</p>
              <p>Klient ma prawo złożyć reklamację dotyczącą jakości lub sposobu wykonania Usługi w terminie <strong>2 lat</strong> od daty zrealizowania Usługi (tj. od daty wysłania przez Realizatora Usługi wiadomości e-mail informującej o realizacji i wystawieniu do zapłaty), zgodnie z art. 568 §1 ustawy z dnia 23 kwietnia 1964 r. — Kodeks cywilny.</p>
              <p className="mt-3">Reklamację należy złożyć drogą elektroniczną na adres: <strong>rodo@znajdzswojczas.pl</strong>, podając numer zgłoszenia, opis problemu oraz oczekiwany sposób rozwiązania. Realizator Usługi rozpatrzy reklamację w terminie <strong>14 dni kalendarzowych</strong> od jej otrzymania i poinformuje Klienta o sposobie rozstrzygnięcia.</p>
            </section>

            {/* §9 */}
            <section>
                             <h2 className="font-bold text-gray-800 dark:text-gray-100 text-base mb-4">§9. Ochrona przed nadużyciami</h2>
              <p>W przypadku stwierdzenia nadużywania Serwisu niezgodnie z jego przeznaczeniem lub zasadami niniejszego Regulaminu, Realizator Usługi zastrzega sobie prawo do przekazania danych osobowych Klienta — w tym imienia, nazwiska, danych kontaktowych podanych podczas składania Zgłoszenia oraz adresu IP urządzenia użytego do złożenia Zgłoszenia — właściwym organom ścigania, w tym Policji.</p>
              <p className="mt-3">Podstawą prawną udostępnienia danych jest art. 6 ust. 1 lit. c) lub f) Rozporządzenia Parlamentu Europejskiego i Rady (UE) 2016/679 (RODO) w związku z art. 304 ustawy z dnia 6 czerwca 1997 r. — Kodeks postępowania karnego (społeczny obowiązek zawiadomienia o przestępstwie) oraz przepisami ustawy z dnia 6 czerwca 1997 r. — Kodeks karny.</p>
            </section>

            {/* §10 */}
            <section>
                             <h2 className="font-bold text-gray-800 dark:text-gray-100 text-base mb-4">§10. Zawarcie umowy</h2>
              <p>Klient zawiera umowę o świadczenie Usługi z Realizatorem Usługi poprzez wypełnienie i przesłanie Formularza zgłoszeniowego dostępnego w Serwisie oraz potwierdzenie Zgłoszenia kodem jednorazowym. Złożenie Zgłoszenia jest równoznaczne z akceptacją niniejszego Regulaminu oraz wyrażeniem zgody na realizację Usługi na warunkach w nim określonych.</p>
            </section>

            {/* §11 */}
            <section>
                             <h2 className="font-bold text-gray-800 dark:text-gray-100 text-base mb-4">§11. Postanowienia końcowe</h2>
              <p>W sprawach nieuregulowanych niniejszym Regulaminem stosuje się przepisy prawa polskiego, w szczególności ustawy z dnia 23 kwietnia 1964 r. — Kodeks cywilny oraz ustawy z dnia 30 maja 2014 r. o prawach konsumenta.</p>
              <p className="mt-3">Realizator Usługi zastrzega sobie prawo do zmiany Regulaminu. O zmianach mających istotny wpływ na prawa i obowiązki Klientów Realizator Usługi poinformuje poprzez opublikowanie nowej wersji Regulaminu w Serwisie z <strong>co najmniej 14-dniowym</strong> wyprzedzeniem przed wejściem w życie zmian. Zmiany o charakterze technicznym lub redakcyjnym mogą wchodzić w życie bez okresu przejściowego. Klient, który nie akceptuje zmian, powinien powstrzymać się od składania nowych Zgłoszeń po dacie wejścia w życie zmian. Złożone i potwierdzone Zgłoszenia realizowane są na warunkach Regulaminu obowiązującego w chwili ich złożenia.</p>
              <p className="mt-3">Z uwagi na fakt, iż korzystanie z Serwisu nie wymaga rejestracji ani zakładania konta, Klient jest zobowiązany do samodzielnego zapoznawania się z aktualną treścią Regulaminu.</p>
            </section>

            {/* §12 */}
            <section>
                             <h2 className="font-bold text-gray-800 dark:text-gray-100 text-base mb-4">§12. Pozasądowe rozwiązywanie sporów (ODR)</h2>
              <p>Zgodnie z Rozporządzeniem Parlamentu Europejskiego i Rady (UE) nr 524/2013 z dnia 21 maja 2013 r. w sprawie internetowego systemu rozstrzygania sporów konsumenckich, Klient będący konsumentem ma możliwość skorzystania z platformy ODR (Online Dispute Resolution) dostępnej pod adresem: <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">https://ec.europa.eu/consumers/odr/</a>.</p>
              <p className="mt-3">Klient może również skorzystać z pozasądowych metod rozpatrywania reklamacji i dochodzenia roszczeń, w tym zwrócić się do właściwego Wojewódzkiego Inspektoratu Inspekcji Handlowej lub Stałego Polubownego Sądu Konsumenckiego. Informacje o dostępnych metodach są dostępne na stronie Urzędu Ochrony Konkurencji i Konsumentów: <a href="https://www.uokik.gov.pl" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">www.uokik.gov.pl</a>.</p>
              <p className="mt-3">Realizator Usługi preferuje rozwiązywanie sporów w drodze bezpośredniego kontaktu z Klientem.</p>
            </section>

            <div className="border-t border-gray-100 dark:border-gray-800 pt-4 mt-6">
              <p className="text-xs text-gray-400 dark:text-gray-600 text-center">Regulamin obowiązuje od dnia 08.03.2026 r. <i>(Aktualizacja wchodzi z dniem 19.06.2026 r.)</i></p>
            </div>

          </div>
        </div>
      </div>
    </main>
  )
}

