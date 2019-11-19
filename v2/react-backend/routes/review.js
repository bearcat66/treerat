var mb = require('@moneybutton/api-client')
var users = require('./users.js')
var tokens= require('./tokens.js')

var Mnemonic = require('bsv/mnemonic')
var moment = require('moment')
var Message = require('bsv/message')
var express = require('express');
var bsv = require('bsv');
var dns = require('dns');
var ecies = require('bsv/ecies')
var bodyParser = require('body-parser')
var router = express.Router();
const logger = require('../src/logger')
var log = logger.CreateLogger()

const Run = require('../lib/run.node.min')
const Jigs = require('../lib/jigs')
const {PaymailClient} = require('@moneybutton/paymail-client')
const run = Jigs.RunTrueReview
const MB_OAUTH_ID = process.env.REACT_APP_MBOAUTHID
const ownerPrivKey = bsv.PrivateKey.fromWIF(Jigs.OWNER_KEY)
const NETWORK = Jigs.NETWORK
const PURSE_PRIVKEY = Jigs.PURSE_KEY
const PURSE2_PRIVKEY = Jigs.PURSE2_KEY

/* GET locations listing. */
router.post('/:placeID', function(req, res) {
  run.activate()
  //ensureLocationDBCreated()
  log.info('Creating review for location: ' + req.params.placeID)
  var locs = getAllLocationsJig()
  var loc = locs.get(req.params.placeID)
  if (loc == null) {
    log.info('Location does not exist, creating location for ' + req.params.placeID)
  }
  handleReviewCreate(log, loc, req.params.placeID, req.body).then(r => {
    res.json({location: r.location})
  }).catch(e => {
    log.error(e)
    res.status(500).send(JSON.stringify({error: e}))
  })
})

router.get('/user/:userID', function(req, res, next) {
  loadReviews(req.params.userID).then(r => {
    res.json({reviews: r})
  })
})

router.post('/:reviewID/downvote', function(req, res) {
  downvoteReview(log, req.params.reviewID, req.body.userID).then(r => {
    res.json({downvoted: true})
  })
})

router.post('/:reviewID/upvote', function(req, res) {
  upvoteReview(log, req.params.reviewID, req.body.userID).then(r => {
    res.json({upvoted: true})
  })
})

router.get('/:reviewID/score', function(req, res, next) {
  getReviewScore(log, req.params.reviewID).then(r => {
    res.json({score: r})
  })
})

async function getReviewScore(log, reviewID) {
  run.activate()
  await run.sync()
  //ensurePointsDBCreated()
  var rev = await run.load(reviewID)
  await rev.sync()
  var pts = getPointsDBJig()
  await pts.sync()
  return pts.get(reviewID)
}

async function downvoteReview(reviewID, downvotedUser) {
  run.activate()
  await run.sync()
  //ensurePointsDBCreated()
  var rev = await run.load(reviewID)
  await rev.sync()
  var pts = getPointsDBJig()
  await pts.sync()
  if (pts.get(reviewID) === null) {
    pts.set(reviewID, {score: 0, upvotedUsers: [], downvotedUsers: []})
  }
  var tokes = new Jigs.BadReviewToken(3)
  tokes.send(rev.owner)
  await run.sync()
  var newScore = pts.downvote(reviewID, downvotedUser)
  await tokens.RedeemVote(log, downvotedUser)
  await pts.sync()
  var voters = pts.get(reviewID)
  if (voters.downvotedUsers.length > 0) {
    await payVoters(log, voters.downvotedUsers)
  }
}

