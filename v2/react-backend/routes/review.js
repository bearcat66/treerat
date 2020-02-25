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
const BURN_ADDRESS = '0224235f99b4487adac7d74882e21ae955eb8f592455445cc9aecc31a57b348955'

/* GET locations listing. */
router.post('/:placeID', function(req, res) {
  run.activate()
  log.info('User ['+req.body.userID+'] attempting to create review for location: ' + req.params.placeID)
  handleReviewCreate(log, req.params.placeID, req.body).then(r => {
    res.json({location: r.location})
  }).catch(e => {
    log.error(e)
    res.status(500).send(JSON.stringify({error: e}))
  })
})

router.get('/user/:userID', function(req, res, next) {
  loadReviewsForUser(log, req.params.userID).then(r => {
    res.json({reviews: r})
  }).catch(e => {
    log.error(e)
    res.status(500).send(JSON.stringify({error: e}))
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

router.post('/:reviewID/edit', function(req, res) {
  editReview(log, req.params.reviewID, req.body.userID, req.body.editedBody, req.body.editedRating, req.body.newImages).then(r => {
    res.json({edited: true})
  }).catch(e => {
    log.error(e)
    res.status(500).send(JSON.stringify({error: e}))
  })
})

router.get('/:reviewID/score', function(req, res, next) {
  getReviewScore(log, req.params.reviewID).then(r => {
    res.json({score: r})
  })
})

async function getReviewTimestamp(log, reviewID) {
  run.activate()
  await run.sync()
  var origin = reviewID.split('_')[0]
  var rev = await run.blockchain.fetch(origin)
  var time = new Date(rev.time)
  log.info('Review ['+reviewID+'] time: ['+ time+']')
  return time
}

async function getReviewScore(log, reviewID) {
  run.activate()
  await run.sync()
  var rev = await run.load(reviewID)
  await rev.sync()
  var pts = getPointsDBJig()
  await pts.sync()
  return pts.get(reviewID)
}

async function downvoteReview(log, reviewID, downvotedUser) {
  log.info('User ['+downvotedUser+'] Downvoting review ['+reviewID+']...')
  run.activate()
  await run.sync()
  if (reviewID == null) {
    throw new Error('No review ID to found to load')
  }
  var rev = await run.load(reviewID)
  await rev.sync()
  var pts = getPointsDBJig()
  await pts.sync()
  if (pts.get(reviewID) === null) {
    pts.set(reviewID, {score: 0, upvotedUsers: [], downvotedUsers: []})
  }
  await pts.sync()
  var voters = pts.get(reviewID)
  var payees = voters.downvotedUsers
  var tokes = new Jigs.BadReviewToken(3)
  tokes.send(rev.owner)
  await run.sync()
  var newScore = pts.downvote(reviewID, downvotedUser)
  if (payees.length > 0) {
    await payVoters(log, payees, rev.reviewLocation.name)
  }
  await run.sync()
  await users.AddNotification(log, rev.user, downvotedUser + ' downvoted your review for '+rev.reviewLocation.name+' costing you 3 reputation points')
}

async function upvoteReview(log, reviewID, upvotedUser) {
  log.info('User ['+upvotedUser+'] Upvoting review ['+reviewID+']...')
  run.activate()
  await run.sync()
  var rev = await run.load(reviewID)
  await rev.sync()
  var pts = getPointsDBJig()
  await pts.sync()

  if (pts.get(reviewID) == null) {
    pts.set(reviewID, {score: 0, upvotedUsers: [], downvotedUsers: []})
  }
  var tokes = await loadRepTokens()
  await tokes.sync()
  await run.sync()
  tokes.send(rev.owner, 5)
  await tokes.sync()
  await pts.sync()

  var voters = pts.get(reviewID)
  var payees = voters.upvotedUsers
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
  log.info("Successfully sent ["+rev.user+"] 5000 satoshis")
  await pts.sync()
  await run.sync()
  if (payees.length > 0) {
    await payVoters(log, payees, rev.reviewLocation.name)
  }
  await run.sync()
  await users.AddNotification(log, rev.user, upvotedUser + ' paid you 5000 satoshis for your review of '+rev.reviewLocation.name+' earning you 5 reputation points')
}

async function payVoters(log, voters, locationName) {
  run.activate()
  await run.sync()
  log.info('Paying curators: ' + voters)
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
    await users.AddNotification(log, voter, 'You earned 550 satoshis from your vote of '+ locationName)
  }
  log.info('Successfully paid and notified curators: ' + voters)
}

async function buildImages(log, images) {
  var imageList = []
  if (images == null) {
    return imageList
  }
  try {
    for (var i=0;i<images.length;i++) {
      log.info('Loading image #'+i+' ...')
      await images[i].sync()
      var im = await run.load(images[i].location)
      imageList.push(im.getData())
    }
  } catch(e) {
    log.error(e)
    throw e
  }
  return imageList
}

async function loadReviewsForUser(log, userID) {
  log.info("Loading reviews for: " + userID)
  var user = await users.LoadUser(log, userID)
  var reviewList = []
  run.activate()
  await run.sync()
  for (var i=0;i<user.reviews.length;i++) {
    try {
      var rev = await run.load(user.reviews[i].location)
      await rev.sync()
      var ptsdb = getPointsDBJig()
      await ptsdb.sync()
      var pts = ptsdb.get(user.reviews[i].origin)
      var images = []
      if (rev.images != null && rev.images.length !== 0) {
        images = await buildImages(rev.images)
      }
      var origin = user.reviews[i].origin.split('_')[0]
      var tx = await run.blockchain.fetch(origin)
      var time = new Date(tx.time)
      var location = {
        placeID: rev.reviewLocation.placeID,
        name: rev.reviewLocation.name,
        coords: {
          lat: rev.reviewLocation.lat,
          lng: rev.reviewLocation.lng,
        }
      }
      reviewList.push({locationName: rev.locationName, location: location, user: rev.user, rating: rev.rating, body: rev.body, images: images, points: pts, origin: rev.origin, timestamp: time})
    } catch(e) {
      log.error(e)
      throw e
    }
  }
  log.info("Successfully loaded reviews for: " + userID)
  return reviewList
}

async function editReview(log, origin, paymail, newBody, newRating, newImages) {
  log.info('User ['+paymail+'] editing review ['+origin+']...')
  run.activate()
  await run.sync()
  var db = users.GetUserDB()
  await db.sync()
  var user = db.get(paymail)
  if (user == null) {
    throw new Error('User not found')
  }
  var keys = users.DecryptKeys(user.keys)
  try {
    var userRunInstance = await users.LoadUserRunInstance(keys)
  } catch(e) {
    throw new Error('Couldnt load instance')
  }
  var rev = await userRunInstance.load(origin)
  await rev.sync()
  if (rev.constructor.name === 'Review') {
    rev = await convertReview(log, rev)
    if (rev == null) {
      throw new Error('Something went wrong')
    }
    userRunInstance.activate()
  }
  userRunInstance.transaction.begin()
  if (rev.body !== newBody) {
    log.info('Updating body...')
    rev.updateBody(newBody, Date.now())
  }
  if (rev.rating !== newRating) {
    log.info('Updating rating...')
    rev.updateRating(newRating, Date.now())
  }
  if (newImages !== null && newImages.length > 0) {
    log.info('Attaching images...')
    for (var i=0;i<newImages.length;i++) {
      rev.addImage(newImages[i], Date.now())
    }
  }
  userRunInstance.transaction.end()
  await run.sync()
  log.info('User ['+paymail+'] successfully edited review ['+origin+']')
}

async function convertReview(log, oldReview) {
  if (oldReview.constructor.name !== 'Review') {
    throw 'Trying to convert a review that is not v1'
  }
  if (oldReview.reviewLocation.constructor.name !== 'LocationV01') {
    var loc = await convertLocation(log, oldReview.reviewLocation)

    var revs = Object.entries(loc.reviews)
    for (var [key,value] of revs) {
      if (key === oldReview.user) {
        return value
      }
    }
  }

  return null
}

async function convertLocation(log, location) {
  log.info('Converting location: '+location.name)
  run.activate()
  if (location.constructor.name === 'LocationV01') {
    throw new Error('Location is already converted to newest version')
  }
  var locs = getAllLocationsJig()
  if (locs == null) {
    throw new Error('Failed to find all locations jig')
  }
  await locs.sync()
  var loc = locs.get(location.placeID)
  if (location.origin !== loc.location) {
    throw new Error('origin of location did not match')
  }
  var newLoc = createLocation(location.placeID, location.name, loc.coords)
  await newLoc.sync()

  //Sync up dbs
  var userdb = users.GetUserDB()
  await userdb.sync()
  var pointsdb = getPointsDBJig()
  if (pointsdb == null) {
    throw new Error('Failed to find pointsdb jig')
  }
  await pointsdb.sync()

  var revs = Object.entries(location.reviews)
  // Convert all reviews
  for (var [key,value] of revs) {
    await newLoc.sync()
    log.info('Recreating review for user: '+key)
    await value.sync()
    var rev = newLoc.createReview(value.body, value.rating, value.user, Date.now())
    await rev.sync()
    await run.sync()
    var user = userdb.get(value.user)
    if (user == null) {
      throw new Error('User not found')
    }
    var keys = users.DecryptKeys(user.keys)
    var points = pointsdb.get(value.origin)
    run.transaction.begin()
    rev.send(keys.pubKey)
    pointsdb.set(rev.origin, {score: points.score, upvotedUsers: points.upvotedUsers, downvotedUsers: points.downvotedUsers})
    run.transaction.end()
    try {
      var userRunInstance = await users.LoadUserRunInstance(keys)
    } catch(e) {
      throw new Error('Couldnt load instance')
    }
    userRunInstance.activate()
    log.info('Burning old review...')
    value.send(BURN_ADDRESS)
    log.info('Successfully burnt old review.')
    run.activate()
    await run.sync()
  }
  var newSet = {location: newLoc.origin, coords: loc.coords}
  locs.set(location.placeID, newSet)
  log.info('Successfully converted location: '+location.name)
  return newLoc
}

async function handleReviewCreate(log, placeID, params) {
  run.activate()
  await run.sync()
  var instance = run
  var userdb = users.GetUserDB()
  await userdb.sync()
  var user = userdb.get(params.userID)
  var pointsdb = getPointsDBJig()
  if (pointsdb == null) {
    throw new Error('Failed to find pointsdb jig')
  }
  await pointsdb.sync()
  var locs = getAllLocationsJig()
  if (locs == null) {
    throw new Error('Failed to find all locations jig')
  }
  await locs.sync()
  var loc = locs.get(placeID)
  // Has location jig been created yet?
  if (loc == null) {
    log.info('Location does not exist, creating location jig for: '+ params.locationName)
    loc = createLocation(placeID, params.locationName, params.coords)
    await loc.sync()
    log.info('Successfully created location: ' + placeID)
    locs.set(placeID, {location: loc.location, coords: params.coords})
    log.info('Successfully added location to AllLocations jig')
  } else {
    // If location is owned by a user, set proper run instance
    if (loc.ownedBy != null) {
      var business = userdb.get(loc.ownedBy)
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
      await userRunInstance.sync()
      instance = userRunInstance
    }
    // Load locatio jig
    loc = await instance.load(loc.location)
    await loc.sync()
    if (loc.constructor.name === 'Location') {
      loc = await convertLocation(log, loc)
    }
  }
  await run.sync()
  var rev = loc.createReview(params.reviewBody, params.rating, params.userID, Date.now())
  log.info(params.userID+ ' Successfully created a review for: ' + params.locationName)
  var bug = Buffer.from(user.keys)
  var enc = ecies.bitcoreECIES().privateKey(ownerPrivKey).decrypt(bug)
  var keys = JSON.parse(enc.toString())
  await run.sync()
  for (var i=0;i<params.images.length;i++) {
    log.info('Adding image #'+i+' to review')
    try {
      //var imageChunked = Jigs.Image.build(params.images[i])
      rev.addImage(params.images[i], Date.now())
    } catch(e) {
      log.error(e)
    }
  }
  await rev.sync()
  await run.sync()
  var token = await loadRepTokens()
  run.transaction.begin()
  rev.send(keys.pubKey)
  pointsdb.set(rev.origin, {score: 0, upvotedUsers: [], downvotedUsers: []})
  log.info('Sending review to user: ' + params.userID)
  token.send(keys.pubKey, 1)
  await run.transaction.end()
  await run.sync()
  // Send user 5000 satoshis
  log.info('Successfully sent review to user: ' + params.userID)
  log.info('Issued 1 reputation point to: ' + params.userID)
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
  await run.sync()
  await run.blockchain.broadcast(tx)
  log.info("Successfully sent ["+rev.user+"] 5000 satoshis")
  await run.sync()
  await users.AddNotification(log, rev.user, 'You earned 1 reputation point and 5000 satoshis for reviewing '+params.locationName)
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

async function loadRepTokens() {
  run.activate()
  await run.sync()
  var jigs = run.owner.jigs
  for (var i=0;i<jigs.length;i++) {
    if (jigs[i].constructor.name === 'TrueReviewToken') {
      await jigs[i].sync()
      if (jigs[i].amount > 100) {
        return jigs[i]
      }
    }
  }
  return null
}

module.exports = router;
module.exports.GetScore = getReviewScore
module.exports.UpvoteReview = upvoteReview
module.exports.DownvoteReview = downvoteReview
module.exports.GetReviewTimestamp = getReviewTimestamp
module.exports.EditReview = editReview
module.exports.CreateReview = handleReviewCreate
module.exports.GetAllLocations = getAllLocationsJig
module.exports.BuildImages = buildImages
