const chalk = require('chalk')
const fetch = require('node-fetch')

module.exports = () => {
  const {
    GH_TOKEN: token,
    CIRCLE_SHA1: sha,
    CIRCLE_PULL_REQUEST: pullRequestUrl,
    CIRCLE_PROJECT_USERNAME: user,
    CIRCLE_PROJECT_REPONAME: repo
  } = process.env

  const baseUrl = 'https://api.github.com/repos'
  const headers = {
    Accept: 'application/vnd.github.v3+json',
    Authorization: `token ${token}`
  }
  const body = JSON.stringify({sha})

  const parseResponse = res => {
    if (res.status !== 200) throw res.statusText
    return res.json()
  }

  const fetchOpenPullRequests = () => {
    console.log(chalk.cyan(`Fetch open pull request from repository ${user}/${repo}`))
    const method = 'GET'
    return fetch(`${baseUrl}/${user}/${repo}/pulls?state=open`, {method, headers}).then(parseResponse)
  }

  const findCurrentPullRequest = pullRequests => {
    const pullRequest = pullRequests.find(pullRequest => pullRequest.head.sha.startsWith(sha))
    if (!pullRequest || !pullRequest.number) {
      console.error(chalk.red(`No pull request found with SHA ${sha}, abort.`))
      process.exit(1)
    }

    return pullRequest.number
  }

  const mergePullRequest = pullRequestNumber => {
    console.log(chalk.cyan(`Merge pull request ${pullRequestNumber}`))
    const method = 'PUT'
    return fetch(`${baseUrl}/${user}/${repo}/pulls/${pullRequestNumber}/merge`, {method, headers, body}).then(parseResponse)
  }

  if (pullRequestUrl) {
    const pullRequestNumber = pullRequestUrl.split('/').pop()
    return mergePullRequest(pullRequestNumber)
  } else {
    console.log(chalk.yellow('CIRCLE_PULL_REQUEST environment variable not set! Fallback to GitHub API.'))
    return fetchOpenPullRequests().then(findCurrentPullRequest).then(mergePullRequest)
  }
}
