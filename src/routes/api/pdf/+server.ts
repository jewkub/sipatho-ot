import type { RequestHandler } from './$types.d.ts'
import type { docs_v1 } from '@googleapis/docs'
import { drive, docs, sheets, responseSpreadsheet, responseOneday, template } from '../../../hook.server.ts'
import { TIMEZONE } from '$env/static/private'

export const GET: RequestHandler = async ({ url }) => {
  const templateNum = +(url.searchParams.get('template') || 0)
  if (!templateNum) throw 'invalid template'
  const [{data: {values: data}}, {data: doc}, {data: tempFile}] = await Promise.all([
    sheets.get({
      spreadsheetId: responseSpreadsheet,
      range: `${responseOneday}!A1:L`
    }),
    docs.get({ documentId: template[templateNum] }),
    drive.copy({
      fileId: template[templateNum],
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
  const updateList: docs_v1.Schema$Request[] = []
  const yesterday = new Date(new Date().valueOf() - 1000 * 60 * 60 * 24)
  updateList.unshift({
    insertText: {
      text: yesterday.toLocaleDateString('th-TH', { day: 'numeric', timeZone: TIMEZONE }),
      location: { index: doc.body!.content![7].paragraph!.elements![1].startIndex! + 3 }
    }
  })
  updateList.unshift({
    insertText: {
      text: yesterday.toLocaleDateString('th-TH', { day: 'numeric', timeZone: TIMEZONE }),
      location: { index: doc.body!.content![7].paragraph!.elements![3].startIndex! + 3 }
    }
  })
  updateList.unshift({
    insertText: {
      text: yesterday.toLocaleDateString('th-TH', { month: 'long', timeZone: TIMEZONE }),
      location: { index: doc.body!.content![7].paragraph!.elements![5].startIndex! + 3 }
    }
  })
  updateList.unshift({
    insertText: {
      text: yesterday.toLocaleDateString('th-TH', { year: 'numeric', timeZone: TIMEZONE }).split(' ')[1],
      location: { index: doc.body!.content![7].paragraph!.elements![7].startIndex! + 3 }
    }
  })
  let cnt = 0
  data.forEach(row => {
    if (row[11] != templateNum) return ;
    row.splice(11, 1)
    row[9] = row[8] && row[9] ? row[8] + ' / ' + row[9] : row[8] + row[9]
    row[8] = row[10]
    row.splice(10, 1)
    row[7] = '1'
    row.splice(6, 1)
    row.splice(1, 1)
    row.forEach((cell, j) => {
      if (cell) updateList.unshift({
        insertText: {
          text: cell,
          location: { index: tableIndex[cnt][j] }
        }
      })
    })
    cnt++
  })

  try {
    await docs.batchUpdate({
      documentId: tempFile.id,
      requestBody: { requests: updateList },
    })
    const pdfBlob = (await drive.export({
      fileId: tempFile.id,
      mimeType: 'application/pdf',
    }, { responseType: 'stream' })).data as unknown as ReadableStream
    const today = new Intl.DateTimeFormat('en-GB', {
      timeZone: TIMEZONE,
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
