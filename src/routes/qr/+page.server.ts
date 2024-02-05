import type { PageServerLoad } from './$types.d.ts';

export const load: PageServerLoad = async ({ cookies }) => {
  const id = cookies.get('id')
  return { id: id || '' }
}
