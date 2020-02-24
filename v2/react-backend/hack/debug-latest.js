var fetch = require('node-fetch')
const Run = require('../lib/run.node.min')
var Jigs = require('../lib/jigs')
var reviews = require('../routes/review.js')
const NETWORK = process.env.TR_NETWORK
const OWNER = process.env.TR_OWNER
const PURSE = process.env.TR_PURSE
const logger = require('../src/logger')
var log = logger.CreateLogger()
var run = Jigs.RunTrueReview

const alphabet = ' abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ`1234567890-=~!@#$%^&*()_+,./;\'[]\\<>?:"{}|'
const shuffled = 't08sY]m\'#$Dy1`}pCKrHG)f9[uq%3\\ha=!ZVMkJ-*L"xz67R? W~@wdO:Ecg|ITe52.+{ovBj>(&,/Q4lA;^<NPnXSFi_Ub'
const encArr = alphabet.split('')
const decArr = shuffled.split('')
const UnwriterAPIKey = process.env.REACT_APP_UNWRITERAPIKEY

const query = {
  "v": 3,
  "q": {
    "find": {"out.s2": "run", "out.s4": "TrueReviews"},
    "limit": 50,
    "project": {
      "out.s5": 1,
      "out.ls5": 1,
      "tx": 1
    }
  }
}

var queryJSON = JSON.stringify(query)
var queryb64 = new Buffer.from(queryJSON).toString('base64')
var url = "https://genesis.bitdb.network/q/1FnauZ9aUH2Bex6JzdcV4eNX7oLSSEbxtN/"+queryb64
var header = {
  headers: {
    key: UnwriterAPIKey
  }
}

getRecentData(url)

async function getRecentData(url) {
  var res = await fetch(url, header)
  var r = await res.json()
  var all = r['u'].concat(r['c'])
  for (var i=0;i<all.length;i++) {
    var tx = all[i].tx.h
    for (var j=0;j<all[i].out.length;j++) {
      var enc = all[i].out[j].s5
      if (enc == null) {
        enc = all[i].out[j].ls5
        if (enc == null) {
          continue
        }
      }
      var dec = decryptRunData(enc)
      for(var k=0;k<dec.actions.length;k++) {
        switch(dec.actions[k].method) {
          case 'createReview':
            var out = j+1
            var runtx = tx+'_o'+out
            var l = await run.load(runtx)
            parseReviewCreate(l, dec.actions[k].args)
            break
          case 'upvote':
            parseUpvote(dec.actions[k].args)
            break
          case 'downvote':
            parseDownvote(dec.actions[k].args)
            break
          case 'send':
            break
          case 'set':
            parseSet(dec.actions[k].args)
            break
          case 'init':
            parseInit(dec.actions[k].args)
            break
          default:
            //console.log('ERROR: ' + dec.actions[k].method)
        }
      }
    }
  }
}

function parseInit(args) {
}

function parseReviewCreate(location, args) {
  console.log('User ['+args[2]+'] created a review for ['+location.name+']')
}

function parseSet(args) {
  if (args[0].includes('@')) {
    console.log('User ['+args[0]+'] has registered')
  } else if (args[0].includes('_')) {
    //console.log('Initializing entry in PointsDB')
  } else {
    //console.log('Location ['+args[0]+'] was created')
    //console.log(args)
  }
}

async function parseUpvote(args) {
  var l = await run.load(args[0])
  console.log('User ['+args[1]+'] upvoted ['+l.user+']s review of ['+l.reviewLocation.name+']')
}

function parseDownvote(args) {
  console.log('User ['+args[1]+'] downvoted review ['+args[0]+']')
}

function decryptRunData (encrypted) {
  const decrypted = encrypted.split('').map(c => {
    return decArr.indexOf(c) !== -1 ? encArr[decArr.indexOf(c)] : c
  }).join('')
  try {
    return JSON.parse(decrypted)
  } catch (e) {
    throw new Error(`unable to parse decrypted run data\n\n${e.toString()}\n\n${decrypted}`)
  }
}