async function upvoteReview(log, reviewID, upvotedUser) {
  run.activate()
  await run.sync()
  //ensurePointsDBCreated()
  var rev = await run.load(reviewID)
  await rev.sync()
  var pts = getPointsDBJig()
  await pts.sync()
  if (pts.get(reviewID) === null) {
    pts.set(reviewID, {score: 0, upvotedUsers: [], downvotedUsers: []})
  }
  var tokes = await loadRepTokens()
  tokes.send(rev.owner, 5)
  await pts.sync()
  var newScore = pts.upvote(reviewID, upvotedUser)
  log.info('Review score was updated')
  // Now send user some money
  var paymailClient = new PaymailClient(dns, fetch)
  await run.sync()
  var purseAddress = new bsv.PrivateKey(PURSE2_PRIVKEY).toAddress().toString()
  var utxos = await run.blockchain.utxos(purseAddress)
  var output = await paymailClient.getOutputFor(rev.user, {
    senderHandle: 'truereviews@moneybutton.com',
    amount: 5000, // Amount in satoshis
    senderName: 'True Reviews',
    purpose: 'Your review was upvoted!',
  }, PURSE2_PRIVKEY)
  var out = bsv.Transaction.Output({satoshis: 5000, script: output})
  var tx = new bsv.Transaction().from(utxos).change(purseAddress).addOutput(out).sign(PURSE2_PRIVKEY)
  await run.blockchain.broadcast(tx)
  await tokens.RedeemVote(log, upvotedUser)
  log.info("Successfully sent ["+rev.user+"] 5000 satoshis")
  await pts.sync()
  var voters = pts.get(reviewID)
  log.info(voters)
  if (voters.upvotedUsers.length > 0) {
    await payVoters(log, voters.upvotedUsers)
  }
}

async function payVoters(log, voters) {
  log.info('Paying curators')
  log.info(voters)
  var paymailClient = new PaymailClient(dns, fetch)
  var purseAddress = new bsv.PrivateKey(PURSE2_PRIVKEY).toAddress().toString()
  for(var i=0;i<voters.length;i++) {
    var voter = voters[i]
    await run.sync()
    var utxos = await run.blockchain.utxos(purseAddress)
    var output = await paymailClient.getOutputFor(voter, {
      senderHandle: 'truereviews@moneybutton.com',
      amount: 550, // Amount in satoshis
      senderName: 'True Reviews',
      purpose: 'Your vote earned you money!',
    }, PURSE2_PRIVKEY)
    var out = bsv.Transaction.Output({satoshis: 550, script: output})
    var tx = new bsv.Transaction().from(utxos).change(purseAddress).addOutput(out).sign(PURSE2_PRIVKEY)
    await run.blockchain.broadcast(tx)
  }
}
 
