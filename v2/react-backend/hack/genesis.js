var fetch = require('node-fetch')

const alphabet = ' abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ`1234567890-=~!@#$%^&*()_+,./;\'[]\\<>?:"{}|'
const shuffled = 't08sY]m\'#$Dy1`}pCKrHG)f9[uq%3\\ha=!ZVMkJ-*L"xz67R? W~@wdO:Ecg|ITe52.+{ovBj>(&,/Q4lA;^<NPnXSFi_Ub'
const encArr = alphabet.split('')
const decArr = shuffled.split('')
const UnwriterAPIKey = process.env.REACT_APP_UNWRITERAPIKEY

const query = {
  "v": 3,
  "q": {
    "find": {"out.s2": "run", "out.s4": "TrueReviews"},
    "limit": 20,
    "project": {
      "out.s5": 1,
      "out.ls5": 1,
      "tx": 1
    }
  }
}

var queryJSON = JSON.stringify(query)
var queryb64 = new Buffer(queryJSON).toString('base64')
console.log(queryb64)
var url = "https://genesis.bitdb.network/q/1FnauZ9aUH2Bex6JzdcV4eNX7oLSSEbxtN/"+queryb64
var header = {
  headers: {
    key: UnwriterAPIKey
  }
}
var l = fetch(url, header).then(function(r) {
  return r.json()
}).then(function(r) {
  var all = r['u'].concat(r['c'])
  for (var i=0;i<all.length;i++) {
    console.log(all[i].tx)
    var enc = all[i].out[0].s5
    if (enc == null) {
      enc = all[i].out[0].ls5
      if (enc == null) {
        continue
      }
    }
    var dec = decryptRunData(enc)
    for(var j=0;j<dec.actions.length;j++) {
      switch(dec.actions[j].method) {
        case 'createReview':
          parseReviewCreate(dec.ations[j].args)
          break
        case 'upvote':
          parseUpvote(dec.actions[j].args)
          break
        case 'downvote':
          parseDownvote(dec.actions[j].args)
          break
        case 'send':
          console.log('send')
          break
        case 'set':
          parseSet(dec.actions[j].args)
          break
        case 'init':
          console.log('init')
          break
        default:
          console.log('ERROR: ' + dec.actions[j].method)
      }
    }
  }
})

function parseReviewCreate(args) {
  console.log('User ['+args[2]+']')
}

function parseSet(args) {
  if (args[0].includes('@')) {
    console.log('User ['+args[0]+'] has registered')
  } else if (args[0].includes('_')) {
    console.log('Initializing entry in PointsDB')
  } else {
    console.log('Location ['+args[0]+'] was created')
  }
}

function parseUpvote(args) {
  console.log('User ['+args[1]+'] upvoted review ['+args[0]+']')
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

