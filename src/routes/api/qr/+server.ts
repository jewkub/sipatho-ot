import type { RequestHandler } from './$types.d.ts'
import { getTodayQrHmac } from '$lib/server/crypto.ts'

const qrRoomList = [
  'X4PeFfsqWesqogdd3sqqcb2ztH0', // my pc
  'vc9sVNc59X10rovDMKhGDZz1g_4',
  'lN1gDeDxOGZDCzAxpiH0NLKN0hI',
  'FyYW2pQ1EXBNQ6MKmegkD5r_gFo',
  'cuCC_e6_FLIsnVH2W3eMT-4Gnck',
  'N-SX9yTBezCZ2eVa6Vg4TY6SGz4',
  '9yFb8n4q1XOpNVsZzuKq1ZL-lpo',
  'pWkTZTSVCZL7eGRyjFw2w1yU0E4',
  'fARHO2xL1XIXGBNLmkRXpsQyGQw',
  'MTNwZ7JD-UueYL_Gq1iaSKy9l4Y',
  'ae3ACHzHuuKxwC-2Oy__0JrlDzY',
  'lN1gDeDxOGZDCzAxpiH0NLKN0hI',
  'RK_7iMWscAPqpWd8T_0ysBwjnSo',
  'Zd60M8p_UrVmNx8iQm24bsbLNLA',
  'lFsAt2bp3XEqG19KIngjivU9T8o',
  '_Jddqt8-PnTumfiqW9-fTBz9Dfc',
  '94QUvd8psbLEd62lGUCniaBVt4I',
  'f4uv741BQ3QdygziuQwtStgFtq0',
  'Ez3_ID3RdUx_AerkHU2HKZUAiWE',
  'faMlK-MXAK4vUGkP831HzC4P6oc',
  'y6aqDJ8iy1hcBNgym3q7tTVzimA',
  'Og4iy0RUlg3bLnWOuGML0qIsowo',
  'N-SX9yTBezCZ2eVa6Vg4TY6SGz4',
]

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
