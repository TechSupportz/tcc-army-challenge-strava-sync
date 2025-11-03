/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.jsonc`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import { DateTime } from 'luxon';
import { getGoogleSheetData } from './auth/google-sheet-auth';
import { getAccessToken } from './auth/strava-auth';
import { getRowLabelFromDate } from './date-mapping';

export default {
	async fetch(request, env, ctx): Promise<Response> {
		const currentDate = DateTime.now().startOf('day');
		const accessToken = await getAccessToken();

		const currentDateMapping = getRowLabelFromDate(currentDate);
		console.log('>>> Current Date Mapping:', currentDateMapping);

		const armyMarathonDocData = getGoogleSheetData(env, env.GOOGLE_SHEETS_ID);
		await armyMarathonDocData.loadInfo();

		const sheet = armyMarathonDocData.sheetsByIndex[0];
		const rows = await sheet.getRows();

		const nameList = rows.map((row) => row.get('NAME'));

		return new Response(
			JSON.stringify({
				currentDate: currentDate.toISO(),
				currentDateMapping,
				accessToken,
			}),
			{ status: 200, headers: { 'Content-Type': 'application/json' } }
		);
	},
} satisfies ExportedHandler<Env>;
