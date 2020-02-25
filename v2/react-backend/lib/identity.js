const NETWORK = process.env.TR_NETWORK
const OWNER = process.env.TR_OWNER
const PURSE = process.env.TR_PURSE
const PURSE2 = process.env.TR_PURSE2
const APP_ID = "TrueReviews"
const Run = require('./run.node.min')
const {promisify} = require('util')
const redis = require('redis')
const logger = require('../src/logger.js')
const blockchain = require('../src/blockchain.js')
const log = logger.CreateLogger()

class Identity extends Run.Jig {
  validateParams(params) {
    if (params === null || params === {}) {
      throw new Error('no params specified')
    }
    if (params.name === null || params.name === '') {
      throw new Error('name not specified')
    }
    if (params.phone === null || params.phone === '') {
      throw new Error('phone number not defined')
    }
    if (params.email === null || params.email === '') {
      throw new Error('email not defined')
    }
    if (params.paymail === null || params.paymail === '') {
      throw new Error('paymail not defined')
    }
    if (params.address === null || params.address === '') {
      throw new Error('address not defined')
    }
  }
  init(params) {
    try {
      this.validateParams(params)
    } catch(e) {
      throw new Error(e)
      return
    }
    this.personalInformation = {
      name: name,
      phone: phone,
      address: address,
      email: email,
      paymail: paymail
    }
    this.attestations = []
    this.satoshis = 0
  }
  setOwner(newOwner) {
    this.owner = newOwner
  }
  setPrice(amount) {
    this.satoshis = amount
  }
  attest(attesterPaymail) {
    this.attesters.push(attesterPaymail)
  }
}
module.exports.Identity = Identity
