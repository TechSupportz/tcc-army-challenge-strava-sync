import { DateTime } from "luxon"

const dateMappings: Record<string, { start: DateTime; end: DateTime; label: string }> = {
	C: {
		start: DateTime.fromISO("2025-11-03"),
		end: DateTime.fromISO("2025-11-09"),
		label: "03/11 - 09/11",
	},
	D: {
		start: DateTime.fromISO("2025-11-10"),
		end: DateTime.fromISO("2025-11-16"),
		label: "10/11 - 16/11",
	},
	E: {
		start: DateTime.fromISO("2025-11-17"),
		end: DateTime.fromISO("2025-11-23"),
		label: "17/11 - 23/11",
	},
	F: {
		start: DateTime.fromISO("2025-11-24"),
		end: DateTime.fromISO("2025-11-30"),
		label: "24/11 - 30/11",
	},
	G: {
		start: DateTime.fromISO("2025-12-01"),
		end: DateTime.fromISO("2025-12-07"),
		label: "01/12 - 07/12",
	},
	H: {
		start: DateTime.fromISO("2025-12-08"),
		end: DateTime.fromISO("2025-12-14"),
		label: "08/12 - 14/12",
	},
	I: {
		start: DateTime.fromISO("2025-12-15"),
		end: DateTime.fromISO("2025-12-21"),
		label: "15/12 - 21/12",
	},
	J: {
		start: DateTime.fromISO("2025-12-22"),
		end: DateTime.fromISO("2025-12-28"),
		label: "22/12 - 28/12",
	},
}

export const getRowLabelFromDate = (date: DateTime): { row: string; label: string } | null => {
	for (const [row, mapping] of Object.entries(dateMappings)) {
		if (date >= mapping.start && date <= mapping.end) {
			return { row: row, label: mapping.label }
		}
	}

	return null
}
