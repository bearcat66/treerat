const Run = require('../lib/run.node.min')
var Jigs = require('../lib/jigs')
const NETWORK = process.env.TR_NETWORK
const OWNER = process.env.TR_OWNER
const PURSE = process.env.TR_PURSE
const RunTrueReview = new Run ({
  network: NETWORK,
  owner: OWNER,
  purse: PURSE
})

var run = RunTrueReview
createDB()

async function createDB() {
  await run.sync()
  var db = run.owner.jigs.find(x => x.constructor.name === 'RedeemDBF')
  console.log(db)
  if (db == null) {
    console.log('not found')
    var db = await new Jigs.RedeemDBC()
  }
  await db.sync()
  console.log(db.get('test'))
}
