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
//address: 1D8ESnmZ8SU9MJ1hd5EZs9jwJLwn2h5Egp

/* GET users listing. */
router.get('/', function(req, res, next) {
  run.activate()
  //ensureUserDBCreated()
  var users = getAllUsers()
  users.then(r=> {
    res.json(r)
  })
});


router.get('/:id', function(req, res, next) {
  run.activate()
  //ensureUserDBCreated()
  loadUserInfo(req.params.id).then(r=> {
    run.activate()
    res.json(r)
  }).catch(e => {
    console.error(e)
    res.status(404).send(JSON.stringify({"error": e}))
  })
});

router.get('/:id/profile', function(req, res, next) {
  run.activate()
  //ensureUserDBCreated()
  loadUserProfile(req.params.id).then(r=> {
    run.activate()
    res.json(r)
  }).catch(e => {
    res.status(404).send(JSON.stringify({"error": e}))
  })
});
router.post('/:id', function(req, res) {
  run.activate()
  //ensureUserDBCreated()
  createUser(req.params.id, req.body.profile, req.body.businessAccount).then(r=> {
    res.json(r)
  }).catch(e => {
    res.status(409).send(JSON.stringify({'error': e}))
  })
})

async function createUser(id, profile, isBusinessAccount) {
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
  console.log('User [' + profile.primaryPaymail+'] uploaded to userDB object')
  await run.sync()
  await db.sync()
  var address = bsv.Address.fromPublicKey(userPubKey)
  console.log('Address: '+ address)
  var token = new Jigs.TrueReviewAlphaTesterToken(1)
  token.send(keys.pubKey)
  await run.sync()
  return {address: address.toString()}
}

async function loadUserProfile(id) {
  console.log('Loading user profile for: ' + id)
  run.activate()
  await run.sync()
  var db = getUserDB()
  await db.sync()
  var user = db.get(id)
  if (user == null || Object.entries(user).length === 0) {
    throw 'User not found'
  }
  return {profile: user.profile}
}

async function loadUserInfo(paymail) {
  console.log('Loading user info for: ' + paymail)
  run.activate()
  await run.sync()
  var db = getUserDB()
  await db.sync()
  var user = db.get(paymail)
  if (user == null || Object.entries(user).length === 0) {
    throw 'User not found'
  }
  try {
    var bug = new Buffer(user.keys)
    var enc = ecies.bitcoreECIES().privateKey(ownerPrivKey).decrypt(bug)
    var keys = JSON.parse(enc.toString())
  } catch(e) {
    throw e
  }
  var userRunInstance = new Run({
    network: Jigs.NETWORK,
    owner: keys.privKey,
    purse: Jigs.PURSE_KEY
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
        console.error('Review with no location found: '+ jigs[i].location)
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

async function createUserDB() {
  console.log('Creating new UserDB object')
  await run.sync()
  var db = new Jigs.UserDB()
  await db.sync()
}

function getAllUsers() {
  return loadAllUsers().then(r => {
    return r
  })
}

async function loadAllUsers() {
  console.log("Loading all users...")
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

module.exports = router;
module.exports.LoadUser = loadUserInfo
module.exports.LoadUserProfile = loadUserProfile
module.exports.GetUserDB = getUserDB
