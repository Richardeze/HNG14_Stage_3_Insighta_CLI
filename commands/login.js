const http = require('http');
const crypto = require('crypto');
const axios = require('axios');
const open = require('open');
const ora = require('ora');
const chalk = require('chalk');
const { saveCredentials } = require('../lib/auth');

const BACKEND_URL = process.env.BACKEND_URL || 'http://127.0.0.1:8000';

// PKCE helper functions
function generateCodeVerifier() {
  // Random 64-byte string, URL-safe base64 encoded
  return crypto.randomBytes(64).toString('base64url');
}

function generateCodeChallenge(verifier) {
  // SHA-256 hash of the verifier, URL-safe base64 encoded
  return crypto.createHash('sha256').update(verifier).digest('base64url');
}

function generateState() {
  return crypto.randomBytes(32).toString('base64url');
}

async function login() {
  const spinner = ora('Starting GitHub login...').start();

  // Step 1: Generate PKCE values
  const state = generateState();
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);

  // Step 2: Find a free port and start local callback server
  const port = 9876;
  const redirectUri = `http://localhost:${port}/callback`;

  let resolveCallback, rejectCallback;
  const callbackPromise = new Promise((res, rej) => {
    resolveCallback = res;
    rejectCallback = rej;
  });

  // Local server that catches GitHub's redirect
  const server = http.createServer((req, res) => {
    const url = new URL(req.url, `http://localhost:${port}`);

    if (url.pathname !== '/callback') {
      res.writeHead(404);
      res.end('Not found');
      return;
    }

    const code = url.searchParams.get('code');
    const returnedState = url.searchParams.get('state');
    const error = url.searchParams.get('error');

    if (error) {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end('<html><body><h2>Login failed. You can close this tab.</h2></body></html>');
      rejectCallback(new Error(`GitHub error: ${error}`));
      return;
    }

    if (returnedState !== state) {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end('<html><body><h2>Invalid state. You can close this tab.</h2></body></html>');
      rejectCallback(new Error('State mismatch — possible CSRF attack'));
      return;
    }

    // Success — show message in browser, resolve with the code
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end('<html><body><h2>Login successful! You can close this tab and return to the terminal.</h2></body></html>');
    resolveCallback(code);
  });

  server.listen(port);

  try {
    // Step 3: Ask backend for the GitHub OAuth URL
    spinner.text = 'Opening GitHub login page...';

    const urlResponse = await axios.get(`${BACKEND_URL}/auth/github/cli`, {
      params: {
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
        redirect_uri: redirectUri,
        state: state,
      },
    });

    const githubUrl = urlResponse.data.url;

    // Step 4: Open the browser
    await open(githubUrl);
    spinner.text = 'Waiting for GitHub authorization... (check your browser)';

    // Step 5: Wait for GitHub to redirect back to our local server
    const code = await callbackPromise;

    spinner.text = 'Exchanging code for tokens...';

    // Step 6: Send code + code_verifier to backend
    const tokenResponse = await axios.post(
      `${BACKEND_URL}/auth/github/cli/callback`,
      {
        code: code,
        code_verifier: codeVerifier,
        redirect_uri: redirectUri,
      }
    );

    const { access_token, refresh_token, user } = tokenResponse.data;

    // Step 7: Save tokens locally
    saveCredentials({
      access_token,
      refresh_token,
      username: user.username,
      role: user.role,
    });

    spinner.succeed(chalk.green(`Logged in as @${user.username} (${user.role})`));

  } catch (err) {
    spinner.fail(chalk.red('Login failed: ' + (err.response?.data?.message || err.message)));
  } finally {
    server.close();
  }
}

module.exports = { login };