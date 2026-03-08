// Edge + Node.js compatible HMAC session tokens

export const SESSION_COOKIE = 'admin_session'
const EXPIRY_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

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
  const secret = process.env.ADMIN_SESSION_SECRET ?? 'dev-insecure-secret-change-me'
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    usage
  )
}

export async function createSessionToken(): Promise<string> {
  const payload = new TextEncoder().encode(
    JSON.stringify({ a: 1, exp: Date.now() + EXPIRY_MS })
  )
  const key = await getHmacKey(['sign'])
  const sig = new Uint8Array(await crypto.subtle.sign('HMAC', key, payload))
  return `${uint8ToBase64url(payload)}.${uint8ToBase64url(sig)}`
}

export async function verifySessionToken(token: string): Promise<boolean> {
  try {
    const dot = token.indexOf('.')
    if (dot === -1) return false
    const payloadBytes = base64urlToUint8(token.slice(0, dot))
    const sig = base64urlToUint8(token.slice(dot + 1))
    const key = await getHmacKey(['verify'])
    const payloadBuf = payloadBytes.buffer.slice(
      payloadBytes.byteOffset,
      payloadBytes.byteOffset + payloadBytes.byteLength
    ) as ArrayBuffer
    const sigBuf = sig.buffer.slice(
      sig.byteOffset,
      sig.byteOffset + sig.byteLength
    ) as ArrayBuffer
    const valid = await crypto.subtle.verify('HMAC', key, sigBuf, payloadBuf)
    if (!valid) return false
    const data = JSON.parse(new TextDecoder().decode(payloadBytes))
    return typeof data.exp === 'number' && data.exp > Date.now()
  } catch {
    return false
  }
}
