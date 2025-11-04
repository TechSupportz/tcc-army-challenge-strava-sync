import { env } from "cloudflare:workers"
import { DateTime } from "luxon"
import { getAccessToken } from "../auth/strava-auth"
import { isEqual } from "es-toolkit/predicate"

export type StravaClubActivity = {
	resource_state: number
	athlete: {
		resource_state: number
		firstname: string
		lastname: string
	}
	name: string
	distance: number
	moving_time: number
	elapsed_time: number
	total_elevation_gain: number
	type: string
	sport_type: string
	workout_type?: number
	device_name: string
}

const fetchClubActivities = async (clubID: string, accessToken: string, page: number) => {
	const response = await fetch(
		`${env.STRAVA_BASE_URL}/clubs/${clubID}/activities?per_page=50&page=${page}`,
		{
			method: "GET",
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		},
	)

	if (!response.ok) {
		const errorText = await response.text()
		throw new Error(`Failed to fetch club activities: ${response.status} ${errorText}`)
	}

	const data: StravaClubActivity[] = await response.json()
	return data
}

export const fetchNewClubActivities = async () => {
	const clubId = env.STRAVA_TCC_CLUB_ID
	const lastActivity = JSON.parse(
		(await env.TCC_ARMY_CHALLENGE_STRAVA_SYNC.get("last_recorded_activity")) ?? "{}",
	)
	const accessToken = await getAccessToken()

	const clubActivitiesList: StravaClubActivity[] = []

	let currentPage = 1

	while (true) {
		const activities = await fetchClubActivities(clubId, accessToken, currentPage)

		if (activities.length === 0) {
			break
		}

		for (const activity of activities) {
			if (isEqual(activity, lastActivity)) {
				console.log("Reached last recorded activity. Stopping fetch.")

				if (clubActivitiesList.length === 0) {
					console.log("No new activities found.")
					return []
				}

				await env.TCC_ARMY_CHALLENGE_STRAVA_SYNC.put(
					"last_recorded_activity",
					JSON.stringify(clubActivitiesList[0]),
				)
				await env.TCC_ARMY_CHALLENGE_STRAVA_SYNC.put(
					"last_synced_at",
					DateTime.now().toISO(),
				)
				console.log("Recorded last recorded activity and last synced at.")

				return clubActivitiesList
			}

			clubActivitiesList.push(activity)
		}

		currentPage++
	}

	return clubActivitiesList
}
