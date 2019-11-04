var mb = require('@moneybutton/api-client')
var bsv = require('bsv')
var ecies = require('bsv/ecies')

var express = require('express');
var router = express.Router();

//const Run = require('../lib/run.node.min')
//const Jigs = require('../lib/jigs')
//const run = Jigs.RunTrueReview
const MB_OAUTH_ID = process.env.REACT_APP_MBOAUTHID
const MB_CLIENT_ID = process.env.MB_CLIENT_ID
const MB_CLIENT_SECRET = process.env.MB_CLIENT_SECRET
//const ownerPrivKey = bsv.PrivateKey.fromWIF(Jigs.OWNER_KEY)
//const ownerPubKey = bsv.PublicKey.fromPrivateKey(ownerPrivKey)


router.get('/', function(req, res) {
  //run.activate()
  //ensureUserDBCreated()
  console.log('Loading session: ' + req.sessionID)
  if (!req.session.user) {
    console.error('No user found for session: ' + req.sessionID)
    res.status(404).send(JSON.stringify({error: 'no session found'}))
    return
  }
  res.send(JSON.stringify({user: req.session.user.paymail}))
})


module.exports = router;
