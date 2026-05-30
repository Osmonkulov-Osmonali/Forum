import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";

/**
 * Returns the first sheet of the configured Google Spreadsheet,
 * authenticated via a Service Account (JWT).
 *
 * Required env vars:
 *   GOOGLE_SERVICE_ACCOUNT_EMAIL  — service account email
 *   GOOGLE_PRIVATE_KEY            — private key (with literal \n or real newlines)
 *   GOOGLE_SHEET_ID               — spreadsheet ID from the URL
 */
export async function getRegistrationSheet() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const rawKey = process.env.GOOGLE_PRIVATE_KEY;
  const sheetId = process.env.GOOGLE_SHEET_ID;

  if (!email || !rawKey || !sheetId) {
    throw new Error(
      "Missing Google Sheets env vars: GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY, GOOGLE_SHEET_ID"
    );
  }

  // Private keys stored in env vars often have escaped newlines — fix them.
  const privateKey = rawKey.replace(/\\n/g, "\n");

  const auth = new JWT({
    email,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const doc = new GoogleSpreadsheet(sheetId, auth);
  await doc.loadInfo();

  return doc.sheetsByIndex[0];
}

/** Shape of a single registration row appended to the sheet. */
export type SheetRow = {
  "Дата регистрации": string;
  "Имя": string;
  "Фамилия": string;
  "Email": string;
  "Телефон": string;
  "Формат": string;
};
