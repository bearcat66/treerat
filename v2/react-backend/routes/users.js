var bsv = require('bsv')
var ecies = require('bsv/ecies')
var fs = require('fs')
var path = require("path")
var express = require('express');
var router = express.Router();

const Run = require('../lib/run.node.min')
const Jigs = require('../lib/jigs')
const run = Jigs.RunTrueReview
const GOOGLE_KEY = process.env.REACT_APP_GOOGLE_API_KEY
const ownerPrivKey = bsv.PrivateKey.fromWIF(Jigs.OWNER_KEY)
const ownerPubKey = bsv.PublicKey.fromPrivateKey(ownerPrivKey)
const logger = require('../src/logger')
var log = logger.CreateLogger()

/* GET users listing. */
router.get('/', function(req, res, next) {
  run.activate()
  var users = getAllUsers(log)
  users.then(r=> {
    res.json(r)
  })
});

router.get('/top', function(req, res, next) {
  run.activate()
  loadTopUsers(log).then(r=> {
    res.json(r)
  }).catch(e => {
    log.error(e)
    res.status(500).send(JSON.stringify({"error": e}))
  })
});

router.get('/:id', function(req, res, next) {
  run.activate()
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
  loadUserProfile(log, req.params.id).then(r=> {
    run.activate()
    res.json(r)
  }).catch(e => {
    res.status(404).send(JSON.stringify({"error": e}))
  })
});

router.post('/:id', function(req, res) {
  run.activate()
  createUser(log, req.params.id, req.body.profile, req.body.businessAccount).then(r=> {
    res.json(r)
  }).catch(e => {
    log.error(e)
    res.status(409).send(JSON.stringify({'error': e}))
  })
})

// I NEED MIDDLEWARE THAT CHECKS SESSION ID AND COMPARES IT TO 
router.post('/:id/notifications/clear', function(req, res) {
  run.activate()
  clearNotifications(log, req.params.id).then(r => {
    res.json(r)
  }).catch(e => {
    log.error(e)
    res.status(500).send(JSON.stringify({'error': e}))
  })
})

router.get('/:id/notifications', function(req, res) {
  run.activate()
  getNotifications(log, req.params.id).then(r => {
    res.json(r)
  }).catch(e => {
    log.error(e)
    res.status(500).send(JSON.stringify({'notifications': []}))
  })
})

router.post('/:id/follow', function(req, res) {
  run.activate()
  followUser(log, req.params.id, req.session.user.paymail).then(r => {
    res.json(r)
  }).catch(e => {
    log.error(e)
    res.status(500).send(JSON.stringify({'error': e}))
  })
})

async function getNotifications(log, user) {
  run.activate()
  await run.sync()
  var db = getUserDB()
  await db.sync()
  var userEntry = db.get(user)
  var userJig = await run.load(userEntry.userOrigin)
  await userJig.sync()
  var notifications = userJig.getNotifications()
  return {notifications: notifications}
}

async function followUser(log, followed, follower) {
  if (follower === followed) {
    throw new Error('User ['+follower+'] may not follow themselves')
  }
  log.info('User [' + follower +'] has followed [' + followed + ']')
  run.activate()
  await run.sync()
  var db = getUserDB()
  await db.sync()
  var userFollower = db.get(follower)
  var userFollowed = db.get(followed)
  var userFollowerNew = {
    profile: userFollower.profile,
    keys: userFollower.keys,
    businessAccount: true,
    following: userFollower.following,
    followedBy: userFollower.followedBy
  }
  var userFollowedNew = {
    profile: userFollowed.profile,
    keys: userFollowed.keys,
    businessAccount: true,
    following: userFollowed.following,
    followedBy: userFollowed.followedBy
  }
  if (userFollowerNew.following == null && userFollowerNew.followedBy == null) {
    userFollowerNew.following = []
    userFollowerNew.followedBy = []
  }
  if (userFollowedNew.following == null && userFollowedNew.followedBy == null) {
    userFollowedNew.following = []
    userFollowedNew.followedBy = []
  }
  for (var i=0;i<userFollowerNew.following.length;i++) {
    if (userFollowerNew.following[i] === followed) {
      log.error('User ['+follower+'] is already following ['+followed+']')
      return
    }
  }
  for (var i=0;i<userFollowedNew.followedBy.length;i++) {
    if (userFollowedNew.followedBy[i] === follower) {
      log.error('User ['+followed+'] is already followed by ['+follower+']')
      return
    }
  }
  userFollowerNew.following.push(followed)
  userFollowedNew.followedBy.push(follower)
  run.transaction.begin()
  db.set(follower, userFollowerNew)
  db.set(followed, userFollowedNew)
  run.transaction.end()
  log.info('User ['+follower+'] is now following ['+followed+']')
}

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

  var userJig = new Jigs.User(profile.primaryPaymail, profile.name)
  await userJig.sync()

  var userProfile = {
    profile: profile,
    keys: new Uint8Array(msg),
    businessAccount: isBusinessAccount,
    following: [],
    followedBy: [],
    userOrigin: userJig.origin,
  }
  db.set(profile.primaryPaymail, userProfile)
  log.info('User [' + profile.primaryPaymail+'] uploaded to userDB object')
  await db.sync()
  var address = bsv.Address.fromPublicKey(userPubKey)
  log.info('Address: '+ address)
  var token = await loadAlphaTesterToken()
  run.activate()
  run.transaction.begin()
  if (isAlphaUser(profile.primaryPaymail)) {
    token.send(keys.pubKey, 1)
  }
  userJig.newNotification('Welcome to True Reviews! Get started by creating your first review!')
  run.transaction.end()
  await run.sync()
  return {address: address.toString()}
}

