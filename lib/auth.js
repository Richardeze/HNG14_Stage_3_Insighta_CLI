const fs = require('fs');
const path = require('path');
const os = require('os');

// ~/.insighta/credentials.json
const CREDENTIALS_DIR = path.join(os.homedir(), '.insighta');
const CREDENTIALS_FILE = path.join(CREDENTIALS_DIR, 'credentials.json');

function saveCredentials(data) {
  // Create ~/.insighta/ folder if it doesn't exist
  if (!fs.existsSync(CREDENTIALS_DIR)) {
    fs.mkdirSync(CREDENTIALS_DIR, { recursive: true });
  }
  fs.writeFileSync(CREDENTIALS_FILE, JSON.stringify(data, null, 2));
}

function loadCredentials() {
  if (!fs.existsSync(CREDENTIALS_FILE)) {
    return null;
  }
  try {
    const raw = fs.readFileSync(CREDENTIALS_FILE, 'utf8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function clearCredentials() {
  if (fs.existsSync(CREDENTIALS_FILE)) {
    fs.unlinkSync(CREDENTIALS_FILE);
  }
}

function isLoggedIn() {
  const creds = loadCredentials();
  return creds && creds.access_token && creds.refresh_token;
}

module.exports = { saveCredentials, loadCredentials, clearCredentials, isLoggedIn };