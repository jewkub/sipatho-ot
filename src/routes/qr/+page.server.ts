import type { PageServerLoad } from './$types.d.ts';

export const load: PageServerLoad = async ({ cookies }) => {
  const id = cookies.get('id')
	if (id) {
    cookies.set('id', id, { path: '/', maxAge: 34560000 })
    return { id }
  }
  return { id: null }
}
