import { METADATA_SHEET } from '$env/static/private'
import authorize from '$lib/server/auth.ts'
import { google } from 'googleapis'
const auth = await authorize()
export const sheets = google.sheets({ version: 'v4', auth }).spreadsheets.values
import { roomList, personPerRoom } from '$lib/roomList.ts'

type NameMap = { [k: string]: [string, string] }
type Person = [string, string] | null
export type Job = { [k: string]: Person[] }

const [metadata, nameMap] = await Promise.all([
  (async () => {
    const _metadata = (await sheets
      .get({ spreadsheetId: METADATA_SHEET, range: 'metadata!A2:B' }))
      .data.values
      ?.reduce<{[k: string]: string}>((prev, e) => Object.assign(prev, { [e[0]]: e[1] }), {})

    if (!_metadata) throw 'metadata not found'
    if (![
      _metadata['Weekday - sheetname'],
      _metadata['Weekday - spreadsheet'],
      _metadata['Weekend - spreadsheet'],
      _metadata['Weekend - sheetname'],
      _metadata['Response - spreadsheet'],
      _metadata['Response - sheetname'],
    ].every(e => e?.length)) throw 'missing some metadata'
    return _metadata
  })(),
  (async () => {
    const _nameMap = (await sheets
      .get({ spreadsheetId: METADATA_SHEET, range: `รายชื่อ!A2:C` }))
      .data.values?.reduce<NameMap>((prev, e) => Object.assign<NameMap, NameMap>(prev, { [e[0]]: [e[1], e[2]] }), {})
    
    if (!_nameMap) throw 'missing name table'
    return _nameMap
  })(),
])

export const responseSpreadsheet = metadata['Response - spreadsheet']
export const responseSheetname = metadata['Response - sheetname']

const getJob = async (spreadsheetId: string, range: string, personPerRoom: number[]) => {
  const job = (await sheets
    .get({ spreadsheetId, range }))
    .data.values?.reduce<(Job | undefined)[]>((prev, col) => {
    const totalPerson = personPerRoom.reduce((prev, e) => prev + e)
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
  }, [])

  if (!job) throw 'empty job'
  return job
}

export const [weekday, weekend] = await Promise.all([
  getJob(
    metadata['Weekday - spreadsheet'],
    `${metadata['Weekday - sheetname']}!B3:V`,
    personPerRoom.weekday,
  ).catch(() => { throw 'weekday data error' }),
  getJob(
    metadata['Weekend - spreadsheet'],
    `${metadata['Weekend - sheetname']}!B3:AB`,
    personPerRoom.weekend,
  ).catch(() => { throw 'weekend data error' }),
])
