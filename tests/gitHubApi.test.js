const nock = require('nock')
const gitHubApi = require('../bin/gitHubApi')

const repository = 'test/repository'
const pullRequest1 = {number: 1, head: {sha: 'e07e589fbeb379', ref: 'test-branch'}}
const pullRequest2 = {number: 2, head: {sha: '0d4fcc88ede454', ref: 'test-branch2'}}
const pullRequests = [pullRequest1, pullRequest2]
const mergeSuccess = {message: 'Pull Request successfully merged'}

process.env.GH_TOKEN = 'apiToken'
process.env.CIRCLE_BRANCH = 'test-branch'
process.env.CIRCLE_SHA1 = 'e07e589fbeb379'

const disableConsoleLog = () => {
  console.log = function() {}
}

beforeAll(disableConsoleLog)
afterEach(nock.cleanAll)

const testFetchOpenPRsRequest = function (uri) {
  const {headers} = this.req

  expect(uri).toBe('/repos/test/repository/pulls?state=open')
  expect(headers.authorization[0]).toBe('token apiToken')
  expect(headers.accept[0]).toBe('application/vnd.github.v3+json')

  return pullRequests
}

test('should fetch open pull requests from given github repository', async () => {
  nock('https://api.github.com')
    .get(`/repos/${repository}/pulls?state=open`)
    .reply(200, testFetchOpenPRsRequest)

  const {fetchOpenPullRequests} = gitHubApi(repository)
  const response = await fetchOpenPullRequests()
  expect(response).toEqual(pullRequests)
})

test('should handle service errors when fetching open pull requests', async () => {
  nock('https://api.github.com')
    .get(`/repos/${repository}/pulls?state=open`)
    .reply(401, 'Unauthorized')

  const {fetchOpenPullRequests} = gitHubApi(repository)
  try {
    await fetchOpenPullRequests()
  } catch (error) {
    expect(error).toEqual('Unauthorized')
  }
})

test('should handle network errors when fetching open pull requests', async () => {
  nock('https://api.github.com')
    .get(`/repos/${repository}/pulls?state=open`)
    .replyWithError('Unexpected error')

  const {fetchOpenPullRequests} = gitHubApi(repository)
  try {
    await fetchOpenPullRequests()
  } catch (error) {
    expect(error.type).toEqual('system')
    expect(error.message).toEqual('request to https://api.github.com/repos/test/repository/pulls?state=open failed, reason: Unexpected error')
  }
})

const testMergeRequest = function (uri, reqBody) {
  const {headers} = this.req

  expect(uri).toBe('/repos/test/repository/pulls/1/merge')
  expect(headers.authorization[0]).toBe('token apiToken')
  expect(headers.accept[0]).toBe('application/vnd.github.v3+json')
  expect(reqBody).toBe('{"sha":"e07e589fbeb379"}')

  return mergeSuccess
}

test('should merge given pull request', async () => {
  nock('https://api.github.com')
    .put(`/repos/${repository}/pulls/${pullRequest1.number}/merge`)
    .reply(200, testMergeRequest)

  const {mergePullRequest} = gitHubApi(repository)
  const response = await mergePullRequest(pullRequest1)
  expect(response).toEqual(mergeSuccess)
})

test('should handle service errors when merging pull request', async () => {
  nock('https://api.github.com')
    .put(`/repos/${repository}/pulls/${pullRequest1.number}/merge`)
    .reply(401, 'Unauthorized')

  const {mergePullRequest} = gitHubApi(repository)
  try {
    await mergePullRequest(pullRequest1)
  } catch (error) {
    expect(error).toEqual('Unauthorized')
  }
})

test('should handle network errors when merging pull request', async () => {
  nock('https://api.github.com')
    .put(`/repos/${repository}/pulls/${pullRequest1.number}/merge`)
    .replyWithError('Unexpected error')

  const {mergePullRequest} = gitHubApi(repository)
  try {
    await mergePullRequest(pullRequest1)
  } catch (error) {
    expect(error.type).toEqual('system')
    expect(error.message).toEqual('request to https://api.github.com/repos/test/repository/pulls/1/merge failed, reason: Unexpected error')
  }
})

test('should filter pull requests by branch and sha', () => {
  const {findCurrentPullRequest} = gitHubApi(repository)
  const pullRequest = findCurrentPullRequest(pullRequests)

  expect(pullRequest).toEqual(pullRequest1)
})
