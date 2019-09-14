const Run = require('../lib/run.node.min')
var bsv = require('../node_modules/bsv')
var ecies = require('../node_modules/bsv/ecies')
var Jigs = require('../lib/jigs')
const NETWORK = process.env.TR_NETWORK
const OWNER = process.env.TR_OWNER
const PURSE = process.env.TR_PURSE
const ownerPriv = bsv.PrivateKey.fromWIF(OWNER)
const ownerPub = bsv.PublicKey.fromPrivateKey(ownerPriv)

var v1TestnetOrigin = 'b8cc7b352524d7e3935442e6603bdc753ad8f645dde451da902a8b5f222be465_o2'
var v2TestnetOrigin = 'a495abad1e154c6d1e4b0697d953cf9c0544c41eebb30ef1b9083310ddbc1353_o3'
var run = Jigs.RunTrueReview

class v1 extends Run.Jig {
  init(one) {
    this.one = one
  }
  newthing(foo) {
    this.foo = foo
  }
}
v1.originTestnet = '10f636890899774898d57a5f6b1f8c3923cd3f848d9cbc7b4db9127c6bdf9c95_o1'
//v1.locationTestnet = '10f636890899774898d57a5f6b1f8c3923cd3f848d9cbc7b4db9127c6bdf9c95_o1'
class v2 extends v1 {
  init(one, two) {
    this.one = one
    this.two = two
  }
  new(foo) {
    this.foo = foo
  }
}
v2.originTestnet = '30c29f562a5538929bb2c401ed7c538dad1e382254c88de1b3ee1787173358a1_o1'
v2.locationTestnet = '30c29f562a5538929bb2c401ed7c538dad1e382254c88de1b3ee1787173358a1_o1'

//loadJigs()
convertV1ToV2(v1, v2)

async function loadJigs() {
  run.activate()
  await run.sync()
  console.log(run.owner.jigs)
}
//convertV1ToV2(v1, v2)
async function deployv1(v1) {
  run.activate()
  await run.sync()
  var v1 = await run.deploy(v1)
  console.log(v1)
}
async function convertV1ToV2(v1, v2) {
  var v1 = await create(v1)
  console.log(v1)
  v1.newthing('foo')
  await v1.sync()
  console.log(v1)
  var v2 = new v2(v1.one, 'two')
  await v2.sync()
  console.log(v2)
}
async function create(v) {
  run.activate()
  await run.sync()
  var v = new v('foo')
  await v.sync()
  return v
}
async function loadv1(origin) {
  run.activate()
  await run.sync()
  var v1 = await run.load(origin)
  console.log(v1)
}
