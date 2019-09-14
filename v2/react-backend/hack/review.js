const Run = require('../lib/run.node.min')
var bsv = require('../node_modules/bsv')
var ecies = require('../node_modules/bsv/ecies')
var Jigs = require('../lib/jigs')
var replace = require('replace')
const NETWORK = process.env.TR_NETWORK
const OWNER = process.env.TR_OWNER
const PURSE = process.env.TR_PURSE
const ownerPriv = bsv.PrivateKey.fromWIF(OWNER)
const ownerPub = bsv.PublicKey.fromPrivateKey(ownerPriv)

var run = Jigs.RunTrueReview

var replaceNetwork = 'Mainnet'
if (NETWORK === 'test') {
  replaceNetwork = 'Testnet'
}
deployAndUpdateJigs(replaceNetwork)

function replaceLocation(network, jig, location) {
  var regex = '\/\/'+jig+'.'+'origin'+network+' = \'\''
  var replacement = jig+'.'+'origin'+network+' = \''+location+'\''
  console.log(regex)
  console.log(replacement)
  replace({
    regex: regex,
    replacement: replacement,
    paths: ['../lib/jigs.js']
  })
  regex = '\/\/'+jig+'.'+'location'+network+' = \'\''
  replacement = jig+'.'+'location'+network+' = \''+location+'\''
  console.log(regex)
  console.log(replacement)
  replace({
    regex: regex,
    replacement: replacement,
    paths: ['../lib/jigs.js']
  })
}
async function deployAndUpdateJigs(network) {
  run.activate()
  await run.sync()
  var reviewLocation = await run.deploy(Jigs.ReviewV01)
  replaceLocation(network, 'ReviewV01', reviewLocation)
}
