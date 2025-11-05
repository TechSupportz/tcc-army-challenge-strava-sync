import { env } from "cloudflare:workers"

const escapeHtml = (value: string) =>
	value.replace(
		/[&<>"'`=\/]/g,
		char =>
			({
				"&": "&amp;",
				"<": "&lt;",
				">": "&gt;",
				'"': "&quot;",
				"'": "&#39;",
				"`": "&#96;",
				"=": "&#61;",
				"/": "&#47;",
			}[char] as string),
	)

export const generateManualRefreshHtml = (
	updatedRecords: Record<string, number>[],
	errorMessage?: string,
) => {
	const sheetUrl = `https://docs.google.com/spreadsheets/d/${env.GOOGLE_SHEETS_ID || ""}`

	if (errorMessage) {
		return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8" />
	<title>Manual Refresh</title>
	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
	<link href="https://fonts.googleapis.com/css2?family=Inter+Tight:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet">
	<style>
		body { font-family: "Inter Tight", system-ui, sans-serif; font-optical-sizing: auto; padding: 2rem; background: #fafafa; }
		.container { max-width: 600px; margin: 0 auto; }
		h1 { margin-bottom: 0.5rem; color: #ff660c; }
		.summary { font-weight: 600; color: #ff660c; margin: 0; margin-bottom: 1.2rem; }
		.summary.error { color: #b3261e; }
		.button { width: 80%; display: inline-block; padding: 0.6rem 1.2rem; border-radius: 6px; background: #fc4c02; color: #ffebd3; text-decoration: none; font-weight: 700; text-align: center; }
		.flex-container { display: flex; flex-direction: column; width: 100%; align-items: center; gap: 1rem; }
	</style>
</head>
<body>
	<div style="text-align:center; margin-bottom:1rem; font-size:0.95rem;">
		<a href="https://tnitish.com/" target="_blank" rel="noopener noreferrer" style="font-family: 'Inter Tight', system-ui, sans-serif; font-weight:700; color: rgba(30,64,175,0.5); text-decoration: underline; display: inline-block;">
			built by nitish
		</a>
	</div>
	<div class="container">
		<h1>⚠️ Strava Sync Failed</h1>
		<p class="summary error">${escapeHtml(errorMessage ?? "Unknown error")}</p>
		<div class="flex-container">
			<a class="button" href="${sheetUrl}" target="_self" rel="noopener noreferrer">⎋ Open Google Sheets</a>
		</div>
	</div>
</body>
</html>`
	}

	const entries = updatedRecords.flatMap(record => Object.entries(record))
	const rowsUpdated = entries.length

	if (rowsUpdated === 0) {
		return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8" />
	<title>Manual Refresh</title>
	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
	<link href="https://fonts.googleapis.com/css2?family=Inter+Tight:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet">
	<style>
		body { font-family: "Inter Tight", system-ui, sans-serif; font-optical-sizing: auto; padding: 2rem; background: #fafafa; }
		.container { max-width: 600px; margin: 0 auto; }
		h1 { margin-bottom: 0.5rem; color: #ff660c; }
		.summary { font-weight: 600; color: #ff660c; margin: 0; margin-bottom: 1.2rem; }
		.empty-state { width: 100%; background: #fff6ec; border: 1.5px solid #ffd3a6; color: #460f04; border-radius: 6px; padding: 1rem; font-weight: 500; text-align: center; }
		.button { width: 80%; display: inline-block; padding: 0.6rem 1.2rem; border-radius: 6px; background: #fc4c02; color: #ffebd3; text-decoration: none; font-weight: 700; text-align: center; }
		.flex-container { display: flex; flex-direction: column; width: 100%; align-items: center; gap: 1rem; }
	</style>
</head>
<body>
	<div style="text-align:center; margin-bottom:1rem; font-size:0.95rem;">
		<a href="https://tnitish.com/" target="_blank" rel="noopener noreferrer" style="font-family: 'Inter Tight', system-ui, sans-serif; font-weight:700; color: rgba(30,64,175,0.5); text-decoration: underline; display: inline-block;">
			built by nitish
		</a>
	</div>
	<div class="container">
		<h1>🤷‍♂️ No Updates This Time</h1>
		<p class="summary">No new mileage entries were detected.</p>
		<div class="flex-container">
			<div class="empty-state">Try again later once new Strava activities are posted.</div>
			<a class="button" href="${sheetUrl}" target="_self" rel="noopener noreferrer">⎋ Open Google Sheets</a>
		</div>
	</div>
</body>
</html>`
	}

	return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8" />
	<title>Manual Refresh</title>
	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
	<link href="https://fonts.googleapis.com/css2?family=Inter+Tight:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet">
	<style>
		body { font-family: "Inter Tight", system-ui, sans-serif; font-optical-sizing: auto; padding: 2rem; background: #fafafa; }
		.container { max-width: 600px; margin: 0 auto; }
		h1 { margin-bottom: 0.5rem; color: #ff660c; }
		.summary { font-weight: 600; color: #ff660c; margin: 0; margin-bottom: 1.2rem; }
		.monospace { font-family: monospace; }
		ul { width: 100%; list-style: none; padding: 0; margin: 0; }
		li { background: #fff6ec; border: 1.5px solid #ffd3a6; color: #460f04; border-radius: 6px; padding: 0.75rem; margin-bottom: 0.5rem; display: flex; justify-content: space-between; font-weight: 500; font-size: 1.1rem; }
		.list-name { font-weight: 700; }
		.button { width: 80%; display: inline-block; padding: 0.6rem 1.2rem; border-radius: 6px; background: #fc4c02; color: #ffebd3; text-decoration: none; font-weight: 700; text-align: center; }
		.flex-container { display: flex; flex-direction: column; width: 100%; align-items: center; gap: 1.2rem; }
	</style>
</head>
<body>
	<div style="text-align:center; margin-bottom:1rem; font-size:0.95rem;">
		<a href="https://tnitish.com/" target="_blank" rel="noopener noreferrer" style="font-family: 'Inter Tight', system-ui, sans-serif; font-weight:700; color: rgba(30,64,175,0.5); text-decoration: underline; display: inline-block;">
			built by nitish
		</a>
	</div>
	<div class="container">
		<h1>✅ Strava Sync Successful</h1>
		<p class="summary">Rows updated: ${rowsUpdated}</p>
		<div class="flex-container">
			<ul>
				${entries
					.map(
						([name, mileage]) =>
							`<li><span class="list-name">${escapeHtml(name.slice(0, -1))}</span>
							<div>
							<span class="monospace">+${Number(mileage).toFixed(2)}</span> km
							</div>
							</li>`,
					)
					.join("")}
			</ul>
			<a class="button" href="${sheetUrl}" target="_self" rel="noopener noreferrer">⎋ Open Google Sheets</a>
		</div>
	</div>
</body>
</html>`
}
