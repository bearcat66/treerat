const Run = require('../lib/run.node.min')
var bsv = require('../node_modules/bsv')
var ecies = require('../node_modules/bsv/ecies')
var Jigs = require('../lib/jigs')
var replace = require('replace')
const NETWORK = process.env.TR_NETWORK
const OWNER = process.env.TR_OWNER
const PURSE = process.env.TR_PURSE
const ownerPriv = bsv.PrivateKey.fromWIF(OWNER)
const ownerPub = bsv.PublicKey.fromPrivateKey(ownerPriv)

var run = Jigs.RunTrueReview

var replaceNetwork = 'Mainnet'
if (NETWORK === 'test') {
  replaceNetwork = 'Testnet'
}
deployAndUpdateJigs(replaceNetwork)

function replaceLocation(network, jig, location) {
  var regex = '\/\/'+jig+'.'+'origin'+network+' = \'\''
  var replacement = jig+'.'+'origin'+network+' = \''+location+'\''
  console.log(regex)
  console.log(replacement)
  replace({
    regex: regex,
    replacement: replacement,
    paths: ['../lib/jigs.js']
  })
  regex = '\/\/'+jig+'.'+'location'+network+' = \'\''
  replacement = jig+'.'+'location'+network+' = \''+location+'\''
  console.log(regex)
  console.log(replacement)
  replace({
    regex: regex,
    replacement: replacement,
    paths: ['../lib/jigs.js']
  })
}
async function deployAndUpdateJigs(network) {
  run.activate()
  await run.sync()
  var voteTokenLocation = await run.deploy(Jigs.VoteToken)
  replaceLocation(network, 'VoteToken', voteTokenLocation)
  var trueReviewTokenLocation = await run.deploy(Jigs.TrueReviewToken)
  replaceLocation(network, 'TrueReviewToken', trueReviewTokenLocation)
  var reviewTokenLocation = await run.deploy(Jigs.ReviewToken)
  replaceLocation(network, 'ReviewToken', reviewTokenLocation)
  var badReviewTokenLocation = await run.deploy(Jigs.BadReviewToken)
  replaceLocation(network, 'BadReviewToken', badReviewTokenLocation)
  var alphaTesterTokenLocation = await run.deploy(Jigs.TrueReviewAlphaTesterToken)
  replaceLocation(network, 'TrueReviewAlphaTesterToken', alphaTesterTokenLocation)
  var businessCouponLocation = await run.deploy(Jigs.BusinessCoupon)
  replaceLocation(network, 'BusinessCoupon', businessCouponLocation)
  var reviewPointsDBLocation = await run.deploy(Jigs.ReviewPointsDB)
  replaceLocation(network, 'ReviewPointsDB', reviewPointsDBLocation)
  var trueReviewLocation = await run.deploy(Jigs.TrueReview)
  replaceLocation(network, 'TrueReview', trueReviewLocation)
  var userDBLocation = await run.deploy(Jigs.UserDB)
  replaceLocation(network, 'UserDB', userDBLocation)
  var allLocationsLocation = await run.deploy(Jigs.AllLocations)
  replaceLocation(network, 'AllLocations', allLocationsLocation)
  var reviewLocation = await run.deploy(Jigs.Review)
  replaceLocation(network, 'ReviewV01', reviewLocation)
  var locationLocation = await run.deploy(Jigs.Location)
  replaceLocation(network, 'LocationV01', locationLocation)
  var chunkLocation = await run.deploy(Jigs.Chunk)
  replaceLocation(network, 'Chunk', chunkLocation)
  var imageLocation = await run.deploy(Jigs.Image)
  replaceLocation(network, 'Image', imageLocation)
  var userLocation = await run.deploy(Jigs.User)
  replaceLocation(network, 'User', userLocation)
}
