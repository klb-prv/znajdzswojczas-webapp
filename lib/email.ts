import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

function emailFooter(showCancel = true) {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'https://znajdzswojczas.pl'
  const cancelLink = showCancel
    ? `<span style="color:#d1d5db;font-size:11px">|</span>
      <a href="${base}/anuluj" style="color:#6b7280;font-size:11px;text-decoration:none;margin:0 8px">Anuluj zgłoszenie</a>`
    : ''
  return `
    <hr style="border:none;border-top:1px solid #eee;margin:24px 0"/>
    <p style="text-align:center;margin:0 0 6px 0">
      <a href="${base}/regulamin" style="color:#6b7280;font-size:11px;text-decoration:none;margin:0 8px">Regulamin</a>
      ${cancelLink}
    </p>
    <p style="color:#aaa;font-size:11px;text-align:center;margin:0">Prosimy nie odpowiadać na tę wiadomość.<br/>znajdzswojczas.pl</p>
  `
}

export async function sendVerificationEmail(
  to: string,
  name: string,
  code: string,
  reservationId: string,
  date: string,
  discordNick?: string
) {
  const discordBlock = discordNick
    ? `<div style="background:#5865F2;border-radius:8px;padding:16px;margin:20px 0;color:#fff">
        <p style="margin:0;font-size:14px;font-weight:600">🎮 Kontakt przez Discord</p>
        <p style="margin:8px 0 0 0;font-size:13px">Będziemy się z tobą kontaktować przez Discord na <strong>${discordNick}</strong></p>
       </div>`
    : ''
  await resend.emails.send({
    from: process.env.EMAIL_FROM ?? 'onboarding@resend.dev',
    to,
    subject: 'Potwierdź swoją rezerwację -znajdzswojczas',
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h2>Cześć, ${name}!</h2>
        <p>Otrzymaliśmy Twoje zgłoszenie na dzień <strong>${date}</strong>.</p>
        <p>Aby potwierdzić rezerwację, wpisz poniższy kod na stronie potwierdzenia:</p>
        <div style="font-size:36px;font-weight:bold;letter-spacing:8px;text-align:center;
          padding:24px;background:#f4f4f4;border-radius:8px;margin:24px 0">
          ${code}
        </div>
        <p>Kod jest ważny przez <strong>30 minut</strong>.</p>
        ${discordBlock}
        <p>Jeśli to nie Ty składałeś zgłoszenie, zignoruj tę wiadomość.</p>
        ${emailFooter()}
      </div>
    `,
  })
}

export async function sendConfirmationEmail(
  to: string,
  name: string,
  date: string,
  topic: string,
  reservationId: string
) {
  const shortId = reservationId.slice(0, 8).toUpperCase()

  // Wyciągnij nick Discorda z tematu jeśli występuje
  const discordMatch = topic.match(/\[Kontakt: Discord -(.+?)\]$/)
  const discordNick = discordMatch ? discordMatch[1] : null
  const cleanTopic = topic.replace(/ ?\[Kontakt: Discord -.+?\]$/, '').trim()

  const discordBlock = discordNick
    ? `<div style="background:#5865F2;border-radius:8px;padding:16px;margin:20px 0;color:#fff">
        <p style="margin:0;font-size:14px;font-weight:600">🎮 Kontakt przez Discord</p>
        <p style="margin:8px 0 0 0;font-size:13px">Będziemy się z tobą kontaktować przez Discord na <strong>${discordNick}</strong></p>
       </div>`
    : ''

  await resend.emails.send({
    from: process.env.EMAIL_FROM ?? 'onboarding@resend.dev',
    to,
    subject: 'Potwierdzenie rezerwacji - znajdzswojczas.pl',
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h2>Cześć, ${name}! ✅</h2>
        <p>Twoja rezerwacja została <strong>potwierdzona</strong>.</p>
        <div style="background:#f4f4f4;border-radius:8px;padding:16px;margin:20px 0">
          <p style="margin:0 0 8px 0"><strong>Termin:</strong> ${date}</p>
          <p style="margin:0 0 8px 0"><strong>Temat:</strong> ${cleanTopic}</p>
          <p style="margin:0;font-size:12px;color:#888">Nr zgłoszenia: <code>#${shortId}</code></p>
        </div>
        ${discordBlock}
        <p>Skontaktujemy się z Tobą wkrótce.</p>
        ${emailFooter()}
      </div>
    `,
  })
}

