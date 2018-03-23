const nock = require('nock')
const mergePullRequest = require('../bin/merge-pr')

process.env.GH_TOKEN = '12345token'
process.env.CIRCLE_SHA1 = 'e07e589fbeb379'
process.env.CIRCLE_PULL_REQUEST = 'https://github.com/NewThingsCo/circleci-automerge/pull/1',
process.env.CIRCLE_PROJECT_USERNAME = 'NewThingsCo',
process.env.CIRCLE_PROJECT_REPONAME = 'circleci-automerge'

const disableConsoleLog = () => {
  console.log = function() {}
}

beforeAll(disableConsoleLog)
afterEach(nock.cleanAll)

const testMergeRequest = function (uri, reqBody) {
  const {headers} = this.req

  expect(uri).toBe('/repos/NewThingsCo/circleci-automerge/pulls/1/merge')
  expect(headers.authorization[0]).toBe('token 12345token')
  expect(headers.accept[0]).toBe('application/vnd.github.v3+json')
  expect(reqBody).toBe('{"sha":"e07e589fbeb379"}')

  return {message: 'Pull Request successfully merged'}
}

test('should merge given pull request', async () => {
  nock('https://api.github.com')
    .put('/repos/NewThingsCo/circleci-automerge/pulls/1/merge')
    .reply(200, testMergeRequest)

  const response = await mergePullRequest()
  expect(response).toEqual({message: 'Pull Request successfully merged'})
})

test('should handle service errors when merging pull request', async () => {
  nock('https://api.github.com')
    .put('/repos/NewThingsCo/circleci-automerge/pulls/1/merge')
    .reply(401, 'Unauthorized')

  try {
    await mergePullRequest()
  } catch (error) {
    expect(error).toEqual('Unauthorized')
  }
})

test('should handle network errors when merging pull request', async () => {
  nock('https://api.github.com')
    .put('/repos/NewThingsCo/circleci-automerge/pulls/1/merge')
    .replyWithError('Unexpected error')

  try {
    await mergePullRequest()
  } catch (error) {
    expect(error.type).toEqual('system')
    expect(error.message).toEqual('request to https://api.github.com/repos/NewThingsCo/circleci-automerge/pulls/1/merge failed, reason: Unexpected error')
  }
})

test('should fallback to github api if CIRCLE_PULL_REQUEST not set', async () => {
  delete process.env.CIRCLE_PULL_REQUEST

  nock('https://api.github.com')
    .get('/repos/NewThingsCo/circleci-automerge/pulls?state=open')
    .reply(200, [{number: 1, head: {sha: 'e07e589fbeb379'}}])

  nock('https://api.github.com')
    .put('/repos/NewThingsCo/circleci-automerge/pulls/1/merge')
    .reply(200, testMergeRequest)

  const response = await mergePullRequest()
  expect(response).toEqual({message: 'Pull Request successfully merged'})
})
