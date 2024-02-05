import type { RequestHandler } from './$types.d.ts'
import { redirect } from '@sveltejs/kit'
import qs from 'qs'
import { sheets } from '../../hook.server.ts'
import { responseSheetname, responseSpreadsheet } from '../../hook.server.ts'
import { TIMEZONE } from '$env/static/private'
import { roomList } from '$lib/roomList.ts'
import { CalculateTimeDiff } from '$lib/CalculateTimeDiff.ts'

export const POST: RequestHandler = async ({ request }) => {
  const res = qs.parse(await request.text(), { allowSparse: true })
  console.log(res)
  if (res.work !== undefined && !Array.isArray(res.work)) throw 'invalid work checkbox data'
  if (typeof res.room != 'string') throw 'invalid room data'
  if (typeof res.startTime != 'string' || typeof res.endTime != 'string') throw 'invalid time data'
  const roomNum = roomList.map(e => e.name).indexOf(res.room)
  res.work = res.work?.map<string>((_, i) => roomList[roomNum].work[i]).filter(e => e).join(', ')
  await sheets.append({
    spreadsheetId: responseSpreadsheet,
    range: `${responseSheetname}!A2:J`,
    valueInputOption: 'USER_ENTERED',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { 
      values: [[
        new Intl.DateTimeFormat('en-GB', {
          dateStyle: 'short',
          timeZone: TIMEZONE
        }).format(),
        new Date().toLocaleTimeString('en-GB', { timeZone: 'Asia/Bangkok' }),
        res.sap,
        res.fullname,
        res.startTime + ' น.',
        res.endTime + ' น.',
        CalculateTimeDiff(res.startTime, res.endTime),
        res.room,
        res.work,
        res.amount,
        res.rate,
      ]]
    },
  })
  redirect(303, '/done')
}
