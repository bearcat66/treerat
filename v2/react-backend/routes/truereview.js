var mb = require('@moneybutton/api-client')
const {PaymailClient} = require('@moneybutton/paymail-client')

var express = require('express');
var bodyParser = require('body-parser')
var router = express.Router();
var bsv = require('bsv')
var dns = require('dns')
var ecies = require('bsv/ecies')
var Message = require('bsv/message')
var locations = require('./locations.js')
var users = require('./users.js')

const Run = require('../lib/run.node.min')
const Jigs = require('../lib/jigs')
const run = Jigs.RunTrueReview
const ownerPrivKey = bsv.PrivateKey.fromWIF(Jigs.OWNER_KEY)
const MB_OAUTH_ID = process.env.REACT_APP_MBOAUTHID

/* GET locations listing. */
router.post('/:placeID', function(req, res) {
  run.activate()
  createTrueReview(req.params.placeID, req.body.businessID, req.body.amount).then(r => {
    res.json({'redemptionCode': r})
  })
})

router.post('/:placeID/redeem', function(req, res) {
  run.activate()
  redeemCode(req.params.placeID, req.body.userID, req.body.code, req.body.dryRun).then(r => {
    try {
      res.json({'redeemed': true, "dryRun": req.body.dryRun, "placeID": req.body.placeID, "amount": r.reward})
    } catch(e) {
      console.error(e)
    }
  }).catch(e => {
    console.error(e)
    res.status(500).send(JSON.stringify({'error': e, 'redeemed': false}))
  })
})
async function createTrueReview(placeID, businessID, amount) {
  run.activate()
  await run.sync()
  var userdb = users.GetUserDB()
  await userdb.sync()
  var user = userdb.get(businessID)
  if (user == null) {
    throw 'Business user not found'
  }
  var bug = new Buffer(user.keys)
  var enc = ecies.bitcoreECIES().privateKey(ownerPrivKey).decrypt(bug)
  var keys = JSON.parse(enc.toString())

  var userRunInstance = new Run({
    network: 'main',
    owner: bsv.PrivateKey.fromWIF(keys.privKey),
    purse: Jigs.PURSE_KEY
  })
  userRunInstance.activate()
  await userRunInstance.sync()
  var jigs = userRunInstance.owner.jigs
  for (var i=0; i < jigs.length; i++) {
    if (jigs[i].constructor.name === 'Location') {
      if (jigs[i].placeID === placeID) {
        var code = generateCode()
        await jigs[i].sync()
        jigs[i].mintRedeemableReward(amount, code)
        await jigs[i].sync()
        return code
      }
    }
  }
  run.activate()
  throw 'Failed to find location'
}
function getRedeemDB() {
  return run.owner.jigs.find(x => x.constructor.name === 'RedeemDBF')
}

async function redeemCode(placeID, userID, code, dryRun) {
  run.activate()
  console.log('redeeming')
  await run.sync()
  var userdb = run.owner.jigs.find(x => x.constructor.name === 'UserDB')
  await userdb.sync()
  var alldb = locations.GetAllLocationsDB()
  await alldb.sync()

  var place = alldb.get(placeID)
  if (place == null) {
    throw 'PlaceID not found'
  }

  var user = userdb.get(userID)
  if (user == null) {
    throw 'User not found'
  }

  var businessID = alldb.get(placeID).ownedBy
  var business = userdb.get(businessID)
  if (user == null) {
    throw 'Business user not found'
  }

  var bug = new Buffer(business.keys)
  var enc = ecies.bitcoreECIES().privateKey(ownerPrivKey).decrypt(bug)
  var businessKeys = JSON.parse(enc.toString())
  console.log('Loading business run instance')
  var userRunInstance = new Run({
    network: 'main',
    owner: bsv.PrivateKey.fromWIF(businessKeys.privKey),
    purse: Jigs.PURSE_KEY
  })
  userRunInstance.activate()
  await userRunInstance.sync()

  var location = await userRunInstance.load(place.location)
  await location.sync()
  console.log('Available redeemables:')
  for (var i=0;i<location.redeemableRewards.length;i++) {
    var tr = location.redeemableRewards[i]
    if (tr.constructor.name !== 'TrueReview') {
      continue
    }
    await userRunInstance.sync()
    await tr.sync()
    if (tr.redeemed) {
      continue
    }
    console.log(tr.getRedemptionCode() + '  ' + code)
    if (tr.getRedemptionCode() !== code) {
      continue
    }
    if (dryRun) {
      console.log('Dry run redemption')
      return tr
    }

    console.log("Attempting redeem")
    bug = new Buffer(user.keys)
    enc = ecies.bitcoreECIES().privateKey(ownerPrivKey).decrypt(bug)
    userKeys = JSON.parse(enc.toString())
    try {
      var reward = tr.redeem(code, userKeys.pubKey)
      await userRunInstance.sync()
      await tr.sync()
      reward.setPlace(placeID)
      await userRunInstance.sync()
      await reward.sync()
      reward.send(userKeys.pubKey)
      await userRunInstance.sync()
      await reward.sync()
      run.activate()
      var r = await fetch('https://api.cryptonator.com/api/full/bsv-usd')
      var res = await r.json()
      var amount = Math.round(1 / res.ticker.price * 100000000)
      console.log('Sending '+userID+' '+amount+' satoshis')
      var paymailClient = new PaymailClient(dns, fetch)
      await run.sync()
      var purseAddress = new bsv.PrivateKey(Jigs.PURSE2_KEY).toAddress().toString()
      var utxos = await run.blockchain.utxos(purseAddress)
      var output = await paymailClient.getOutputFor(userID, {
        senderHandle: 'truereviews@moneybutton.com',
        amount: amount, // Amount in satoshis
        senderName: 'True Reviews',
        purpose: 'You created a review!',
      }, Jigs.PURSE2_KEY)
      var out = bsv.Transaction.Output({satoshis: amount, script: output})
      var tx = new bsv.Transaction().from(utxos).change(purseAddress).addOutput(out).sign(Jigs.PURSE2_KEY)
      await run.blockchain.broadcast(tx)
      console.log("Successfully sent ["+userID+"] "+amount+" satoshis")
      return tr
    } catch(e) {
      console.error(e)
      throw e
    }
    if (red) {
      await tr.sync()
      return tr
    }
  }
  throw 'Invalid redemption code'
}

function generateCode() {
  var result           = '';
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < 6; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

module.exports = router;
