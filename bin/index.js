#!/usr/bin/env node --harmony
const commander = require('commander')
const chalk = require('chalk')
const version = require('../package.json').version
const mergePullRequest = require('./merge-pr')

commander
  .version(version, '-v, --version')
  .option('-f, --filter <regexp>', 'regular expression to filter branches')
  .parse(process.argv)

const {filter} = commander
const {GH_TOKEN, CIRCLE_BRANCH} = process.env

if (!GH_TOKEN) {
  console.error(chalk.red('GitHub API token variable ($GH_TOKEN) not defined, abort'))
  process.exit(1)
}

if (filter && !CIRCLE_BRANCH.match(filter)) {
  console.log(chalk.yellow(`${CIRCLE_BRANCH} branch does not match to filter ${filter}, skipping merge.`))
  process.exit(0)
}

mergePullRequest()
  .then(res => console.log(chalk.green(res.message)))
  .catch(error => {
    console.error(chalk.red('Pull request merge failed unexpectedly:'), error)
    process.exit(1)
  })
