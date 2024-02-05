import { createHmac, randomBytes } from 'node:crypto'
import { QR_HMAC_KEY } from '$env/static/private'

export const getTodayQrHmac = () => {
  const today = new Date().toDateString()
  const qr = createHmac('sha256', QR_HMAC_KEY).update(today).digest('base64url')
  return qr
}

export const generateRandomId = () => {
  return randomBytes(20).toString('base64url')
}
