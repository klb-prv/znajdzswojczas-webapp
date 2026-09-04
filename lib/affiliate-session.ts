export const AFFILIATE_SESSION_COOKIE = 'affiliate_session'
const EXPIRY_MS = 30 * 24 * 60 * 60 * 1000 // 30 days

function uint8ToBase64url(arr: Uint8Array): string {
  let str = ''
  for (let i = 0; i < arr.length; i++) str += String.fromCharCode(arr[i])
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function base64urlToUint8(str: string): Uint8Array {
  const b64 = str.replace(/-/g, '+').replace(/_/g, '/') + '=='.slice((str.length + 3) % 4)
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0))
}

async function getHmacKey(usage: KeyUsage[]): Promise<CryptoKey> {
  const secret = process.env.AFFILIATE_SESSION_SECRET ?? 'dev-affiliate-insecure-secret'
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    usage
  )
}

export async function createAffiliateSession(affiliateId: string): Promise<string> {
  const payload = new TextEncoder().encode(
    JSON.stringify({ id: affiliateId, exp: Date.now() + EXPIRY_MS })
  )
  const key = await getHmacKey(['sign'])
  const sig = new Uint8Array(await crypto.subtle.sign('HMAC', key, payload))
  return `${uint8ToBase64url(payload)}.${uint8ToBase64url(sig)}`
}

export async function verifyAffiliateSession(token: string): Promise<string | null> {
  try {
    const dot = token.indexOf('.')
    if (dot === -1) return null
    const payloadBytes = base64urlToUint8(token.slice(0, dot))
    const sig = base64urlToUint8(token.slice(dot + 1))
    const key = await getHmacKey(['verify'])
    const payloadBuf = payloadBytes.buffer.slice(
      payloadBytes.byteOffset,
      payloadBytes.byteOffset + payloadBytes.byteLength
    ) as ArrayBuffer
    const sigBuf = sig.buffer.slice(sig.byteOffset, sig.byteOffset + sig.byteLength) as ArrayBuffer
    const valid = await crypto.subtle.verify('HMAC', key, sigBuf, payloadBuf)
    if (!valid) return null
    const data = JSON.parse(new TextDecoder().decode(payloadBytes))
    if (typeof data.exp !== 'number' || data.exp <= Date.now()) return null
    return typeof data.id === 'string' ? data.id : null
  } catch {
    return null
  }
}
