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
var enc = "_ispY]iF<_iG][GiFis10HHt7r)]z]f$]9%1C#07]HG]r7py]}t][G]}YHt7py]}t_P}Ui4iY]CHiF_i7py]}iFi|]cIc8mgeTYEms0mg]0mIYmEY]:cddOsIEs8sIY08s8YOedY:I]seY0|YeI8O|mm/pdiU4ip9}]riFieO80:TTYgEmI]dYsEg0:s]IE]e|mmIc|EImedOO8O0YY|se8s8g8EOdc0|de|OTOeeiUN4i0sG$p}HiF<N4iD$'HiFeU"
console.log(decryptRunData(enc))

