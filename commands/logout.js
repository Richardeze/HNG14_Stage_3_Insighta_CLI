const ora = require('ora');
const chalk = require('chalk');
const axios = require('axios');
const { loadCredentials, clearCredentials, isLoggedIn } = require('../lib/auth');

const BACKEND_URL = process.env.BACKEND_URL || 'http://127.0.0.1:8000';

async function logout() {
  if (!isLoggedIn()) {
    console.log(chalk.yellow('You are not logged in.'));
    return;
  }

  const spinner = ora('Logging out...').start();
  const creds = loadCredentials();

  try {
    await axios.post(`${BACKEND_URL}/auth/logout`, {
      refresh_token: creds.refresh_token,
    });
  } catch {
    // Even if server request fails, clear local credentials
  }

  clearCredentials();
  spinner.succeed(chalk.green('Logged out successfully.'));
}

module.exports = { logout };