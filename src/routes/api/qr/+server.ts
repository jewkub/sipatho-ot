import type { RequestHandler } from './$types.d.ts'
import QRCode from 'qrcode'
import { getTodayQrHmac } from '$lib/server/crypto.ts'

const validateId = (id: string | null) => {
  // TODO: condition validate id
  if (id) return true
  return false
}

export const GET: RequestHandler = async ({ url }) => {
  if (!validateId(url.searchParams.get('id'))) return new Response('')
  const urlOutput = new URL('/form?code=' + getTodayQrHmac(), url.origin).href
  console.log(urlOutput)
  const qrUrl = await QRCode.toDataURL(urlOutput, { scale: 24 })
  // const qrBuffer = await QRCode.toBuffer(urlOutput, { scale: 24 })
  return new Response(qrUrl, {
    headers: { 'Cache-Control': 'no-cache' },
  })
}
