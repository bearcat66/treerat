const Run = require('../lib/run.node.min')
var bsv = require('../node_modules/bsv')
var ecies = require('../node_modules/bsv/ecies')
var Jigs = require('../lib/jigs')
const NETWORK = process.env.TR_NETWORK
const OWNER = process.env.TR_OWNER
const PURSE = process.env.TR_PURSE
const ownerPriv = bsv.PrivateKey.fromWIF(OWNER)
const ownerPub = bsv.PublicKey.fromPrivateKey(ownerPriv)

const RunTrueReview = new Run ({
  network: NETWORK,
  owner: OWNER,
  purse: PURSE
})

var run = RunTrueReview
deployJigs()

async function deployJigs() {
  run.activate()
  await run.sync()
  var location = await run.deploy(Jigs.VoteToken)
  console.log('VoteToken: ' + location)
  location = await run.deploy(Jigs.TrueReviewToken)
  console.log('TrueReviewToken: ' + location)
  location = await run.deploy(Jigs.ReviewToken)
  console.log('ReviewToken: ' + location)
  location = await run.deploy(Jigs.BadReviewToken)
  console.log('BadReviewToken: ' + location)
  location = await run.deploy(Jigs.TrueReviewAlphaTesterToken)
  console.log('TrueReviewAlphaTesterToken: ' + location)
  location = await run.deploy(Jigs.BusinessCoupon)
  console.log('BusinessCoupon: ' + location)
  location = await run.deploy(Jigs.ReviewPointsDB)
  console.log('ReviewPointsDB: ' + location)
  location = await run.deploy(Jigs.TrueReview)
  console.log('TrueReview: ' + location)
  location = await run.deploy(Jigs.UserDB)
  console.log('UserDB: ' + location)
  location = await run.deploy(Jigs.AllLocations)
  console.log('AllLocations: ' + location)
  location = await run.deploy(Jigs.Review)
  console.log('Review: ' + location)
  location = await run.deploy(Jigs.Location)
  console.log('Location: ' + location)
}
