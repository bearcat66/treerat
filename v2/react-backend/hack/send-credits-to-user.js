const Run = require('../lib/run.node.min')
var Jigs = require('../lib/jigs')
var tokens = require('../routes/tokens.js')
const NETWORK = process.env.TR_NETWORK
const OWNER = process.env.TR_OWNER
const PURSE = process.env.TR_PURSE
const logger = require('../src/logger')
var log = logger.CreateLogger()

const RunTrueReview = new Run ({
  network: NETWORK,
  owner: OWNER,
  purse: PURSE
})

var run = RunTrueReview
sendCredits(process.argv[2], parseInt(process.argv[3]), parseInt(process.argv[4]))

async function sendCredits(user, reviews, votes) {
  run.activate()
  await run.sync()
  var creds = await tokens.GetUserTokens(log, user)
  log.info('Previous credits: ', creds)
  if (reviews !== 0) {
    await tokens.SendReviewTokens(log, user, reviews)
  }
  if (votes !== 0) {
    await tokens.SendVoteTokens(log, user, votes)
  }
  var creds = await tokens.GetUserTokens(log, user)
  log.info('After credits: ', creds)
}
