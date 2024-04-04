import type { RequestHandler } from './$types.d.ts'
import { getTodayQrHmac } from '$lib/server/crypto.ts'
import { qrRoomList } from '../../../hook.server.ts'

const validateId = (id: string) => {
  if (qrRoomList.find(e => e == id)) return true
  return false
}

export const GET: RequestHandler = async ({ cookies, url }) => {
  const id = url.searchParams.get('id') ?? ''
  if (!validateId(id)) return new Response('')
  cookies.set('id', id, { path: '/', maxAge: 34560000 })
  const urlOutput = new URL('/form?code=' + getTodayQrHmac(), url.origin).href
  return new Response(urlOutput, {
    headers: { 'Cache-Control': 'no-cache' },
  })
}
