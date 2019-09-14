const Run = require('../lib/run.node.min')
var bsv = require('../node_modules/bsv')
var ecies = require('../node_modules/bsv/ecies')
var Jigs = require('../lib/jigs')
const NETWORK = process.env.TR_NETWORK
const OWNER = process.env.TR_OWNER
const PURSE = process.env.TR_PURSE
const ownerPriv = bsv.PrivateKey.fromWIF(OWNER)
const ownerPub = bsv.PublicKey.fromPrivateKey(ownerPriv)

var run = Jigs.RunTrueReview
var dylanOrigin = '8d0a70f2798a1616482623a7a7d6d5169fd8c41dbf77e58aa518ee9ceef7e17f_o1'
loadUser(dylanOrigin)

async function loadJig(user) {
  run.activate()
  await run.sync()
  var db = getUserDB()
  var dylan = db.get(user)
  console.log(dylan.userOrigin)
  var jig = await run.load(dylan.userOrigin)
  await jig.sync()
  console.log(jig)
  jig.clearNotifications()
  await jig.sync()
  console.log(jig.getNotifications())
}

async function getDb() {
  run.activate()
  await run.sync()
  var db = getUserDB()
  var dylan = db.get('dylan@moneybutton.com')
  console.log(dylan)
}
async function setDb(dylanOrigin) {
  run.activate()
  await run.sync()
  var db = getUserDB()
  var dylan = db.get('dylan@moneybutton.com')
  console.log(dylan)
  var newEntry = {
    keys: dylan.keys,
    profile: dylan.profile,
    businessAccount: true,
    following: dylan.following,
    followedBy: dylan.followedBy,
    userOrigin: dylanOrigin
  }
  console.log(newEntry)
  db.set('dylan@moneybutton.com', newEntry)
}

async function loadUser(origin) {
  run.activate()
  await run.sync()
  var user = await run.load(origin)
  await user.sync()
  console.log(user.getNotifications())
  //user.clearNotifications()
  //console.log(user.getNotifications())
  user.newNotification('kaitlyn@moneybutton.com upvoted your review of Over The Falls')
  await user.sync()
  console.log(user.getNotifications())
}
async function createUser() {
  run.activate()
  await run.sync()
  var user = new Jigs.User("dylan@moneybutton.com", "Dylan Murray", Date.now())
  await user.sync()
  user.newNotification('You have a new review')
  await user.sync()
  console.log(user)
}
function getUserDB() {
  return run.owner.jigs.find(x => x.constructor.name === 'UserDB')
}

