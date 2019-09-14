const Run = require('../lib/run.node.min')
var Jigs = require('../lib/jigs')
var review = require('../routes/review.js')
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
review.EditReview(log, process.argv[2], process.argv[3])

