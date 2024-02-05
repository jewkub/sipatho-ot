import { getTodayQrHmac } from '$lib/server/crypto.ts';
import type { PageServerLoad } from './$types.d.ts';

export const load: PageServerLoad = ({ url }) => {
  const hmacToday = getTodayQrHmac()
	return {
		validHmac: url.searchParams.get('code') === hmacToday,
	}
}
