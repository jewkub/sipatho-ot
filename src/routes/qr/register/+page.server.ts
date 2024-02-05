import { generateRandomId } from '$lib/server/crypto.ts'
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
		console.log(res)
		if (!cookies.get('id')) {
			const randomId = generateRandomId()
			console.log('assigned with ' + randomId)
			// https://httpwg.org/http-extensions/draft-ietf-httpbis-rfc6265bis.html#name-the-expires-attribute
			cookies.set('id', randomId, { path: '/', maxAge: 34560000 })
			redirect(303, '/done')
		}
		return { success: false }
	},
} satisfies Actions