function isAlphaUser(user) {
  var raw = fs.readFileSync(path.resolve(__dirname, '../hack/data/alpha-user-stats.json'))
  var data = JSON.parse(raw)
  for (i=0;i<data.length;i++) {
    if (user === data[i].paymail) {
      return true
    }
  }
  return false
}

async function loadUserJig(user) {
  var db = getUserDB()
  var userEntry = db.get(user)
  var jig = await run.load(userEntry.userOrigin)
  await jig.sync()
  return jig
}

async function clearNotifications(log, user) {
  log.info('Clearing notifications for user: '+user)
  run.activate()
  await run.sync()
  var jig = await loadUserJig(user)
  await jig.sync()
  jig.clearNotifications()
  await jig.sync()
  log.info('Successfully cleared notifications for user: '+user)
}

/*async function notifyMultipleVoters(log, paymails, notification) {
  log.info('Adding notifications for multiple users: '+ paymails)
  run.activate()
  await run.sync()
  var db = getUserDB()
  await db.sync()
  var user = db.get(paymail)
  if (user == null || Object.entries(user).length === 0) {
    throw new Error('User not found')
  }
  if (user.userOrigin != null) {
    var userJig = await run.load(user.userOrigin)
    await userJig.sync()
  } else {
    throw new Error('User does not have associated user jig')
  }
  userJig.newNotification(notification)
  log.info('Successfully added notification for user: '+ paymail)
}*/

async function addNotification(log, paymail, notification) {
  log.info('Adding notification for user: '+ paymail)
  run.activate()
  await run.sync()
  var db = getUserDB()
  await db.sync()
  var user = db.get(paymail)
  if (user == null || Object.entries(user).length === 0) {
    throw new Error('User not found')
  }
  if (user.userOrigin != null) {
    var userJig = await run.load(user.userOrigin)
  } else {
    var userJig = await createUserJig(log, paymail, user)
  }
  await userJig.sync()
  await run.sync()
  userJig.newNotification(notification)
  log.info('Successfully added notification for user: '+ paymail)
}

async function createUserJig(log, paymail, userEntry) {
  log.info('Creating user jig for user ['+paymail+']')
  run.activate()
  await run.sync()
  var userJig = new Jigs.User(paymail, userEntry.profile.name)
  await userJig.sync()
  var newEntry = {
    keys: userEntry.keys,
    profile: userEntry.profile,
    businessAccount: true,
    following: userEntry.following,
    followedBy: userEntry.followedBy,
    userOrigin: userJig.origin,
  }
  await run.sync()
  var db = getUserDB()
  await db.sync()
  db.set(paymail, newEntry)
  log.info('Successfully created user jig for user ['+paymail+']')
  return userJig
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
  if (user.userOrigin != null) {
    var userJig = await run.load(user.userOrigin)
    await userJig.sync()
    var notifications = userJig.getNotifications()
  } else {
    var notifications = []
  }
  log.info('Successfully loaded user profile for: ' + id)
  return {profile: user.profile, following: user.following, followedBy: user.followedBy, notifications: notifications}
}

async function loadTopUsers(log) {
  log.info('Loading top users...')
  run.activate()
  await run.sync()
  var db = getUserDB()
  await db.sync()
  var entries = Object.entries(db)
  var userList = []
  for (var [key,value] of entries) {
    if (key === 'owner' || key === 'satoshis' || key === 'location' || key === 'origin') {
      continue
    }
    userList.push({id: key})
  }
  var topUsers = []
  return {top: topUsers}
}

async function loadUserInfo(log, paymail) {
  log.info('Loading user info for: ' + paymail)
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
  var userRunInstance = await loadUserRunInstance(keys)
  if (userRunInstance == null) {
    throw new Error('Failed to load user run instance')
  }
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
    if (jigs[i].constructor.name === 'Review' || jigs[i].constructor.name === 'ReviewV01') {
      if (jigs[i].reviewLocation == null) {
        log.error(new Error('Review with no location found: '+ jigs[i].location))
        continue
      }
      reviewList.push({location: jigs[i].location, locationName: jigs[i].reviewLocation.name, origin: jigs[i].origin})
    }
    if (jigs[i].constructor.name === 'Location' || jigs[i].constructor.name === 'LocationV01') {
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
  log.info('Successfully loaded user info for: ' + paymail)
  var address = bsv.Address.fromPublicKey(bsv.PublicKey.fromHex(keys.pubKey))
  return {reviews: reviewList, locations: locationList, coupons: coupons, tokens: tokens-badTokens, address: address.toString(), profile: user.profile, businessAccount: user.businessAccount, alphaTokens: alphaTokens}
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
    app: Jigs.APP_ID,
    state: new Jigs.RedisStateCache()
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
module.exports.CreateUser = createUser
module.exports.LoadUserRunInstance = loadUserRunInstance
module.exports.AddNotification = addNotification
