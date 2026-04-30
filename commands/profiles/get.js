const ora = require('ora');
const chalk = require('chalk');
const { isLoggedIn } = require('../../lib/auth');
const api = require('../../lib/api');
const { printProfileDetail, printError } = require('../../lib/display');

async function get(id) {
  if (!isLoggedIn()) {
    console.log(chalk.red('Not logged in. Run: insighta login'));
    return;
  }

  const spinner = ora(`Fetching profile ${id}...`).start();

  try {
    const response = await api.get(`/api/profiles/${id}`);
    spinner.stop();
    printProfileDetail(response.data.data);
  } catch (err) {
    spinner.fail();
    printError(err.response?.data?.message || err.message);
  }
}

module.exports = { get };