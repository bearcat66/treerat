var mb = require('@moneybutton/api-client')
var bsv = require('bsv')
var ecies = require('bsv/ecies')

var express = require('express');
var users = require('./users.js');
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
  console.log('Session ['+ req.sessionID+'] loaded for ['+req.session.user.paymail+'] and expires at ['+req.session.user.expires+'].')
  var now = new Date()
  var expires = new Date(req.session.user.expires)
  if (expires < now) {
    console.log('Session for ['+req.session.user.paymail+'] has expired. Renewing access token.')
    getNewAccessToken(req.session.user.accessToken, req.session.user.refreshToken, req.session.user.expires).then(r => {
      req.session.user.accessToken = r.accessToken
      req.session.user.expires = r.expires
      req.session.save()
    })
  }
  users.LoadUserProfile(req.session.user.paymail).then(r => {
    res.send(JSON.stringify({user: req.session.user.paymail, avatarUrl: r.profile.avatarUrl, name: r.profile.name}))
  })
})

async function getNewAccessToken(accessToken, refreshToken, expires) {
  var mbclient = new mb.MoneyButtonClient(MB_OAUTH_ID)
  mbclient.setRefreshToken(refreshToken)
  mbclient.setAccessToken(accessToken)
  mbclient.setExpirationTime(expires)
  var newToken = await mbclient.getValidAccessToken()
  var newExpires = mbclient.getExpirationTime()
  return {accessToken: newToken, expires: newExpires}
}


module.exports = router;
