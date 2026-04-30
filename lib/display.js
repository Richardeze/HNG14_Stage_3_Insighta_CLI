const Table = require('cli-table3');
const chalk = require('chalk');

function printProfilesTable(profiles) {
  if (!profiles || profiles.length === 0) {
    console.log(chalk.yellow('No profiles found.'));
    return;
  }

  const table = new Table({
    head: [
      chalk.cyan('Name'),
      chalk.cyan('Gender'),
      chalk.cyan('Age'),
      chalk.cyan('Age Group'),
      chalk.cyan('Country'),
      chalk.cyan('ID'),
    ],
    colWidths: [20, 10, 6, 12, 10, 38],
    wordWrap: true,
  });

  profiles.forEach((p) => {
    table.push([
      p.name,
      p.gender,
      p.age,
      p.age_group,
      p.country_id,
      p.id,
    ]);
  });

  console.log(table.toString());
}

function printProfileDetail(profile) {
  const table = new Table({
    head: [chalk.cyan('Field'), chalk.cyan('Value')],
    colWidths: [25, 50],
  });

  table.push(
    ['ID', profile.id],
    ['Name', profile.name],
    ['Gender', profile.gender],
    ['Gender Probability', profile.gender_probability],
    ['Age', profile.age],
    ['Age Group', profile.age_group],
    ['Country', `${profile.country_name} (${profile.country_id})`],
    ['Country Probability', profile.country_probability],
    ['Created At', new Date(profile.created_at).toLocaleString()],
  );

  console.log(table.toString());
}

function printPagination(data) {
  console.log(
    chalk.gray(
      `\nPage ${data.page} of ${data.total_pages} — ${data.total} total results`
    )
  );
}

function printSuccess(message) {
  console.log(chalk.green('✓ ' + message));
}

function printError(message) {
  console.log(chalk.red('✗ ' + message));
}

module.exports = {
  printProfilesTable,
  printProfileDetail,
  printPagination,
  printSuccess,
  printError,
};