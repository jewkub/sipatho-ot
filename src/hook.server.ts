import { GOOGLE_AUTH_TOKEN, METADATA_SHEET } from '$env/static/private'
import type { OAuth2Client } from 'google-auth-library'
// import authorize from '$lib/server/auth.ts'
import { auth as _auth } from '@googleapis/oauth2'
const auth = <OAuth2Client> _auth.fromJSON(JSON.parse(GOOGLE_AUTH_TOKEN))
import { sheets as _sheets } from '@googleapis/sheets'
export const sheets = _sheets({ version: 'v4', auth }).spreadsheets.values
import { drive as _drive } from '@googleapis/drive'
export const drive = _drive({ version: 'v3', auth }).files
import { docs as _docs } from '@googleapis/docs'
export const docs = _docs({ version: 'v1', auth }).documents

type NameMap = { [k: string]: [string, string] }
type Person = [string, string] | null
export type Job = { [k: string]: Person[] }

const [{values: __metadata}, {values: __nameMap}] = (await sheets.batchGet({
  spreadsheetId: METADATA_SHEET,
  ranges: ['metadata!A2:B', 'รายชื่อ!A2:C']
})).data.valueRanges!

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
  _metadata['Template'],
].every(e => e?.length)) throw 'missing some metadata'

const _nameMap = __nameMap?.reduce<NameMap>((prev, e) => Object.assign<NameMap, NameMap>(prev, { [e[0]]: [e[1], e[2]] }), {})
if (!_nameMap) throw 'missing name table'

export const metadata = _metadata, nameMap = _nameMap
export const responseSpreadsheet = metadata['Response - spreadsheet']
export const responseSheetname = metadata['Response - sheetname']
export const responseOneday = metadata['Response - oneday']
export const template = metadata['Template']
