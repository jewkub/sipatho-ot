import { PUBLIC_TIMEZONE } from '$env/static/public'
import type { RequestHandler } from './$types.d.ts'
import { type Job, sheets, metadata, nameMap, personPerRoom } from '../../../hook.server.ts'
import { roomList } from '$lib/roomList.ts'

const getJob = async (spreadsheetId: string, range: string, personPerRoom: number[]) => {
  const totalPerson = personPerRoom.reduce((prev, e) => prev + e)
  const job = (await sheets
    .get({ spreadsheetId, range }))
    .data.values?.reduce<{[k: string]: Job | undefined}>((prev, col) => {
      for (let i = 1; i <= totalPerson; i++) col[i] = col[i] ? nameMap[col[i].trim()] || null : null
      if (col[0]) prev[col[0]] = personPerRoom
        .reduce<number[]>((prev, e, i) => {
          prev[i] = i ? prev[i-1] + e : e
          return prev
        }, [])
        .reduce<Job>((prev, e, i, arr) => {
          prev[roomList[i].name] = i ? col.slice(arr[i-1] + 1, e + 1) : col.slice(1, 1 + e)
          return prev
        }, {})
      return prev
    }, {})

  if (!job) throw 'empty job'
  return job
}

export type Data = {
  now: Date,
  today: string,
  isWeekend: boolean,
  list: string[],
  job: Job,
}

export const GET: RequestHandler = async () => {
  const [weekday, weekend] = await Promise.all([
    getJob(
      metadata['Weekday - spreadsheet'],
      `${metadata['Weekday - sheetname']}!A2:BZ`,
      personPerRoom.weekday,
    ).catch(() => { throw 'weekday data error' }),
    getJob(
      metadata['Weekend - spreadsheet'],
      `${metadata['Weekend - sheetname']}!A2:CZ`,
      personPerRoom.weekend,
    ).catch(() => { throw 'weekend data error' }),
  ])

  const now = new Date()
  const date = new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: '2-digit',
    timeZone: PUBLIC_TIMEZONE,
  }).format(now)

  let job = weekday[date]
  const isWeekend = job === undefined
  if (isWeekend) job = weekend[date]
  if (job === undefined) throw 'missing data on this day'
  const output: Data = {
    job,
    now,
    isWeekend,
    today: new Intl.DateTimeFormat('fr-CA').format(now),
    list: Object.keys(job),
  }
	return new Response(JSON.stringify(output))
}