export async function sendCancellationEmail(
  to: string,
  name: string,
  date: string,
  reason: string
) {
  await resend.emails.send({
    from: process.env.EMAIL_FROM ?? 'onboarding@resend.dev',
    to,
    subject: 'Twoja rezerwacja została odwołana',
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h2>Cześć, ${name}!</h2>
        <p>Niestety Twoja rezerwacja na dzień <strong>${date}</strong> została <strong>odwołana</strong>.</p>
        <p><strong>Powód:</strong> ${reason}</p>
        <p>Możesz wybrać nowy termin na naszej stronie.</p>
        ${emailFooter()}
      </div>
    `,
  })
}

export async function sendRescheduleEmail(
  to: string,
  name: string,
  oldDate: string,
  newDate: string,
  reason: string
) {
  await resend.emails.send({
    from: process.env.EMAIL_FROM ?? 'onboarding@resend.dev',
    to,
    subject: 'Twoja rezerwacja została przełożona',
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h2>Cześć, ${name}!</h2>
        <p>Twoja rezerwacja została <strong>przełożona</strong>.</p>
        <p>Poprzedni termin: <strong>${oldDate}</strong></p>
        <p>Nowy termin: <strong>${newDate}</strong></p>
        <p><strong>Powód:</strong> ${reason}</p>
        ${emailFooter()}
      </div>
    `,
  })
}

export async function sendCategoryChangeEmail(
  to: string,
  name: string,
  reservationId: string,
  title: string,
  oldCategory: string,
  newCategory: string,
  reason: string
) {
  const shortId = reservationId.slice(0, 8).toUpperCase()
  await resend.emails.send({
    from: process.env.EMAIL_FROM ?? 'onboarding@resend.dev',
    to,
    subject: `Aktualizacja zgłoszenia: ${title} -#${shortId}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h2>Cześć, ${name}!</h2>
        <p>Uzyskano aktualizację na temat Twojego zgłoszenia:
          <strong>${title}</strong> -<code style="background:#f4f4f4;padding:2px 6px;border-radius:4px">#${shortId}</code>
        </p>
        <div style="background:#f9f9f9;border-left:4px solid #6366f1;padding:16px;margin:20px 0;border-radius:4px">
          <p style="margin:0 0 8px 0"><strong>Zmiana kategorii:</strong></p>
          <p style="margin:0">z <em>${oldCategory}</em> → <strong>${newCategory}</strong></p>
          ${reason ? `<p style="margin:10px 0 0 0;color:#666;font-size:13px">Powód: ${reason}</p>` : ''}
        </div>
        ${emailFooter()}
      </div>
    `,
  })
}

