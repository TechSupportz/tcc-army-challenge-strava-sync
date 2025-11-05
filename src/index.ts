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

import { DateTime } from "luxon"
import { getGoogleSheetData } from "./auth/google-sheet-auth"
import { calculateMileage } from "./sheets/calculate-mileage"
import { getRowLabelFromDate } from "./sheets/date-mapping"
import { writeMileageToSheet } from "./sheets/write-value"
import { fetchNewClubActivities } from "./strava/fetch-club-activities"
import { generateManualRefreshHtml } from "./generate-manual-refresh-html"

async function syncStravaActivities(env: Env) {
	const currentDate = DateTime.now().startOf("day")

	const armyMarathonDocData = getGoogleSheetData(env, env.GOOGLE_SHEETS_ID)
	await armyMarathonDocData.loadInfo()

	const sheet = armyMarathonDocData.sheetsByIndex[0]
	const rows = await sheet.getRows()

	const currentDateLabel = getRowLabelFromDate(currentDate)
	const nameList = rows.map(row => row.get("NAME"))
	const newClubActivities = await fetchNewClubActivities()
	const calculatedMileage = calculateMileage(newClubActivities)

	await writeMileageToSheet(sheet, rows, calculatedMileage, currentDateLabel, nameList)

	return {
		success: true,
		updated: { count: Object.keys(calculatedMileage).length, data: calculatedMileage },
		date: currentDateLabel,
		timestamp: DateTime.now().toISO(),
	}
}

export default {
	async fetch(request, env, ctx): Promise<Response> {
		try {
			const result = await syncStravaActivities(env)

			return new Response(generateManualRefreshHtml(result.updated.data), {
				status: 200,
				headers: { "Content-Type": "text/html;charset=UTF-8" },
			})
		} catch (error) {
			console.error("Error syncing Strava activities:", error)

			return new Response(
				generateManualRefreshHtml(
					[],
					error instanceof Error ? error.message : String(error),
				),
				{
					status: 500,
					headers: { "Content-Type": "text/html;charset=UTF-8" },
				},
			)
		}
	},

	async scheduled(event, env, ctx): Promise<void> {
		console.log("Scheduled task triggered at:", new Date(event.scheduledTime).toISOString())

		try {
			const result = await syncStravaActivities(env)
			console.log("Scheduled sync completed successfully:", result)
		} catch (error) {
			console.error("Error in scheduled sync:", error)
			throw error
		}
	},
} satisfies ExportedHandler<Env>
