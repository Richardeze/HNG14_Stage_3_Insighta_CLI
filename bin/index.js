#!/usr/bin/env node

const { Command } = require('commander');
const { login } = require('../commands/login');
const { logout } = require('../commands/logout');
const { whoami } = require('../commands/whoami');
const { list } = require('../commands/profiles/list');
const { get } = require('../commands/profiles/get');
const { search } = require('../commands/profiles/search');
const { create } = require('../commands/profiles/create');
const { exportProfiles } = require('../commands/profiles/export');

const program = new Command();

program
  .name('insighta')
  .description('Insighta Labs+ CLI')
  .version('1.0.0');

program
  .command('login')
  .description('Login with GitHub')
  .action(login);

program
  .command('logout')
  .description('Logout and clear credentials')
  .action(logout);

program
  .command('whoami')
  .description('Show current logged in user')
  .action(whoami);

const profiles = program.command('profiles').description('Manage profiles');

profiles
  .command('list')
  .description('List profiles with optional filters')
  .option('--gender <gender>', 'Filter by gender (male/female)')
  .option('--country <code>', 'Filter by country code (e.g. NG)')
  .option('--age-group <group>', 'Filter by age group (child/teenager/adult/senior)')
  .option('--min-age <number>', 'Minimum age', parseInt)
  .option('--max-age <number>', 'Maximum age', parseInt)
  .option('--sort-by <field>', 'Sort by field (age/created_at/gender_probability)')
  .option('--order <direction>', 'Sort direction (asc/desc)', 'asc')
  .option('--page <number>', 'Page number', parseInt)
  .option('--limit <number>', 'Results per page', parseInt)
  .action(list);

profiles
  .command('get <id>')
  .description('Get a single profile by ID')
  .action(get);

profiles
  .command('search <query>')
  .description('Search profiles using natural language')
  .option('--page <number>', 'Page number', parseInt)
  .option('--limit <number>', 'Results per page', parseInt)
  .action(search);

profiles
  .command('create')
  .description('Create a new profile (admin only)')
  .option('--name <name>', 'Full name of the person')
  .action(create);

profiles
  .command('export')
  .description('Export profiles to CSV')
  .option('--format <format>', 'Export format (csv)', 'csv')
  .option('--gender <gender>', 'Filter by gender')
  .option('--country <code>', 'Filter by country code')
  .action(exportProfiles);

program.parse(process.argv);