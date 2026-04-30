const ora = require('ora');
const chalk = require('chalk');
const { isLoggedIn } = require('../../lib/auth');
const api = require('../../lib/api');
const { printProfilesTable, printPagination, printError } = require('../../lib/display');

async function list(options) {
  if (!isLoggedIn()) {
    console.log(chalk.red('Not logged in. Run: insighta login'));
    return;
  }

  const spinner = ora('Fetching profiles...').start();

  // Build query params from CLI options
  const params = {};
  if (options.gender)    params.gender = options.gender;
  if (options.country)   params.country_id = options.country;
  if (options.ageGroup)  params.age_group = options.ageGroup;
  if (options.minAge)    params.min_age = options.minAge;
  if (options.maxAge)    params.max_age = options.maxAge;
  if (options.sortBy)    params.sort_by = options.sortBy;
  if (options.order)     params.order = options.order;
  if (options.page)      params.page = options.page;
  if (options.limit)     params.limit = options.limit;

  try {
    const response = await api.get('/api/profiles', { params });
    const data = response.data;
    spinner.stop();

    printProfilesTable(data.data);
    printPagination(data);
  } catch (err) {
    spinner.fail();
    printError(err.response?.data?.message || err.message);
  }
}

module.exports = { list };