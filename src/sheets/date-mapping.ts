import { DateTime } from "luxon"

export const getRowLabelFromDate = (date: DateTime) => date.toFormat("d/M")
