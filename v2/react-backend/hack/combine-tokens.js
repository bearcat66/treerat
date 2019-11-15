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
loadReviewToken()

async function loadReviewToken() {
  run.activate()
  await run.sync()
  var token = run.owner.jigs.find(function(i) {
    return i.constructor.name === 'ReviewToken' && i.amount > 100
  })
  for (var i=0;i<run.owner.jigs.length;i++) {
    var jig = run.owner.jigs[i]
    if (jig.constructor.name === 'ReviewToken' && jig.amount < 100) {
      console.log(token)
      console.log(jig)
      token = Jigs.ReviewToken.combine(token, jig)
    }
  }
  await run.sync()
  console.log(token)
}
