import { DateTime } from "luxon"

export const getRowLabelFromDate = (date: DateTime) => date.toFormat("d/M")

// rows[0].set(sheetsLabel, "21")
// await rows[0].save()
// return null
