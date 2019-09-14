const Run = require('../lib/run.node.min')
var Jigs = require('../lib/jigs')
var review = require('../routes/review.js')
const NETWORK = process.env.TR_NETWORK
const OWNER = process.env.TR_OWNER
const PURSE = process.env.TR_PURSE
const logger = require('../src/logger')
var log = logger.CreateLogger()

var run = Jigs.RunTrueReview

createReview()
async function createReview() {
  run.activate()
  await run.sync()
  var all = review.GetAllLocations()
  await all.sync()
  var loc = all.get(process.argv[2])
  var place = await run.load(loc.location)
  await place.sync()
  console.log(place)
  var rev = place.createReview('test', '5', 'dylan@moneybutton.com')
  await rev.sync()
  rev.addImage(base64ImageData)
  await rev.sync()
  console.log(rev)
}
