const alphabet = ' abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ`1234567890-=~!@#$%^&*()_+,./;\'[]\\<>?:"{}|'
const shuffled = 't08sY]m\'#$Dy1`}pCKrHG)f9[uq%3\\ha=!ZVMkJ-*L"xz67R? W~@wdO:Ecg|ITe52.+{ovBj>(&,/Q4lA;^<NPnXSFi_Ub'
const encArr = alphabet.split('')
const decArr = shuffled.split('')

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
var enc = "_ispY]iF<N4i0sG$p}HiF<_iG0r']GiFi/$ei4i`]G#pYiFiH]Gi4i0r'HiF<i8egEII8m|ge]EOd0:dY]|mOdcc]eeOETe|]O]]gcOdgse8Td|8sYm0s|EedYYTec/pOi4_iHspr]iFe4i)CfpG]YRH]rHiF<N4iYp9}fpG]YRH]rHiF<NUNU4_iG0r']GiFi/$di4i`]G#pYiFiH]}Yi4i0r'HiF<ieOYc0OcTYdIT0TsEemc|gmYseEE|geId:0Ym|]T8O|s:|8:Oeccg0ITcs0]8ses8esi4dNUN4iD$'HiF:U"
console.log(decryptRunData(enc).actions[0])

