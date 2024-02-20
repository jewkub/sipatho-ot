import { generateRandomId } from '$lib/server/crypto.ts'
import { responseSpreadsheet, sheets } from '../../../hook.server.ts'
import type { Actions } from './$types.d.ts'
import { redirect } from '@sveltejs/kit'
import qs from 'qs'

// export const POST: RequestHandler = async ({ request }) => {
//   const res = qs.parse(await request.text(), { allowSparse: true })
//   console.log(res)
//   redirect(303, '/done')
// }
export const actions = {
	default: async ({ cookies, request }) => {
		const res = qs.parse(await request.text(), { allowSparse: true })
		if (typeof res.deviceName !== 'string') throw 'invalid deviceName'
		console.log(res)
		const randomId = generateRandomId()
		const id = cookies.get('id')
		if (!id) {
			console.log('assigned with ' + randomId)
			// https://httpwg.org/http-extensions/draft-ietf-httpbis-rfc6265bis.html#name-the-expires-attribute
			cookies.set('id', randomId, { path: '/', maxAge: 34560000 })
		}
		cookies.set('name', res.deviceName, { path: '/', maxAge: 34560000 })
		await sheets.append({
			spreadsheetId: responseSpreadsheet,
			range: 'register!A2:C',
			valueInputOption: 'USER_ENTERED',
			insertDataOption: 'INSERT_ROWS',
			requestBody:{
				values: [[id || randomId, res.deviceName, new Date().toString()]]
			}
		})
		redirect(303, '/done')
	},
} satisfies Actions
