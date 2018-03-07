#!/usr/bin/env node --harmony
const commander = require('commander')
const gitHubApi = require('./gitHubApi')

commander
  .version('1.0.0', '-v, --version')
  .option('-r, --repository <repository>', 'github repository in format "<owner>/<repo>"')
  .option('-f, --filter <regexp>', 'regular expression to filter branches')
  .parse(process.argv)

const {repository, filter} = commander

const apiToken = process.env.GH_TOKEN
const branchName = process.env.CIRCLE_BRANCH

if (!apiToken) {
  console.error('GitHub API token variable ($GH_TOKEN) not defined, abort')
  process.exit(1)
}

if (!branchName) {
  console.error('Branch variable ($CIRCLE_BRANCH) not defined, abort')
  process.exit(1)
}

if (!repository) {
  console.log('--repository option is required but missing, abort')
  process.exit(1)
}

if (filter && !branchName.match(filter)) {
  console.log(`${branchName} branch does not match to filter ${filter}, skipping merge.`)
  process.exit(0)
}

const {
  fetchOpenPullRequests,
  findCurrentPullRequest,
  mergePullRequest
} = gitHubApi(repository)

fetchOpenPullRequests()
  .then(findCurrentPullRequest)
  .then(mergePullRequest)
  .then(res => console.log(res.message))
  .catch(error => {
    console.error('Pull request merge failed unexpectedly:', error)
    process.exit(1)
  })
