const Run = require('../lib/run.node.min')
var Jigs = require('../lib/jigs')
const NETWORK = process.env.NETWORK
const OWNER = process.env.TR_OWNER
const PURSE = process.env.TR_PURSE

const RunTrueReview = new Run ({
  network: NETWORK,
  owner: OWNER,
  purse: PURSE
})

var run = RunTrueReview
loadDB()

async function loadDB() {
  run.activate()
  await run.sync()
  var db = run.owner.jigs.find(x => x.constructor.name === 'AllLocations')
  var userdb = run.owner.jigs.find(x => x.constructor.name === 'UserDB')
  await db.sync()
  await userdb.sync()
  var loc = db.get('ChIJmTCFBohRrIkR8JgjZs6wABY')
  var location = await run.load(loc.location)
  console.log(location)
}
