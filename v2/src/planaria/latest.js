const NETWORK = process.env.TR_NETWORK
const OWNER = process.env.TR_OWNER
const PURSE = process.env.TR_PURSE
if (window.Instance != null) {
  var run = window.Instance.RunInstance
}

const alphabet = ' abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ`1234567890-=~!@#$%^&*()_+,./;\'[]\\<>?:"{}|'
const shuffled = 't08sY]m\'#$Dy1`}pCKrHG)f9[uq%3\\ha=!ZVMkJ-*L"xz67R? W~@wdO:Ecg|ITe52.+{ovBj>(&,/Q4lA;^<NPnXSFi_Ub'
const encArr = alphabet.split('')
const decArr = shuffled.split('')
const UnwriterAPIKey = process.env.REACT_APP_UNWRITERAPIKEY

const query = {
  "v": 3,
  "q": {
    "find": {"out.s2": "run", "out.s4": "TrueReviews"},
    "limit": 40,
    "project": {
      "out.s5": 1,
      "out.ls5": 1,
      "tx": 1
    }
  }
}

var queryJSON = JSON.stringify(query)
var queryb64 = new Buffer.from(queryJSON).toString('base64')
const url = "https://genesis.bitdb.network/q/1FnauZ9aUH2Bex6JzdcV4eNX7oLSSEbxtN/"+queryb64
const header = {
  headers: {
    key: UnwriterAPIKey
  }
}


export async function GetRecentActivity() {
  var activity = []
  var res = await fetch(url, header)
  var r = await res.json()
  var all = r['u'].concat(r['c'])
  var messages = []
  for (var i=0;i<all.length;i++) {
    var tx = all[i].tx.h
    var loadedTx = await run.blockchain.fetch(tx)
    var timestamp = new Date(loadedTx.time)
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
        var out = j+1
        var runtx = tx+'_o'+out
        var type = ''
        var info = {}
        switch(dec.actions[k].method) {
          case 'createReview':
            var l = await run.load(runtx)
            info = parseReviewCreate(l, dec.actions[k].args)
            type = 'createReview'
            break
          case 'upvote':
            info = await parseUpvote(dec.actions[k].args)
            type = 'upvote'
            break
          case 'downvote':
            info = await parseDownvote(dec.actions[k].args)
            type = 'downvote'
            break
          case 'send':
            info = null
            break
          case 'set':
            info = parseSet(dec.actions[k].args)
            if (info != null) {
              type = 'register'
            }
            break
          case 'init':
            info = parseInit(dec.actions[k].args)
            break
          default:
            info = null
            //console.log('ERROR: ' + dec.actions[k].method)
        }
        if (info != null) {
          var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' };
          var activity = {
            timestamp: timestamp.toLocaleDateString(undefined, options),
            origin: runtx,
            tx: tx,
            type: type,
            info: info
          }
          messages.push(activity)
        }
      }
    }
  }
  return messages
}

function parseInit(args) {
  return null
}

function parseReviewCreate(location, args) {
  return {
    reviewer: args[2],
    locationName: location.name,
    placeID: location.placeID
  }
}

function parseSet(args) {
  if (args[0].includes('@')) {
    return {
      user: args[0]
    }
  } else if (args[0].includes('_')) {
    //console.log('Initializing entry in PointsDB')
  } else {
    //console.log('Location ['+args[0]+'] was created')
    //console.log(args)
  }
  return null
}

async function parseUpvote(args) {
  var l = await run.load(args[0])
  return {
    upvoter: args[1],
    reviewer: l.user,
    locationName: l.reviewLocation.name,
    placeID: l.reviewLocation.placeID
  }
}

async function parseDownvote(args) {
  var l = await run.load(args[0])
  return {
    downvoter: args[1],
    reviewer: l.user,
    locationName: l.reviewLocation.name,
    placeID: l.reviewLocation.placeID
  }
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

