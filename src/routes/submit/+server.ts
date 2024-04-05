import type { RequestHandler } from './$types.d.ts'
import { redirect } from '@sveltejs/kit'
import qs from 'qs'
import { sheets } from '../../hook.server.ts'
import { responseSheetname, responseSpreadsheet } from '../../hook.server.ts'
import { PUBLIC_TIMEZONE } from '$env/static/public'
import { roomList } from '$lib/roomList.ts'
import { CalculateTimeDiff } from '$lib/CalculateTimeDiff.ts'
import { getTodayQrHmac } from '$lib/server/crypto.ts'

const after10pm = () => {
  const formatter = new Intl.DateTimeFormat('en-GB', {
    hour: 'numeric',
    timeZone: PUBLIC_TIMEZONE,
  })
  return +formatter.format() >= 22
}

export const POST: RequestHandler = async ({ request }) => {
  if (after10pm()) throw 'form closed today'
  const res = qs.parse(await request.text(), { allowSparse: true })
  if (getTodayQrHmac() !== res.hmac) throw 'invalid hmac'
  if (typeof res.work !== 'string') throw 'invalid work data'
  if (typeof res.room !== 'string') throw 'invalid room data'
  if (typeof res.startTime !== 'string' || typeof res.endTime !== 'string') throw 'invalid time data'
  const roomNum = roomList.map(e => e.name).indexOf(res.room)
  const rate = roomList[roomNum].work[+res.work][1]
  await sheets.append({
    spreadsheetId: responseSpreadsheet,
    range: `${responseSheetname}!A2:L`,
    valueInputOption: 'USER_ENTERED',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { 
      values: [[
        new Intl.DateTimeFormat('en-GB', {
          dateStyle: 'short',
          timeZone: PUBLIC_TIMEZONE
        }).format(),
        new Date().toLocaleTimeString('en-GB', { timeZone: 'Asia/Bangkok' }),
        res.sap,
        res.fullname,
        res.startTime + ' น.',
        res.endTime + ' น.',
        CalculateTimeDiff(res.startTime, res.endTime, res.isWeekend == 'true', { format: true }),
        res.room,
        roomList[roomNum].work[+res.work][0],
        res.amount,
        rate,
        res.room == 'ห้องศพ' ? 3 : ({ 60: 1, 65: 2, 110: 6, 130: 7, 150: 8 })[rate],
      ]]
    },
  })
  redirect(303, '/done')
}
