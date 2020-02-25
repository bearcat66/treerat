var fetch = require('node-fetch')
const Run = require('../lib/run.node.min')
var Jigs = require('../lib/jigs')
var ID = require('../lib/identity')
var reviews = require('../routes/review.js')
const NETWORK = process.env.TR_NETWORK
const OWNER = process.env.TR_OWNER
const PURSE = process.env.TR_PURSE
const logger = require('../src/logger')
const APP_ID = "TrueReviews"
class redisStateCache {
  async get(location) {
    var value = await redisGet(location)
    return JSON.parse(value)
  }
  async set(location, value) {
    var val = JSON.stringify(value)
    await redisSet(location, val)
  }
}
const {promisify} = require('util')
const redis = require('redis')
var log = logger.CreateLogger()
const redisClient = redis.createClient()
const redisGet = promisify(redisClient.get).bind(redisClient)
const redisSet = promisify(redisClient.set).bind(redisClient)
redisClient.on('error', (err) => {
  log.error('Redis error: ', err)
})

var assert = require('assert');
const MockRun = new Run ({
  //blockchain: 'bitindex',
  network: 'mock',
  //  owner: OWNER,
  //purse: PURSE,
  app: APP_ID,
  //blockchain: blockchainServer,
  //state: new redisStateCache(),
  //logger: console
})

const run = MockRun

async function RunTests() {
  var succeded = testBadIdentityCreate()
  if (!succeded) {
    log.error('Tests FAILED')
    return
  }
  log.info('Tests Succeeded!')
}


async function testBadIdentityCreate() {
  log.info('Testing ID creation...')
  run.activate()
  await run.sync()
  log.debug('Synced Mock Run instance...')
  try {
    var id = new ID.Identity(null, '800-100-1000', '65 Highway Ln', 'bob@gmail.com', 'bob@moneybutton.com')
    log.debug(id)
    id = new ID.Identity('Bob Dylan', '', '65 Highway Ln', 'bob@gmail.com', 'bob@moneybutton.com')
    log.debug(id)
  } catch(e) {
    console.error(e)
    succeeded = true
  }
  return succeeded

}

RunTests()
