export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

export const PARTNER_PASSWORD_RULES = {
  minLength: 12,
  minUppercase: 1,
  minDigits: 2,
  minSpecial: 3,
}

/** Zwraca komunikat błędu lub null, gdy hasło spełnia wymagania. */
export function validatePartnerPassword(password: string): string | null {
  if (password.length < PARTNER_PASSWORD_RULES.minLength) {
    return `Hasło musi mieć co najmniej ${PARTNER_PASSWORD_RULES.minLength} znaków`
  }
  if ((password.match(/[A-Z]/g) ?? []).length < PARTNER_PASSWORD_RULES.minUppercase) {
    return 'Hasło musi zawierać co najmniej jedną wielką literę'
  }
  if ((password.match(/\d/g) ?? []).length < PARTNER_PASSWORD_RULES.minDigits) {
    return `Hasło musi zawierać co najmniej ${PARTNER_PASSWORD_RULES.minDigits} cyfry`
  }
  if ((password.match(/[^A-Za-z0-9]/g) ?? []).length < PARTNER_PASSWORD_RULES.minSpecial) {
    return `Hasło musi zawierać co najmniej ${PARTNER_PASSWORD_RULES.minSpecial} znaki specjalne`
  }
  return null
}
