import { METADATA_SHEET } from '$env/static/private'
import authorize from '$lib/server/auth.ts'
import { google } from 'googleapis'
const auth = await authorize()
export const sheets = google.sheets({ version: 'v4', auth }).spreadsheets.values

type NameMap = { [k: string]: [string, string] }
type Person = [string, string] | null
export type Job = { [k: string]: Person[] }

export const [metadata, nameMap] = await Promise.all([
  (async () => {
    const _metadata = (await sheets
      .get({ spreadsheetId: METADATA_SHEET, range: 'metadata!A2:B' }))
      .data.values
      ?.reduce<{[k: string]: string}>((prev, e) => Object.assign(prev, { [e[0]]: e[1] }), {})

    if (!_metadata) throw 'metadata not found'
    if (![
      _metadata['Weekday - spreadsheet'],
      _metadata['Weekday - sheetname'],
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
