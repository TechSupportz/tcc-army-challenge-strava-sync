export const KV_REFRESH_TOKEN_KEY = "strava_refresh_token"
export const KV_ACCESS_TOKEN_KEY = "strava_access_token"
export const KV_EXPIRES_AT_KEY = "strava_expires_at"
export const KV_LAST_SYNCED_AT_KEY = "last_synced_at"

/*
KV Reset Command
npx wrangler kv key put --binding TCC_ARMY_CHALLENGE_STRAVA_SYNC last_synced_at "2025-10-01T00:00:00+08:00" --local
npx wrangler kv key put --binding TCC_ARMY_CHALLENGE_STRAVA_SYNC last_recorded_activity "{\"resource_state\":2,\"athlete\":{\"resource_state\":2,\"firstname\":\"Joshua\",\"lastname\":\"N.\"},\"name\":\"Evening Run\",\"distance\":3583.9,\"moving_time\":1298,\"elapsed_time\":1301,\"total_elevation_gain\":16.9,\"type\":\"Run\",\"sport_type\":\"Run\",\"workout_type\":null,\"device_name\":\"Strava App\"}" --local

npx wrangler kv key put --binding TCC_ARMY_CHALLENGE_STRAVA_SYNC last_recorded_activity "{\"resource_state\":2,\"athlete\":{\"resource_state\":2,\"firstname\":\"Ryan\",\"lastname\":\"T.\"},\"name\":\"Lunch Run\",\"distance\":2404.1,\"moving_time\":798,\"elapsed_time\":825,\"total_elevation_gain\":13.3,\"type\":\"Run\",\"sport_type\":\"Run\",\"workout_type\":0,\"device_name\":\"Strava App\"}" --local
*/
