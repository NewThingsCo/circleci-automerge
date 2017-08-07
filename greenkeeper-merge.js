import fetch from 'node-fetch'

const apiFetch = (url, param) => fetch(url, param).then(res => res.json()).then(json => json)

const apiToken = process.env.GH_TOKEN
const branchName = process.env.CIRCLE_BRANCH

const print = msg => console.log(msg)

if (!apiToken) {
  print('GitHub API token variable ($GH_TOKEN) not defined, abort')
} else if (!branchName) {
  print('Branch variable ($CIRCLE_BRANCH) not defined, abort')
} else if (branchName.startsWith('greenkeeper/')) {
  const fetchParam = {
    headers: {
      Authorization: `token ${apiToken}`
    }
  }
  // Get open PRs for peeps
  apiFetch(
    'https://api.github.com/repos/LabOfNew/peeps/pulls?state=open',
    fetchParam
  ).then(json => {
    const pullRequest = json.find(request => {
      if (request.head.ref === branchName) {
        return true
      }
      return false
    })
    if (pullRequest) {
      print(`Merge greenkeeper PR ${pullRequest.number}`)
      fetchParam.method = 'PUT'
      fetchParam.body = JSON.stringify({sha: pullRequest.head.sha})
      // Merge PR that this branch is part of
      apiFetch(
        `https://api.github.com/repos/LabOfNew/peeps/pulls/${pullRequest.number}/merge`,
        fetchParam
      ).then(putJson => {
        print(putJson.message)
      })
    } else {
      print(`Aborting merge, unable to find PR for branch ${branchName}`)
    }
  })
} else {
  print(`${branchName} not greenkeeper branch, skipping merge.`)
}
