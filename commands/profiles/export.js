const fs = require('fs');
const path = require('path');
const ora = require('ora');
const chalk = require('chalk');
const { isLoggedIn } = require('../../lib/auth');
const api = require('../../lib/api');
const { printError } = require('../../lib/display');

async function exportProfiles(options) {
  if (!isLoggedIn()) {
    console.log(chalk.red('Not logged in. Run: insighta login'));
    return;
  }

  const spinner = ora('Exporting profiles...').start();

  const params = { format: 'csv' };
  if (options.gender)  params.gender = options.gender;
  if (options.country) params.country_id = options.country;

  try {
    const response = await api.get('/api/profiles/export', {
      params,
      responseType: 'text', // get raw CSV text back
    });

    // Save to current working directory
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `profiles_${timestamp}.csv`;
    const filepath = path.join(process.cwd(), filename);

    fs.writeFileSync(filepath, response.data);
    spinner.succeed(chalk.green(`Exported to ${filepath}`));
  } catch (err) {
    spinner.fail();
    printError(err.response?.data?.message || err.message);
  }
}

module.exports = { exportProfiles };