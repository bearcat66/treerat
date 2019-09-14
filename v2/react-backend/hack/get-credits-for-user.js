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
loadCredits(process.argv[2])

async function loadCredits(user) {
  run.activate()
  await run.sync()
  var creds = await tokens.GetUserTokens(log, user)
  console.log(creds)
}
