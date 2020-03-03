const alphabet = ' abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ`1234567890-=~!@#$%^&*()_+,./;\'[]\\<>?:"{}|'
const shuffled = 't08sY]m\'#$Dy1`}pCKrHG)f9[uq%3\\ha=!ZVMkJ-*L"xz67R? W~@wdO:Ecg|ITe52.+{ovBj>(&,/Q4lA;^<NPnXSFi_Ub'
const encArr = alphabet.split('')
const decArr = shuffled.split('')

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


