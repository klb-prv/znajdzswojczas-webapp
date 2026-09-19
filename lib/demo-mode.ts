// Konto demo (login "demo", hasło "demo") - tryb pokazowy panelu partnera:
// - nie można zlecać wypłat (przycisk zablokowany + blokada po stronie API)
// - własny kod promocyjny tworzony na max 3% zamiast 15%

export const DEMO_AFFILIATE_LOGIN = 'demo'
export const DEMO_CODE_DISCOUNT_PERCENT = 3
export const SELF_CODE_DISCOUNT_PERCENT = 15

export function isDemoAffiliate(login: string | null | undefined): boolean {
  return (login ?? '').toLowerCase().trim() === DEMO_AFFILIATE_LOGIN
}

export function codeDiscountPercent(login: string | null | undefined): number {
  return isDemoAffiliate(login) ? DEMO_CODE_DISCOUNT_PERCENT : SELF_CODE_DISCOUNT_PERCENT
}
