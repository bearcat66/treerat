var mb = require('@moneybutton/api-client')
var bsv = require('bsv')
var ecies = require('bsv/ecies')

var express = require('express');
var router = express.Router();
var users = require('./users.js')

//const Run = require('../lib/run.node.min')
const Jigs = require('../lib/jigs')
const run = Jigs.RunTrueReview
const MB_OAUTH_ID = process.env.REACT_APP_MBOAUTHID
const MB_CLIENT_ID = process.env.MB_CLIENT_ID
const MB_CLIENT_SECRET = process.env.MB_CLIENT_SECRET
const ownerPrivKey = bsv.PrivateKey.fromWIF(Jigs.OWNER_KEY)
const ownerPubKey = bsv.PublicKey.fromPrivateKey(ownerPrivKey)


router.get('/', function(req, res) {
  res.send(JSON.stringify({tokens: 'foo'}))
})
router.get('/user/:id', function(req, res) {
  getUserTokens(req.params.id).then(r => {
    res.json(r)
  }).catch(e => {
    console.error(e)
    res.status(500).send(JSON.stringify({error: e}))
  })
})
router.post('/user/:id/reviews', function(req, res) {
  sendReviewTokens(req.params.id, req.body.amount).then(r => {
    res.json({amount: req.body.amount})
  }).catch(e => {
    console.error(e)
    res.status(500).send(JSON.stringify({error: e}))
  })
})

router.post('/user/:id/votes', function(req, res) {
  sendVoteTokens(req.params.id, req.body.amount).then(r => {
    res.json({amount: req.body.amount})
  }).catch(e => {
    res.status(500).send(JSON.stringify({error: e}))
  })
})

async function sendReviewTokens(paymail, amount) {
  run.activate()
  await run.sync()
  var db = users.GetUserDB()
  var user = db.get(paymail)
  if (user == null) {
    throw 'user not found'
  }
  var keys = users.DecryptKeys(user.keys)
  var token = await loadReviewToken()
  token.send(keys.pubKey, amount)
  console.log("Successfully sent [" + paymail + "] [" + amount + "] review tokens")
  return
}

async function sendVoteTokens(paymail, amount) {
  run.activate()
  await run.sync()
  var db = users.GetUserDB()
  var user = db.get(paymail)
  if (user == null) {
    throw 'user not found'
  }
  var keys = users.DecryptKeys(user.keys)
  var token = new Jigs.VoteToken(amount)
  token.send(keys.pubKey)
  console.log("Successfully sent [" + paymail + "] [" + amount + "] vote tokens")
  return
}

async function getUserTokens(paymail) {
  run.activate()
  await run.sync()
  var db = users.GetUserDB()
  var user = db.get(paymail)
  if (user == null) {
    throw 'user not found'
  }
  var keys = users.DecryptKeys(user.keys)
  try {
    var userRunInstance = await users.LoadUserRunInstance(keys)
  } catch(e) {
    console.error(e)
  }
  var jigs = userRunInstance.owner.jigs
  var reviews = 0
  var votes = 0
  for (var i=0; i< jigs.length; i++) {
    var jig = jigs[i]
    if (jig.constructor.name === 'ReviewToken') {
      await jig.sync()
      reviews += jig.amount
    }
    if (jig.constructor.name === 'VoteToken') {
      await jig.sync()
      votes += jig.amount
    }
  }
  return {votes: votes, reviews: reviews}
}

async function redeemVoteToken(paymail) {
  console.log("Redeeming vote token for ["+paymail+"]")
  run.activate()
  await run.sync()
  var db = users.GetUserDB()
  var user = db.get(paymail)
  if (user == null) {
    throw 'user not found'
  }
  var keys = users.DecryptKeys(user.keys)
  try {
    var userRunInstance = await users.LoadUserRunInstance(keys)
  } catch(e) {
    console.error(e)
  }
  var token = userRunInstance.owner.jigs.find(function(i) {
    return i.constructor.name === 'VoteToken'
  })
  if (token == null) {
    throw 'No token found'
  }
  try {
    await token.send(ownerPubKey.toString(), 1)
  } catch(e) {
    console.error(e)
  }
  await userRunInstance.sync()
  await run.sync()
  console.log("Redeemed vote token for ["+paymail+"]")
  return
}

async function redeemReviewToken(paymail) {
  console.log("Redeeming review token for ["+paymail+"]")
  run.activate()
  await run.sync()
  var db = users.GetUserDB()
  var user = db.get(paymail)
  if (user == null) {
    throw 'user not found'
  }
  var keys = users.DecryptKeys(user.keys)
  try {
    var userRunInstance = await users.LoadUserRunInstance(keys)
  } catch(e) {
    console.error(e)
  }
  var token = userRunInstance.owner.jigs.find(function(i) {
    return i.constructor.name === 'ReviewToken'
  })
  if (token == null) {
    throw 'No token found'
  }
  try {
    await token.send(ownerPubKey.toString(), 1)
  } catch(e) {
    console.error(e)
  }
  await userRunInstance.sync()
  await run.sync()
  console.log("Redeemed review token for ["+paymail+"]")
  return
}

async function loadReviewToken() {
  run.activate()
  await run.sync()
  var token = run.owner.jigs.find(function(i) {
    return i.constructor.name === 'ReviewToken' && i.amount > 100
  })
  return token
}
module.exports = router;
module.exports.GetUserTokens = getUserTokens;
module.exports.RedeemVote = redeemVoteToken;
module.exports.RedeemReview = redeemReviewToken;
module.exports.LoadReviewToken = loadReviewToken;
