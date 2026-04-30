const ora = require('ora');
const chalk = require('chalk');
const { isLoggedIn } = require('../../lib/auth');
const api = require('../../lib/api');
const { printProfilesTable, printPagination, printError } = require('../../lib/display');

async function search(query, options) {
  if (!isLoggedIn()) {
    console.log(chalk.red('Not logged in. Run: insighta login'));
    return;
  }

  const spinner = ora(`Searching for "${query}"...`).start();

  try {
    const response = await api.get('/api/profiles/search', {
      params: {
        q: query,
        page: options.page || 1,
        limit: options.limit || 10,
      },
    });
    const data = response.data;
    spinner.stop();

    if (data.status === 'error') {
      printError(data.message);
      return;
    }

    printProfilesTable(data.data);
    printPagination(data);
  } catch (err) {
    spinner.fail();
    printError(err.response?.data?.message || err.message);
  }
}

module.exports = { search };