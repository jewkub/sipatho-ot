import { METADATA_SHEET } from '$env/static/private'
import authorize from '$lib/server/auth.ts';
import { google } from 'googleapis';
const auth = await authorize();
export const sheets = google.sheets({ version: 'v4', auth }).spreadsheets.values;
import { roomList } from '$lib/roomList.ts';

const metadata = (await sheets.get({
  spreadsheetId: METADATA_SHEET,
  range: 'metadata!A2:B',
})).data.values
  ?.reduce<{[k: string]: string}>((prev, e) => Object.assign(prev, { [e[0]]: e[1] }), {})

if (!metadata) throw 'metadata not found'
if (![
  metadata['Weekday - spreadsheet'],
  metadata['Weekday - sheetname'],
  metadata['Weekend - spreadsheet'],
  metadata['Weekend - sheetname'],
  metadata['Response - spreadsheet'],
  metadata['Response - sheetname'],
].every(e => e?.length)) throw 'missing some metadata'
export const responseSpreadsheet = metadata['Response - spreadsheet']
export const responseSheetname = metadata['Response - sheetname']

type NameMap = { [k: string]: [string, string] }
type Person = [string, string] | null
export type Job = { [k: string]: Person[] }

const _nameMap = (await sheets.get({
  spreadsheetId: METADATA_SHEET,
  range: `รายชื่อ!A2:C`,
})).data.values
  ?.reduce<NameMap>((prev, e) => Object.assign<NameMap, NameMap>(prev, { [e[0]]: [e[1], e[2]] }), {})

if (!_nameMap) throw 'missing name table'
export const nameMap = _nameMap

const getJob = async (spreadsheetId: string, range: string, personInRoom: number[]) => {
  const job = (await sheets.get({
    spreadsheetId,
    range,
  })).data.values?.reduce<(Job | undefined)[]>((prev, col) => {
    const totalPerson = personInRoom.reduce((prev, e) => prev + e)
    for (let i = 1; i <= totalPerson; i++) col[i] = col[i] ? nameMap[col[i].trim()] || null : null
    if (col[0]) prev[col[0]] = personInRoom
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

export const weekday = await getJob(
  metadata['Weekday - spreadsheet'],
  `${metadata['Weekday - sheetname']}!B3:V`,
  [2, 1, 7, 1, 2, 0, 4, 0, 0, 2, 0, 0, 1],
).catch(() => { throw 'weekday data error' })

export const weekend = await getJob(
  metadata['Weekend - spreadsheet'],
  `${metadata['Weekend - sheetname']}!B3:AB`,
  [2, 2, 8, 3, 2, 1, 3, 2, 1, 1, 0, 1, 0],
).catch(() => { throw 'weekend data error' })
