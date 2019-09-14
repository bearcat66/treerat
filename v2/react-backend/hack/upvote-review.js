const Run = require('../lib/run.node.min')
var Jigs = require('../lib/jigs')
var reviews = require('../routes/review.js')
const NETWORK = process.env.TR_NETWORK
const OWNER = process.env.TR_OWNER
const PURSE = process.env.TR_PURSE
const logger = require('../src/logger')
var log = logger.CreateLogger()
var run = Jigs.RunTrueReview

upvoteReview(process.argv[2], process.argv[3])

async function upvoteReview(user, location) {
  run.activate()
  await run.sync()
  var review = await run.load(location)
  console.log(review)
  reviews.UpvoteReview(log, location, user)
}
