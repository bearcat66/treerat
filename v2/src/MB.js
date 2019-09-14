import {MoneyButtonClient} from '@moneybutton/api-client'

const MB_OAUTH_ID = process.env.REACT_APP_MBOAUTHID
const MB_REDIRECT_URI = process.env.REACT_APP_MB_REDIRECT_URI

export async function GetMBToken() {
  var mbclient = new MoneyButtonClient(MB_OAUTH_ID)
  try {
    mbclient.requestAuthorization(
      'auth.user_identity:read users.profiles:read',
      MB_REDIRECT_URI
    )
    await mbclient.handleAuthorizationResponse()
  } catch (err) {
    console.error(err)
  }
  const { id: moneyButtonId } = await mbclient.getIdentity()
  return moneyButtonId
}

export async function LogOutOfMB() {
  var mbclient = new MoneyButtonClient(MB_OAUTH_ID)
  try {
    await mbclient.logOut()
    window.location.reload()
  } catch (err) {
    console.error(err)
  }
}

export async function IsLoggedIn() {
  var mbclient = new MoneyButtonClient(MB_OAUTH_ID)
  try {
    var log = await mbclient.isLoggedIn()
    return log
  } catch (err) {
    console.error(err)
  }
  return false
}

export async function GetMBUser() {
  var mbclient = new MoneyButtonClient(MB_OAUTH_ID)
  var user = await mbclient.getIdentity()
  var profile = await mbclient.getUserProfile(user.id)
  return {id: user.id, profile: profile}
}

