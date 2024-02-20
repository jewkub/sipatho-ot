// https://developers.google.com/gmail/api/quickstart/nodejs

import { promises as fs } from 'node:fs';
import { join } from 'node:path';
import { cwd } from 'process';
import { authenticate } from '@google-cloud/local-auth';
import { google } from 'googleapis';
import type { OAuth2Client } from 'google-auth-library';

// If modifying these scopes, delete token.json.
const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/documents'
];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = join(cwd(), 'token.json');
const CREDENTIALS_PATH = join(cwd(), 'credentials.json');

// Manually add token file by import for build in Vite
import { GOOGLE_AUTH_TOKEN } from '$env/static/private';

/**
 * Reads previously authorized credentials from the save file.
 *
 * @return {Promise<OAuth2Client|null>}
 */
async function loadSavedCredentialsIfExist() {
  try {
    // use manually added credentials
    // const content = await fs.readFile(TOKEN_PATH);
    // const credentials = JSON.parse(content.toString());
    const credentials = JSON.parse(GOOGLE_AUTH_TOKEN)
    return <OAuth2Client> google.auth.fromJSON(credentials);
  } catch (err) {
    return null;
  }
}

/**
 * Serializes credentials to a file compatible with GoogleAUth.fromJSON.
 *
 * @param {OAuth2Client} client
 * @return {Promise<void>}
 */
async function saveCredentials(client: OAuth2Client) {
  const content = await fs.readFile(CREDENTIALS_PATH);
  const keys = JSON.parse(content.toString());
  const key = keys.installed || keys.web;
  const payload = JSON.stringify({
    type: 'authorized_user',
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials.refresh_token,
  });
  await fs.writeFile(TOKEN_PATH, payload);
}

/**
 * Load or request or authorization to call APIs.
 *
 */
async function authorize() {
  let client = await loadSavedCredentialsIfExist();
  if (client) {
    return client;
  }
  client = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
  });
  if (client.credentials) {
    await saveCredentials(client);
  }
  return client;
}

/**
 * Lists the labels in the user's account.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 *
async function listLabels(auth) {
  const gmail = google.gmail({version: 'v1', auth});
  const res = await gmail.users.labels.list({
    userId: 'me',
  });
  const labels = res.data.labels;
  if (!labels || labels.length === 0) {
    console.log('No labels found.');
    return;
  }
  console.log('Labels:');
  labels.forEach((label) => {
    console.log(`- ${label.name}`);
  });
}


authorize().catch(console.error);*/

export default authorize
