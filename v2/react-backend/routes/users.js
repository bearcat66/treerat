var mb = require('@moneybutton/api-client')
var bsv = require('bsv')
var ecies = require('bsv/ecies')

var express = require('express');
var router = express.Router();

const Run = require('../lib/run.node.min')
const Jigs = require('../lib/jigs')
const run = Jigs.RunTrueReview
const MB_OAUTH_ID = process.env.REACT_APP_MBOAUTHID
const GOOGLE_KEY = process.env.REACT_APP_GOOGLE_API_KEY
const ownerPrivKey = bsv.PrivateKey.fromWIF(Jigs.OWNER_KEY)
const ownerPubKey = bsv.PublicKey.fromPrivateKey(ownerPrivKey)
const logger = require('../src/logger')
var log = logger.CreateLogger()

/* GET users listing. */
router.get('/', function(req, res, next) {
  run.activate()
  //ensureUserDBCreated()
  var users = getAllUsers(log)
  users.then(r=> {
    res.json(r)
  })
});


router.get('/:id', function(req, res, next) {
  run.activate()
  //ensureUserDBCreated()
  //log.info(req.session.user.accessToken)
  loadUserInfo(log, req.params.id).then(r=> {
    run.activate()
    res.json(r)
  }).catch(e => {
    log.error(e)
    res.status(404).send(JSON.stringify({"error": e}))
  })
});

router.get('/:id/profile', function(req, res, next) {
  run.activate()
  //ensureUserDBCreated()
  loadUserProfile(log, req.params.id).then(r=> {
    run.activate()
    res.json(r)
  }).catch(e => {
    res.status(404).send(JSON.stringify({"error": e}))
  })
});
router.post('/:id', function(req, res) {
  run.activate()
  //ensureUserDBCreated()
  createUser(log, req.params.id, req.body.profile, req.body.businessAccount).then(r=> {
    res.json(r)
  }).catch(e => {
    log.error(e)
    res.status(409).send(JSON.stringify({'error': e}))
  })
})

async function createUser(log, id, profile, isBusinessAccount) {
  run.activate()
  await run.sync()
  var db = getUserDB()
  await db.sync()
  var user = db.get(profile.primaryPaymail)
  if (user != null) {
    throw 'User already exists'
  }
  let userPrivKey = bsv.PrivateKey.fromRandom(bsv.Networks[Jigs.BSVNETWORK])
  let userPubKey = bsv.PublicKey.fromPrivateKey(userPrivKey)

  var keys = {privKey: userPrivKey.toWIF(), pubKey: userPubKey.toString()}
  var msg = ecies.bitcoreECIES().privateKey(ownerPrivKey).publicKey(ownerPubKey).encrypt(JSON.stringify(keys))

  var userProfile = {
    profile: profile,
    keys: new Uint8Array(msg),
    businessAccount: isBusinessAccount
  }
  db.set(profile.primaryPaymail, userProfile)
  log.info('User [' + profile.primaryPaymail+'] uploaded to userDB object')
  await db.sync()
  var address = bsv.Address.fromPublicKey(userPubKey)
  log.info('Address: '+ address)
  var token = await loadAlphaTesterToken()
  var reviews = await loadReviewToken()
  var votes = await loadVoteToken()
  run.activate()
  run.transaction.begin()
  token.send(keys.pubKey, 1)
  reviews.send(keys.pubKey, 5)
  votes.send(keys.pubKey, 10)
  run.transaction.end()
  await run.sync()
  return {address: address.toString()}
}

async function loadUserProfile(log, id) {
  log.info('Loading user profile for: ' + id)
  run.activate()
  await run.sync()
  var db = getUserDB()
  await db.sync()
  var user = db.get(id)
  if (user == null || Object.entries(user).length === 0) {
    throw new Error('User not found')
  }
  return {profile: user.profile}
}

