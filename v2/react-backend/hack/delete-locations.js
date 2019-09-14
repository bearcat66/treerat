const Run = require('../lib/run.node.min')
var bsv = require('../node_modules/bsv')
var ecies = require('../node_modules/bsv/ecies')
//var Jigs = require('../lib/jigs')
var replace = require('replace')
const NETWORK = process.env.TR_NETWORK
const OWNER = process.env.TR_OWNER
const PURSE = process.env.TR_PURSE
const ownerPriv = bsv.PrivateKey.fromWIF(OWNER)
const ownerPub = bsv.PublicKey.fromPrivateKey(ownerPriv)

const RunTrueReview = new Run ({
  network: NETWORK,
  owner: OWNER,
  purse: PURSE
})

var run = RunTrueReview
  var replaceNetwork = 'Mainnet'
if (NETWORK === 'test') {
  replaceNetwork = 'Testnet'
}
deleteJigLocations(replaceNetwork)

function replaceLocation(network, jig, location) {
  var regex = jig+'.'+'origin'+network+' = \'(.+)\''
  var replacement = '//'+jig+'.'+'origin'+network+' = \''+location+'\''
  replace({
    regex: regex,
    replacement: replacement,
    paths: ['../lib/jigs.js']
  })
  regex = jig+'.'+'location'+network+' = \'(.+)\''
  replacement = '//'+jig+'.'+'location'+network+' = \''+location+'\''
  replace({
    regex: regex,
    replacement: replacement,
    paths: ['../lib/jigs.js']
  })
}
async function deleteJigLocations(network) {
  replaceLocation(network, 'VoteToken', '')
  replaceLocation(network, 'TrueReviewToken', '')
  replaceLocation(network, 'BadReviewToken', '')
  replaceLocation(network, 'ReviewToken', '')
  replaceLocation(network, 'TrueReviewAlphaTesterToken', '')
  replaceLocation(network, 'BusinessCoupon', '')
  replaceLocation(network, 'ReviewPointsDB', '')
  replaceLocation(network, 'TrueReview', '')
  replaceLocation(network, 'UserDB', '')
  replaceLocation(network, 'User', '')
  replaceLocation(network, 'AllLocations', '')
  replaceLocation(network, 'ReviewV01', '')
  replaceLocation(network, 'LocationV01', '')
  replaceLocation(network, 'Review', '')
  replaceLocation(network, 'Location', '')
  replaceLocation(network, 'Chunk', '')
  replaceLocation(network, 'Image', '')
}