export async function sendCompletionEmail(
  to: string,
  name: string,
  date: string,
  topic: string,
  reservationId: string,
  finalPrice: number,
  paymentDays: number = 14
) {
  const shortId = reservationId.slice(0, 8).toUpperCase()
  const cleanTopic = topic.replace(/ ?\[Kontakt: Discord - .+?\]$/, '').trim()
  const priceFormatted = finalPrice.toLocaleString('pl-PL', { minimumFractionDigits: 2 })

  await resend.emails.send({
    from: process.env.EMAIL_FROM ?? 'onboarding@resend.dev',
    to,
    subject: 'Zgłoszenie zrealizowane - oczekiwanie na płatność',
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h2>Cześć, ${name}! 🎉</h2>
        <p>Twoje zgłoszenie zostało <strong>zrealizowane</strong>.</p>
        <div style="background:#f4f4f4;border-radius:8px;padding:16px;margin:20px 0">
          <p style="margin:0 0 8px 0"><strong>Termin:</strong> ${date}</p>
          <p style="margin:0 0 8px 0"><strong>Temat:</strong> ${cleanTopic}</p>
          <p style="margin:0;font-size:12px;color:#888">Nr zgłoszenia: <code>#${shortId}</code></p>
        </div>
        <div style="background:#22c55e;color:#fff;border-radius:8px;padding:20px;margin:20px 0;text-align:center">
          <p style="margin:0 0 6px 0;font-size:13px;opacity:0.9">Do zapłaty</p>
          <p style="margin:0;font-size:32px;font-weight:bold">${priceFormatted} zł</p>
        </div>
        <div style="background:#fef9c3;border:2px solid #f59e0b;border-radius:8px;padding:16px;margin:20px 0;text-align:center">
          <p style="margin:0;font-size:15px;color:#78350f">
            ⚠️ Termin płatności: <strong style="font-size:20px">do ${paymentDays} dni</strong> od daty wystawienia
          </p>
        </div>
        <p>Prosimy o uregulowanie należności w wyznaczonym terminie. W razie pytań - skontaktuj się z nami.</p>
        <p style="font-size:12px;color:#999">Zgodnie z regulaminem serwisu, w przypadku nieterminowej płatności mogą zostać naliczone odsetki ustawowe za opóźnienie.</p>
        ${emailFooter(false)}
      </div>
    `,
  })
}

export async function sendPaymentConfirmedEmail(
  to: string,
  name: string,
  date: string,
  topic: string,
  reservationId: string,
  finalPrice: number
) {
  const shortId = reservationId.slice(0, 8).toUpperCase()
  const cleanTopic = topic.replace(/ ?\[Kontakt: Discord - .+?\]$/, '').trim()
  const priceFormatted = finalPrice.toLocaleString('pl-PL', { minimumFractionDigits: 2 })

  await resend.emails.send({
    from: process.env.EMAIL_FROM ?? 'onboarding@resend.dev',
    to,
    subject: 'Potwierdzenie otrzymania płatności - dziękujemy! ✅',
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h2>Cześć, ${name}! 🙌</h2>
        <p>Dziękujemy - Twoja płatność została <strong>potwierdzona</strong>. Płatność zakończona</p>
        <div style="background:#f4f4f4;border-radius:8px;padding:16px;margin:20px 0">
          <p style="margin:0 0 8px 0"><strong>Termin:</strong> ${date}</p>
          <p style="margin:0 0 8px 0"><strong>Temat:</strong> ${cleanTopic}</p>
          <p style="margin:0;font-size:12px;color:#888">Nr zgłoszenia: <code>#${shortId}</code></p>
        </div>
        <div style="background:#310b4b;color:#fff;border-radius:8px;padding:20px;margin:20px 0;text-align:center">
          <p style="margin:0 0 6px 0;font-size:13px;opacity:0.9">Opłacono</p>
          <p style="margin:0;font-size:32px;font-weight:bold">${priceFormatted} zł</p>
        </div>
        <p>Dziękujemy za skorzystanie z naszych usług i zapraszamy ponownie!</p>
        ${emailFooter(false)}
      </div>
    `,
  })
}

export async function sendInProgressEmail(
  to: string,
  name: string,
  date: string,
  topic: string,
  reservationId: string,
  estimatedDays: number
) {
  const shortId = reservationId.slice(0, 8).toUpperCase()
  const cleanTopic = topic.replace(/ ?\[Kontakt: Discord - .+?\]$/, '').trim()
  const daysLabel = estimatedDays === 1 ? 'dzień' : 'dni'

  await resend.emails.send({
    from: process.env.EMAIL_FROM ?? 'onboarding@resend.dev',
    to,
    subject: `Twoje zgłoszenie jest w realizacji - termin ${estimatedDays} ${daysLabel}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h2>Cześć, ${name}! 🚀</h2>
        <p>Twoje zgłoszenie jest już <strong>w realizacji</strong>.</p>
        <div style="background:#f4f4f4;border-radius:8px;padding:16px;margin:20px 0">
          <p style="margin:0 0 8px 0"><strong>Termin:</strong> ${date}</p>
          <p style="margin:0 0 8px 0"><strong>Temat:</strong> ${cleanTopic}</p>
          <p style="margin:0;font-size:12px;color:#888">Nr zgłoszenia: <code>#${shortId}</code></p>
        </div>
        <div style="background:#3b82f6;color:#fff;border-radius:8px;padding:20px;margin:20px 0;text-align:center">
          <p style="margin:0 0 4px 0;font-size:13px;opacity:0.9">Szacowany czas realizacji</p>
          <p style="margin:0;font-size:36px;font-weight:bold">${estimatedDays} ${daysLabel}</p>
        </div>
        <p>Pracujemy nad Twoim zleceniem. W razie pytań skontaktujemy się z Tobą.</p>
        ${emailFooter()}
      </div>
    `,
  })
}
