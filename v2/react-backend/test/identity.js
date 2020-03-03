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
const assert = require('assert')
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

async function testBadIdentityCreate() {
  run.activate()
  await run.sync()
  var success = 0
  log.debug('Synced Mock Run instance...')
  try {
    var params = {name: '', phone: '800-100-1000', address: '65 Highway Ln', email: 'bob@gmail.com', paymail: 'bob@moneybutton.com'}
    var id = new ID.Identity(params)
  } catch(e) {
    log.debug(e.message)
    return true
  }
  return false
}

async function testValidIdentityCreate() {
  run.activate()
  await run.sync()
  log.debug('Synced Mock Run instance...')
  try {
    var params = {name: 'Bob Dylan', phone: '800-100-1000', address: '65 Highway Ln', email: 'bob@gmail.com', paymail: 'bob@moneybutton.com'}
    var id = new ID.Identity(params)
  } catch(e) {
    log.error(e)
    return null
  }
  return id
}

describe('Test Suite', function() {
  it('test bad identity create', async function() {
    var succeeded = await testBadIdentityCreate()
    assert.ok(succeeded)
  })
  it('test valid identity create', async function() {
    var id = await testValidIdentityCreate()
    log.debug(id)
    assert.notEqual(id, null)
    assert.equal(id.personalInformation.name, "Bob Dylan")
  })
})

