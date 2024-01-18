// import { error } from '@sveltejs/kit';
import { TIMEZONE } from '$env/static/private'
import type { RequestHandler } from './$types.d.ts'
import { weekday, weekend, type Job } from '../../hook.server.ts'

export type Data = {
  now: Date,
  today: string,
  isWeekend: boolean,
  list: string[],
  job: Job,
}

export const GET: RequestHandler = () => {
  const now = new Date()
  const date = new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'short',
    timeZone: TIMEZONE
  }).formatToParts(now)

  let job = weekday[+date[0].value]
  const isWeekend = job === undefined
  if (isWeekend) job = weekend[+date[0].value]
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
