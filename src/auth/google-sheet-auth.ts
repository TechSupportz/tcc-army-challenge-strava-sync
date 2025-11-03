import { JWT } from 'google-auth-library';
import { GoogleSpreadsheet } from 'google-spreadsheet';

export const getGoogleSheetData = (env: Env, sheetId: string): GoogleSpreadsheet => {
	const { privateKey } = JSON.parse(env.GOOGLE_PRIVATE_KEY);

	const jwt = new JWT({
		email: env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
		key: privateKey,
		scopes: ['https://www.googleapis.com/auth/spreadsheets'],
	});

	const doc = new GoogleSpreadsheet(sheetId, jwt);

	return doc;
};
