const chalk = require('chalk')
const fetch = require('node-fetch')

module.exports = () => {
  const {
    GH_TOKEN: token,
    CIRCLE_SHA1: sha,
    CIRCLE_PULL_REQUEST: prUrl,
    CIRCLE_PROJECT_USERNAME: user,
    CIRCLE_PROJECT_REPONAME: repo
  } = process.env
  const prNumber = prUrl.split('/').pop()

  const method = 'PUT'
  const headers = {
    Accept: 'application/vnd.github.v3+json',
    Authorization: `token ${token}`
  }
  const body = JSON.stringify({sha})

  const parseResponse = res => {
    if (res.status !== 200) throw res.statusText
    return res.json()
  }

  console.log(chalk.cyan(`Merge pull request ${prNumber}`))
  return fetch(`https://api.github.com/repos/${user}/${repo}/pulls/${prNumber}/merge`, {method, headers, body}).then(parseResponse)
}
