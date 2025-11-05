import {
	GoogleSpreadsheet,
	GoogleSpreadsheetRow,
	GoogleSpreadsheetWorksheet,
} from "google-spreadsheet"
import { nameMappings } from "../name-mappings"
import { env } from "cloudflare:workers"
import { KV_LAST_SYNCED_AT_KEY } from "../kv-binding-keys"

/**
 * Write mileage values to Google Sheets for each person using cell-based updates
 * @param sheet - The Google Spreadsheet worksheet
 * @param rows - Array of Google Sheet rows
 * @param mileageData - Array of objects with athlete name as key and distance as value
 * @param dateLabel - The column label for the date (e.g., "3/11", "10/11")
 * @param nameList - Ordered list of names from the sheet
 */
export const writeMileageToSheet = async (
	sheet: GoogleSpreadsheetWorksheet,
	rows: GoogleSpreadsheetRow[],
	mileageData: Record<string, number>[],
	dateLabel: string,
	nameList: string[],
) => {
	const mileageMap = new Map<string, number>()

	for (const entry of mileageData) {
		const [stravaName, distance] = Object.entries(entry)[0]

		const fullName = nameMappings[stravaName]

		if (!fullName) {
			console.warn(`No mapping found for Strava name: ${stravaName}`)
			continue
		}

		const currentDistance = mileageMap.get(fullName) || 0
		mileageMap.set(fullName, currentDistance + distance)
	}

	await sheet.loadHeaderRow()
	const headers = sheet.headerValues
	const dateColumnIndex = headers.indexOf(dateLabel)

	if (dateColumnIndex === -1) {
		throw new Error(`Column "${dateLabel}" not found in sheet headers`)
	}

	await sheet.loadCells()

	let updatedCount = 0

	for (let i = 0; i < rows.length; i++) {
		const nameInSheets = nameList[i]

		if (!nameInSheets) {
			continue
		}

		const distance = mileageMap.get(nameInSheets)

		if (distance === undefined) {
			continue
		}

		const rowIndex = i + 1
		const cell = sheet.getCell(rowIndex, dateColumnIndex)

		const existingValue = parseFloat(cell.value?.toString() || "0")
		const updatedDistance = existingValue + distance

		cell.value = parseFloat(updatedDistance.toFixed(2))

		updatedCount++
		console.log(
			`Updated ${nameInSheets}: ${updatedDistance.toFixed(
				2,
			)} km for column ${dateLabel} at row ${rowIndex + 1}`,
		)
	}

	const lastSyncedAt = await env.TCC_ARMY_CHALLENGE_STRAVA_SYNC.get(KV_LAST_SYNCED_AT_KEY)
	if (lastSyncedAt) sheet.getCellByA1("A54").value = lastSyncedAt
	
	await sheet.saveUpdatedCells()

	console.log(`Successfully updated ${updatedCount} cells in column ${dateLabel}`)
}
