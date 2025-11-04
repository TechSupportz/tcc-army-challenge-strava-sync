import { env } from "cloudflare:workers"
import { KV_ACCESS_TOKEN_KEY, KV_EXPIRES_AT_KEY, KV_REFRESH_TOKEN_KEY } from "../kv-binding-keys"
import { DateTime } from "luxon"

interface StravaTokenResponse {
	access_token: string
	refresh_token: string
	expires_at: number
	expires_in: number
	token_type: string
}

interface StravaTokens {
	accessToken: string
	refreshToken: string
	expiresAt: number
}
/**
 * Get access and refresh tokens from Strava using a refresh token
 * Retrieves the refresh token from KV and saves the new tokens back to KV
 */
export const getStravaTokens = async (): Promise<StravaTokens> => {
	// Retrieve the refresh token from KV
	const refreshToken = await env.TCC_ARMY_CHALLENGE_STRAVA_SYNC.get(KV_REFRESH_TOKEN_KEY)

	if (!refreshToken) {
		throw new Error(
			"No refresh token found in KV storage. Please initialize the refresh token first.",
		)
	}

	// Request new tokens from Strava
	const response = await fetch(`${env.STRAVA_BASE_URL}/api/v3/oauth/token`, {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
		},
		body: new URLSearchParams({
			client_id: env.STRAVA_CLIENT_ID,
			client_secret: env.STRAVA_CLIENT_SECRET,
			grant_type: "refresh_token",
			refresh_token: refreshToken,
		}),
	})

	if (!response.ok) {
		const errorText = await response.text()
		throw new Error(`Failed to refresh Strava token: ${response.status} ${errorText}`)
	}

	const data: StravaTokenResponse = await response.json()

	// Save the new tokens to KV
	await Promise.all([
		env.TCC_ARMY_CHALLENGE_STRAVA_SYNC.put(KV_ACCESS_TOKEN_KEY, data.access_token),
		env.TCC_ARMY_CHALLENGE_STRAVA_SYNC.put(KV_REFRESH_TOKEN_KEY, data.refresh_token),
		env.TCC_ARMY_CHALLENGE_STRAVA_SYNC.put(KV_EXPIRES_AT_KEY, data.expires_at.toString()),
	])

	return {
		accessToken: data.access_token,
		refreshToken: data.refresh_token,
		expiresAt: data.expires_at,
	}
}

/**
 * Get a valid access token, refreshing if necessary
 * This function checks if the current token is expired and refreshes it automatically
 */
export async function getAccessToken(): Promise<string> {
	const [accessToken, expiresAtStr] = await Promise.all([
		env.TCC_ARMY_CHALLENGE_STRAVA_SYNC.get(KV_ACCESS_TOKEN_KEY),
		env.TCC_ARMY_CHALLENGE_STRAVA_SYNC.get(KV_EXPIRES_AT_KEY),
	])

	// If we have a token and it's not expired, return it
	if (accessToken && expiresAtStr) {
		const expiresAt = parseInt(expiresAtStr, 10)
		const now = Math.floor(DateTime.now().toSeconds())

		// Add 5 minute buffer before expiration
		if (now < expiresAt - 300) {
			return accessToken
		}
	}

	// If the Token is missing or expired, refresh it
	const tokens = await getStravaTokens()
	return tokens.accessToken
}