async function loadReviews(log, userID) {
  var user = await users.LoadUser(log, userID)
  var reviewList = []
  run.activate()
  await run.sync()
  for (var i=0;i<user.reviews.length;i++) {
    var rev = await run.load(user.reviews[i].location)
    var ptsdb = getPointsDBJig()
    await ptsdb.sync()
    var pts = ptsdb.get(user.reviews[i].origin)
    reviewList.push({locationName: user.reviews[i].locationName, rating: rev.rating, body: rev.body, points: pts})
  }
  return reviewList
}
async function handleReviewCreate(log, locationOfJig, placeID, params) {
  run.activate()
  await run.sync()
  var instance = run
  //ensurePointsDBCreated()
  var userdb = users.GetUserDB()
  await userdb.sync()
  var user = userdb.get(params.userID)
  var pointsdb = getPointsDBJig()
  if (pointsdb == null) {
    log.info('Creating points jig')
    pointsdb = new createPointsDB()
    log.info('Successfully created DB')
  }
  await pointsdb.sync()
  var locs = getAllLocationsJig()
  await locs.sync()
  if (locationOfJig == null) {
    log.info('Creating location jig for: '+ params.locationName)
    var loc = createLocation(placeID, params.locationName, params.coords)
    await loc.sync()
    log.info('Successfully created location:')
    locs.set(placeID, {location: loc.location, coords: params.coords})
    log.info('Successfully added location to AllLocations jig')
  } else {
    var loca = locs.get(placeID)
    if (loca.ownedBy != null) {
      var business = userdb.get(loca.ownedBy)
      var bug = Buffer.from(business.keys)
      var enc = ecies.bitcoreECIES().privateKey(ownerPrivKey).decrypt(bug)
      var keys = JSON.parse(enc.toString())
      var userRunInstance = new Run({
        network: NETWORK,
        owner: bsv.PrivateKey.fromWIF(keys.privKey),
        purse: PURSE_PRIVKEY,
        app: Jigs.APP_ID
      })
      userRunInstance.activate()
      userRunInstance.sync()
      instance = userRunInstance
    }
    var loc = await instance.load(locationOfJig.location)
    await loc.sync()
  }
  run.transaction.begin()
  var rev = loc.createReview(params.reviewBody, params.rating, params.userID)
  //await loc.sync()
  log.info(params.userID+ ' Successfully created a review for: ' + params.locationName)
  var bug = Buffer.from(user.keys)
  var enc = ecies.bitcoreECIES().privateKey(ownerPrivKey).decrypt(bug)
  var keys = JSON.parse(enc.toString())
  log.info('Sending review to user: ' + params.userID)
  rev.send(keys.pubKey)
  run.transaction.end()
  await rev.sync()
  log.info('Successfully sent review to user: ' + params.userID)
  run.activate()
  await run.sync()
  var token = await loadRepTokens()
  run.transaction.begin()
  pointsdb.set(rev.origin, {score: 0, upvotedUsers: [], downvotedUsers: []})
  log.info('Issuing 1 reputation point to: ' + params.userID)
  token.send(keys.pubKey, 1)
  await run.transaction.end()
  await run.sync()
  // Send user 5000 satoshis
  log.info('Sending '+params.userID+' 5000 satoshis')
  var paymailClient = new PaymailClient(dns, fetch)
  var purseAddress = new bsv.PrivateKey(PURSE2_PRIVKEY).toAddress().toString()
  var utxos = await run.blockchain.utxos(purseAddress)
  var output = await paymailClient.getOutputFor(params.userID, {
    senderHandle: 'truereviews@moneybutton.com',
    amount: 5000, // Amount in satoshis
    senderName: 'True Reviews',
    purpose: 'You created a review!',
  }, PURSE2_PRIVKEY)
  var out = bsv.Transaction.Output({satoshis: 5000, script: output})
  var tx = new bsv.Transaction().from(utxos).change(purseAddress).addOutput(out).sign(PURSE2_PRIVKEY)
  await run.blockchain.broadcast(tx)
  log.info("Successfully sent ["+rev.user+"] 5000 satoshis")
  await tokens.RedeemReview(log, params.userID)
  return rev
}

function createLocation(placeID, name, coords) {
  return new Jigs.Location(placeID, coords, name)
}

function getAllLocationsJig() {
  return run.owner.jigs.find(x => x.constructor.name === 'AllLocations')
}

function getPointsDBJig() {
  return run.owner.jigs.find(x => x.constructor.name === 'ReviewPointsDB')
}
async function ensureLocationDBCreated() {
  var dbjig = getAllLocationsJig()
  if (dbjig === null || dbjig == null) {
    await createAllLocations()
  }
  return
}

async function ensurePointsDBCreated() {
  var dbjig = getPointsDBJig()
  if (dbjig === null || dbjig == null) {
    await createPointsDB()
  }
  return
}
async function createPointsDB() {
  log.info('Creating Points DB Object')
  new Jigs.ReviewPointsDB()
  await run.sync()
}
async function createAllLocations() {
  log.info('Creating new AllLocations object')
  new Jigs.AllLocations()
  await run.sync()
}
async function loadRepTokens() {
  run.activate()
  await run.sync()
  var token = run.owner.jigs.find(function(i) {
    return i.constructor.name === 'TrueReviewToken' && i.amount > 100
  })
  return token
}

module.exports = router;
module.exports.GetScore = getReviewScore
