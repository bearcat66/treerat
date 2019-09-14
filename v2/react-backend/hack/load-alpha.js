const Run = require('../lib/run.node.min')
var bsv = require('../node_modules/bsv')
var ecies = require('../node_modules/bsv/ecies')
var Jigs = require('../lib/jigs')
const OWNER = process.env.TR_OWNER
const PURSE = process.env.TR_PURSE
const ownerPriv = bsv.PrivateKey.fromWIF(OWNER)
const ownerPub = bsv.PublicKey.fromPrivateKey(ownerPriv)

const RunTrueReview = new Run ({
  network: 'main',
  owner: OWNER,
  purse: PURSE
})

var run = RunTrueReview
sendTokens()

async function sendTokens() {
  run.activate()
  await run.sync()
  await ensureUserDBCreated()
  var newDB = getUserDB()
  await newDB.sync()
  for (var [key, value] of Object.entries(newDB)) {
    if (key === 'owner' || key === 'satoshis' || key === 'location' || key === 'origin') {
      continue
    }
    var bug = new Buffer(value.keys)
    var enc = ecies.bitcoreECIES().privateKey(ownerPriv).decrypt(bug)
    var keys = JSON.parse(enc.toString())
    console.log(keys)
    var token = new Jigs.TrueReviewAlphaTesterToken(1)
    token.send(keys.pubKey)
  }
}

async function loadUserDB() {
  run.activate()
  await run.sync()
  await ensureUserDBCreated()
  var newDB = getUserDB()
  await newDB.sync()
  console.log()
  var userDB = await run.load('02dc963ad01e4aca5b64f35e3fc3df137e9abeec34dbd60e879bc71f0da9418c_01')
  for (var [key, value] of Object.entries(userDB)) {
    if (key === 'owner' || key === 'satoshis' || key === 'location' || key === 'origin') {
      continue
    }
    if (newDB.get(key)) {
      continue
    }
    console.log(key)
    let userPrivKey = bsv.PrivateKey.fromRandom(bsv.Networks.mainnet)
    let userPubKey = bsv.PublicKey.fromPrivateKey(userPrivKey)

    var keys = {privKey: userPrivKey.toWIF(), pubKey: userPubKey.toString()}
    var msg = ecies.bitcoreECIES().privateKey(ownerPriv).publicKey(ownerPub).encrypt(JSON.stringify(keys))

    var userProfile = {
      profile: value.profile,
      keys: new Uint8Array(msg),
      businessAccount: true
    }
    newDB.set(key, userProfile)
    //newDB.set(key, value)
    console.log('Added: '+ key)
  }

  var pointsDB = await run.load('128320e2ae9b2accd7415c2d564f871b6f5c88a5b4b7d91bcc95b0e14df6199f_o1')
  for (var [key, value] of Object.entries(pointsDB)) {
    if (key === 'owner' || key === 'satoshis' || key === 'location' || key === 'origin') {
      continue
    }
    console.log(key)

  }

}

async function loadLocsDB() {
  run.activate()
  await run.sync()
  //var allLocsDB = await run.load('1d7c85e47e67f68f3c5975cd8b47e10987e467775d674f1a2441bf09c2799517_o1')
  await ensureLocationDBCreated()
  var newDB = getAllLocationsJig()
  await newDB.sync()
  console.log(newDB)
}

async function loadPointsDB() {
  run.activate()
  await run.sync()
  //var allLocsDB = await run.load('1d7c85e47e67f68f3c5975cd8b47e10987e467775d674f1a2441bf09c2799517_o1')
  await ensurePointsDBCreated()
  var newDB = getPointsDBJig()
  await newDB.sync()
  console.log(newDB)
}

async function ensureUserDBCreated() {
  await run.sync()
  var dbjig = getUserDB()
  if (dbjig === null || dbjig == null) {
    await createUserDB()
  }
  return
}

async function createUserDB() {
  console.log('Creating new UserDB object')
  await run.sync()
  try {
    var db = new Jigs.UserDB()
  } catch(e) {
    console.error(e)
  }
  await db.sync()
}
function getUserDB() {
  return run.owner.jigs.find(x => x.constructor.name === 'UserDB')
}

async function ensureLocationDBCreated() {
  var dbjig = getAllLocationsJig()
  if (dbjig === null || dbjig == null) {
    await createAllLocations()
  }
  return
}

function getAllLocationsJig() {
  return run.owner.jigs.find(x => x.constructor.name === 'AllLocations')
}

async function createAllLocations() {
  console.log('Creating new AllLocations object')
  var all = new Jigs.AllLocations()
  await all.sync()
  await run.sync()
}

function getPointsDBJig() {
  return run.owner.jigs.find(x => x.constructor.name === 'ReviewPointsDB')
}

async function ensurePointsDBCreated() {
  var dbjig = getPointsDBJig()
  if (dbjig === null || dbjig == null) {
    await createPointsDB()
  }
  return
}
async function createPointsDB() {
  console.log('Creating Points DB Object')
  new Jigs.ReviewPointsDB()
  await run.sync()
}

