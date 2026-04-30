const ora = require('ora');
const chalk = require('chalk');
const { isLoggedIn } = require('../../lib/auth');
const api = require('../../lib/api');
const { printProfileDetail, printError } = require('../../lib/display');

async function create(options) {
  if (!isLoggedIn()) {
    console.log(chalk.red('Not logged in. Run: insighta login'));
    return;
  }

  if (!options.name) {
    printError('Name is required. Use: insighta profiles create --name "John Doe"');
    return;
  }

  const spinner = ora(`Creating profile for "${options.name}"...`).start();

  try {
    const response = await api.post('/api/profiles', { name: options.name });
    spinner.stop();
    console.log(chalk.green('\n✓ Profile created successfully\n'));
    printProfileDetail(response.data.data);
  } catch (err) {
    spinner.fail();
    printError(err.response?.data?.message || err.message);
  }
}

module.exports = { create };