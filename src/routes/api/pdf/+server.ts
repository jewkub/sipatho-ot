import type { RequestHandler } from './$types.d.ts'
import { drive, docs, sheets, responseSpreadsheet, responseOneday, template } from '../../../hook.server.ts'
import { PUBLIC_TIMEZONE } from '$env/static/public'

export const GET: RequestHandler = async ({ url }) => {
  const yesterday = new Date(new Date().valueOf() - 1000 * 60 * 60 * 24)
  const templateNum = +(url.searchParams.get('template') || 0)
  const day = url.searchParams.get('d') || yesterday.toLocaleDateString('th-TH', { day: 'numeric', timeZone: PUBLIC_TIMEZONE })
  const month = url.searchParams.get('m') || yesterday.toLocaleDateString('th-TH', { month: 'long', timeZone: PUBLIC_TIMEZONE })
  const year = url.searchParams.get('y') || yesterday.toLocaleDateString('th-TH', { year: 'numeric', timeZone: PUBLIC_TIMEZONE }).split(' ')[1]
  const start = +(url.searchParams.get('start') || 1)
  const end = +(url.searchParams.get('end') || 99)

  if (!templateNum) throw 'invalid template'
  const [{ data: { values: data } }, { data: doc }, { data: tempFile }] = await Promise.all([
    sheets.get({
      spreadsheetId: responseSpreadsheet,
      range: `${responseOneday}!A1:L`
    }),
    docs.get({ documentId: template }),
    drive.copy({
      fileId: template,
      requestBody: { name: 'e-ใบเบิกค่าตอบแทน' }
    }),
  ])
  if (!data) throw 'Empty response sheet'
  if (!tempFile.id) throw 'Cannot create temp file'
  const tableIndex: number[][] = []
  doc.body!.content![8].table!.tableRows!.forEach((row, i) => {
    if (i == 0) return;
    tableIndex[i - 1] = []
    row.tableCells!.forEach((cell, j) => {
      tableIndex[i - 1][j] = cell.content![0].paragraph!.elements![0].startIndex!
    })
  })
  const insertList = [
    {
      text: year,
      location: { index: doc.body!.content![7].paragraph!.elements![7].startIndex! + 3 }
    },
    {
      text: month,
      location: { index: doc.body!.content![7].paragraph!.elements![5].startIndex! + 3 }
    },
    {
      text: day,
      location: { index: doc.body!.content![7].paragraph!.elements![3].startIndex! + 3 }
    },
    {
      text: day,
      location: { index: doc.body!.content![7].paragraph!.elements![1].startIndex! + 3 }
    },
    {
      text: `(${templateNum})`,
      location: { index: 237 }
    },
    {
      text: templateNum <= 3 ? '4/2563' : '4/2566',
      location: { index: 222 }
    },
  ]
  let cnt = 0
  for (let row of data) {
    if (row[11] != templateNum) continue
    if (cnt + 1 < start) {
      cnt++
      continue
    }
    if (cnt + 1 > end) break
    const data = [
      row[0],
      row[2],
      row[3],
      row[4],
      row[3].split(' ')[1],
      row[5],
      row[3].split(' ')[1],
      `${row[6].split(' ')[0] || '0'}${row[6].split(' ')[2] ? '.5' : ''}`,
      row[10],
      row[8] && row[9] ? row[8] + ' / ' + row[9] : row[8] + row[9],
    ]
    data.forEach((cell, j) => {
      if (cell) insertList.unshift({
        text: cell,
        location: { index: tableIndex[cnt - start + 1][j] }
      })
    })
    cnt++
  }

  try {
    await docs.batchUpdate({
      documentId: tempFile.id,
      requestBody: { requests: insertList.map(e => ({ insertText: e })) },
    })
    const pdfBlob = (await drive.export({
      fileId: tempFile.id,
      mimeType: 'application/pdf',
    }, { responseType: 'stream' })).data as unknown as ReadableStream // https://github.com/DefinitelyTyped/DefinitelyTyped/discussions/65542#discussioncomment-6071004
    const today = new Intl.DateTimeFormat('en-GB', {
      timeZone: PUBLIC_TIMEZONE,
    }).format().replaceAll('/', '.')
    const filename = encodeURI(`ใบเบิกค่าตอบแทน-${templateNum}-${today}.pdf`)
    return new Response(pdfBlob, {
      headers: { "Content-Disposition": `inline; filename=${filename}` },
    })
  } catch (e) {
    let msg
    if (typeof e == 'string') msg = e
    else if (e instanceof Error) msg = e.message
    console.error(msg)
    return new Response(msg)
  } finally {
    drive.delete({ fileId: tempFile.id })
  }
}
