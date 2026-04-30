const ora = require('ora');
const chalk = require('chalk');
const { isLoggedIn } = require('../lib/auth');
const api = require('../lib/api');

async function whoami() {
  if (!isLoggedIn()) {
    console.log(chalk.red('Not logged in. Run: insighta login'));
    return;
  }

  const spinner = ora('Fetching your info...').start();

  try {
    const response = await api.get('/auth/me');
    const user = response.data.data;
    spinner.stop();

    console.log(chalk.cyan('\nYour account:'));
    console.log(`  Username : ${chalk.bold('@' + user.username)}`);
    console.log(`  Role     : ${chalk.bold(user.role)}`);
    console.log(`  Email    : ${user.email || 'private'}`);
    console.log(`  Active   : ${user.is_active ? chalk.green('yes') : chalk.red('no')}`);
  } catch (err) {
    spinner.fail(chalk.red(err.response?.data?.message || err.message));
  }
}

module.exports = { whoami };