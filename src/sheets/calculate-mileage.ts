import { StravaClubActivity } from "../strava/fetch-club-activities"

export const calculateMileage = (activities: StravaClubActivity[]): Record<string, number>[] => {
	const distanceByAthlete = new Map<string, number>()

	for (const activity of activities) {
		const { firstname, lastname } = activity.athlete
		const athleteName = `${firstname.toUpperCase()} ${lastname.toUpperCase()}`

		const currentDistance = distanceByAthlete.get(athleteName) || 0

		distanceByAthlete.set(athleteName, currentDistance + activity.distance / 1000)
	}

	const result: Record<string, number>[] = []

	for (const [name, distance] of distanceByAthlete.entries()) {
		result.push({ [name]: distance })
	}

	return result
}
