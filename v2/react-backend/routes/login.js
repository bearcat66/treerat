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


router.post('/:id', function(req, res) {
  //run.activate()
  //ensureUserDBCreated()
  loginUser(req.params.id, {code: req.body.code, state: req.body.state}).then(r=> {
    req.session.user = {paymail: req.params.id, accessToken: r.accessToken, refreshToken: r.refreshToken, expires: r.expires}
    res.json(r)
  }).catch(e => {
    console.error(e)
    res.status(409).send(JSON.stringify({'error': e}))
  })
})

async function loginUser(paymail, oauth) {
  try {
    var mbclient = new mb.MoneyButtonClient(MB_OAUTH_ID)
    await mbclient.authorizeWithAuthFlowResponse(oauth, oauth.state, 'http://localhost:3000/login')
    var refreshToken = mbclient.getRefreshToken()
    var accessToken = await mbclient.getValidAccessToken()
    var expiration = await mbclient.getExpirationTime()
    var expire = new Date(expiration)
  } catch(e) {
    throw(e)
  }
  return {accessToken: accessToken, refreshToken: refreshToken, expires: expire}
  /*await run.sync()
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
  db.set(profile.primaryPaymail, userProfile)*/
}


module.exports = router;