async function loadUserInfo(log, paymail) {
  log.info('Loading user info for: ' + paymail)
  var mbclient = new mb.MoneyButtonClient(MB_OAUTH_ID)
  //await mbclient.setAccessToken(accessToken)
  //var expiration = await mbclient.getExpirationTime()
  //log.info(expiration)
  //log.info(Date(expiration))
  run.activate()
  await run.sync()
  var db = getUserDB()
  await db.sync()
  var user = db.get(paymail)
  if (user == null || Object.entries(user).length === 0) {
    throw new Error('User not found')
  }
  try {
    var bug = Buffer.from(user.keys)
    var enc = ecies.bitcoreECIES().privateKey(ownerPrivKey).decrypt(bug)
    var keys = JSON.parse(enc.toString())
  } catch(e) {
    throw e
  }
  var userRunInstance = new Run({
    network: Jigs.NETWORK,
    owner: keys.privKey,
    purse: Jigs.PURSE_KEY,
    app: Jigs.APP_ID
  })
  userRunInstance.activate()
  await userRunInstance.sync()
  var jigs = userRunInstance.owner.jigs
  var reviewList = []
  var locationList = []
  var alphaTokens = 0
  var tokens = 0
  var badTokens = 0
  var coupons = []
  for (var i=0; i < jigs.length; i++) {
    if (jigs[i].constructor.name === 'Review') {
      if (jigs[i].reviewLocation == null) {
        log.error(new Error('Review with no location found: '+ jigs[i].location))
        continue
      }
      reviewList.push({location: jigs[i].location, locationName: jigs[i].reviewLocation.name, origin: jigs[i].origin})
    }
    if (jigs[i].constructor.name === 'Location') {
      await jigs[i].sync()
      locationList.push({name: jigs[i].name, placeID: jigs[i].placeID, redeemableRewards: jigs[i].redeemableRewards})
    }
    if (jigs[i].constructor.name === 'TrueReviewAlphaTesterToken') {
      alphaTokens += jigs[i].amount
    }
    if (jigs[i].constructor.name === 'TrueReviewToken') {
      tokens += jigs[i].amount
    }
    if (jigs[i].constructor.name === 'BadReviewToken') {
      badTokens += jigs[i].amount
    }
    if (jigs[i].constructor.name === 'BusinessCoupon') {
      var res = await fetch('https://maps.googleapis.com/maps/api/place/details/json?key=' + GOOGLE_KEY + '&place_id=' + jigs[i].placeID)
      var place = await res.json()
      var name = ''
      if (place.result == null) {
        name = 'none'
        url = ''
      } else {
        name = place.result.name
        url = place.result.url
      }
      coupons.push({amount: jigs[i].amount, placeID: jigs[i].placeID, placeName: name, placeURL: url})
    }
  }
  var address = bsv.Address.fromPublicKey(bsv.PublicKey.fromHex(keys.pubKey))
  return {reviews: reviewList, locations: locationList, coupons: coupons, tokens: tokens-badTokens, address: address.toString(), profile: user.profile, businessAccount: user.businessAccount, alphaTokens: alphaTokens}
}

/* ALL USERDB FUNCTIONS */
async function ensureUserDBCreated() {
  await run.sync()
  var dbjig = getUserDB()
  if (dbjig === null || dbjig == null) {
    await createUserDB()
  }
  return
}

function getUserDB() {
  return run.owner.jigs.find(x => x.constructor.name === 'UserDB')
}

function getAllUsers(log) {
  return loadAllUsers(log).then(r => {
    return r
  })
}

async function loadAllUsers(log) {
  log.info("Loading all users...")
  var mbclient = new mb.MoneyButtonClient(MB_OAUTH_ID)
  await run.sync()
  var db = getUserDB()
  if (db == null) {
    return null
  }
  var entries = Object.entries(db)
  var userList = []
  for (var [key,value] of entries) {
    if (key === 'owner' || key === 'satoshis' || key === 'location' || key === 'origin') {
      continue
    }
    userList.push({id: key})
  }
  return userList
}

function decryptKeys(keys) {
  try {
    var bug = Buffer.from(keys)
    var enc = ecies.bitcoreECIES().privateKey(ownerPrivKey).decrypt(bug)
    var keys = JSON.parse(enc.toString())
  } catch(e) {
    throw e
  }
  return keys
}

async function loadReviewToken() {
  run.activate()
  await run.sync()
  var token = run.owner.jigs.find(function(i) {
    return i.constructor.name === 'ReviewToken' && i.amount > 100
  })
  return token
}

async function loadVoteToken() {
  run.activate()
  await run.sync()
  var token = run.owner.jigs.find(function(i) {
    return i.constructor.name === 'VoteToken' && i.amount > 100
  })
  return token
}

async function loadAlphaTesterToken() {
  run.activate()
  await run.sync()
  var token = run.owner.jigs.find(function(i) {
    return i.constructor.name === 'TrueReviewAlphaTesterToken' && i.amount > 10
  })
  return token
}
async function loadUserRunInstance(keys) {
  var userRunInstance = new Run({
    network: Jigs.NETWORK,
    owner: keys.privKey,
    purse: Jigs.PURSE_KEY,
    app: Jigs.APP_ID
  })
  userRunInstance.activate()
  await userRunInstance.sync()
  return userRunInstance
}

module.exports = router;
module.exports.LoadUser = loadUserInfo
module.exports.LoadUserProfile = loadUserProfile
module.exports.GetUserDB = getUserDB
module.exports.DecryptKeys = decryptKeys
module.exports.LoadUserRunInstance = loadUserRunInstance
