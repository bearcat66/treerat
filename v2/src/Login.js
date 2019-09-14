import React from 'react';
import {Redirect} from 'react-router-dom';
import {MoneyButtonClient} from '@moneybutton/api-client'
//import { PaymailClient } from '@moneybutton/paymail-client'
const MB_OAUTH_ID = process.env.REACT_APP_MBOAUTHID

const UserDB = window.Jigs.UserDB
//const Run = window.Run
const run = window.Jigs.RunInstance


let bsv = require('bsv')


export default class Login extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      redirect: false
    }
  }

  componentDidMount() {
    console.log("Login component did mount called");
    handleAuth().then(u => {
      console.log(run)
      this.setState({redirect: true});
      //here u has the user's MB information
      //this is where we need to create UserDB objects and save pubKeys
      createUser(u)
      
    })

  }
  


  renderRedirect() {
    console.log("Login redirect called");
    if (!this.state.redirect) {
      return null
    }
    return (<Redirect to="/"/>)
  }
  render() {
    return (<div>{this.renderRedirect()}</div>)
  }
}

async function handleAuth() {
  var mbclient = new MoneyButtonClient(MB_OAUTH_ID)
  await mbclient.handleAuthorizationResponse()
  var identity = await mbclient.getIdentity()
  var profile = await mbclient.getUserProfile(identity.id)
  return {id: identity.id, profile: profile}
}

async function createUser(u) {
  run.activate()
  //var paymailClient = new PaymailClient(dns, fetch)
  //var key = await paymailClient.getPublicKey(u.profile.paymail)
  //console.log('paymail key: '+ key)
  var userID = u.id
  const user = run.owner.jigs.find(x => x.constructor.name === 'UserDB')
  
  if(user == null) {
    console.log('Create new user')
    let privkey = bsv.PrivateKey.fromRandom()
    let pubKey = bsv.PublicKey.fromPrivateKey(privkey)
    var userDB = new UserDB()
    var set = userDB.set(userID, pubKey.toString())
    console.log(set)
    await run.sync()
    return
  }
  if(user.get(userID) !== null) {
    console.log('Found user: ' + userID + ' with pubkey: '+ user.get(userID))
    return
  }
  console.error('User not found... should have been created')
}

