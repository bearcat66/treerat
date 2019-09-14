import {MoneyButtonClient} from '@moneybutton/api-client'

const MB_OAUTH_ID = process.env.REACT_APP_MBOAUTHID

export async function GetMBToken() {
  var mbclient = new MoneyButtonClient(MB_OAUTH_ID)
  try {
    mbclient.requestAuthorization(
      'auth.user_identity:read users.profiles:read users.balance:read',
      'http://localhost:3000/login'
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
  var mbclient2 = new MoneyButtonClient(MB_OAUTH_ID)
  var user = await mbclient2.getIdentity()
  return user
}

