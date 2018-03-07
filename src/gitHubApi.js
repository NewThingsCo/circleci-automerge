const fetch = require('node-fetch')

module.exports = repository => {
  const apiToken = process.env.GH_TOKEN
  const branchName = process.env.CIRCLE_BRANCH
  const shaCommit = process.env.CIRCLE_SHA1
  const baseUrl = 'https://api.github.com/repos'
  const headers = {
    Accept: 'application/vnd.github.v3+json',
    Authorization: `token ${apiToken}`
  }

  const fetchOpenPullRequests = () => {
    console.log(`Fetch open pull request from repository ${repository}`)
    return fetch(`${baseUrl}/${repository}/pulls?state=open`, {headers})
      .then(res => {
        if (res.status !== 200) throw res.statusText
        return res.json()
      })
  }

  const findCurrentPullRequest = pullRequests => {
    const pullRequest = pullRequests.find(pr => pr.head.ref === branchName && pr.head.sha.startsWith(shaCommit))
  
    if (!pullRequest) {
      console.error(`Aborting merge, unable to find pull request for branch ${branchName}`)
      process.exit(1)
    }
  
    return pullRequest
  }

  const mergePullRequest = pr => {
    console.log(`Merge pull request ${pr.number}`)
    const params = {headers, method: 'PUT', body: JSON.stringify({sha: pr.head.sha})}
    return fetch(`${baseUrl}/${repository}/pulls/${pr.number}/merge`, params)
      .then(res => {
        if (res.status !== 200) throw res.statusText
        return res.json()
      })
  }

  return {fetchOpenPullRequests, mergePullRequest, findCurrentPullRequest}
}
