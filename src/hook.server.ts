import { GOOGLE_AUTH_TOKEN, METADATA_SHEET } from '$env/static/private'
import type { OAuth2Client } from 'google-auth-library'
// import authorize from '$lib/server/auth.ts'
import { google } from 'googleapis'
const auth = <OAuth2Client> google.auth.fromJSON(JSON.parse(GOOGLE_AUTH_TOKEN))
export const sheets = google.sheets({ version: 'v4', auth }).spreadsheets.values
export const drive = google.drive({ version: 'v3', auth }).files
export const docs = google.docs({ version: 'v1', auth }).documents

type NameMap = { [k: string]: [string, string] }
type Person = [string, string] | null
export type Job = { [k: string]: Person[] }

const [{data: {values: __metadata}}, {data: {values: __nameMap}}] = await Promise.all([
  sheets.get({ spreadsheetId: METADATA_SHEET, range: 'metadata!A2:B' }),
  sheets.get({ spreadsheetId: METADATA_SHEET, range: `รายชื่อ!A2:C` }),
])

const _metadata = __metadata?.reduce<{[k: string]: string}>((prev, e) => Object.assign(prev, { [e[0]]: e[1] }), {})
if (!_metadata) throw 'metadata not found'
if (![
  _metadata['Weekday - spreadsheet'],
  _metadata['Weekday - sheetname'],
  _metadata['Weekend - spreadsheet'],
  _metadata['Weekend - sheetname'],
  _metadata['Response - spreadsheet'],
  _metadata['Response - sheetname'],
  _metadata['Response - oneday'],
  _metadata['Template - 1'],
  _metadata['Template - 2'],
  _metadata['Template - 3'],
  _metadata['Template - 6'],
  _metadata['Template - 7'],
  _metadata['Template - 8'],
].every(e => e?.length)) throw 'missing some metadata'

const _nameMap = __nameMap?.reduce<NameMap>((prev, e) => Object.assign<NameMap, NameMap>(prev, { [e[0]]: [e[1], e[2]] }), {})
if (!_nameMap) throw 'missing name table'

export const metadata = _metadata, nameMap = _nameMap
export const responseSpreadsheet = metadata['Response - spreadsheet']
export const responseSheetname = metadata['Response - sheetname']
export const responseOneday = metadata['Response - oneday']
export const template = [
  '',
  metadata['Template - 1'],
  metadata['Template - 2'],
  metadata['Template - 3'],
  '',
  '',
  metadata['Template - 6'],
  metadata['Template - 7'],
  metadata['Template - 8'],
]
