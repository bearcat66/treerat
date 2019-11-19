var mb = require('@moneybutton/api-client')
var bsv = require('bsv')

var express = require('express');
var router = express.Router();

const Run = require('../lib/run.node.min')
const Jigs = require('../lib/jigs')
const run = Jigs.RunTrueReview
const MB_OAUTH_ID = process.env.REACT_APP_MBOAUTHID
const MB_CLIENT_ID = process.env.MB_CLIENT_ID
const MB_CLIENT_SECRET = process.env.MB_CLIENT_SECRET
//const ownerPrivKey = bsv.PrivateKey.fromWIF(Jigs.OWNER_KEY)
//const ownerPubKey = bsv.PublicKey.fromPrivateKey(ownerPrivKey)


router.get('/:id', function(req, res) {
  loadTx(req.params.id).then(r => {
    res.send(JSON.stringify({transaction: r}))
  }).catch(e => {
    log.error(e)
    res.status(404).send(JSON.stringify({error: "TX not found"}))
  })
})

async function loadTx(id) {
  run.activate()
  await run.sync()
  var t = await run.blockchain.fetch(id)
  var jigs = []
  for (var i=0;i<t.outputs.length;i++) {
    var j = i + 1
    try {
      var jig = await run.load(id+'_o'+j)
    } catch (e) {
      continue
    }
    jigs.push(jig)
  }
  var out = parseJigs(jigs)
  return out
}

function parseJigs(jigs) {
  var outs = []
  for (var i=0;i<jigs.length;i++) {
    var jig = jigs[i]
    var type = jig.constructor.name
    var out = {type: type}
    switch(type) {
      case 'Location':
        var revs = Object.entries(jig.reviews)
        out.placeID = jig.placeID
        out.lat = jig.lat
        out.lng = jig.lng
        out.name = jig.name
        out.reviewCount = revs.length
        break
      case 'Review':
        out.body =  jig.body
        out.rating = jig.rating
        out.user = jig.user
        break
      default:
        log.error('No parser for: ' + type)
    }
    outs.push(out)
  }
  return outs
}
module.exports = router;
