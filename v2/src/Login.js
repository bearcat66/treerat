import React from 'react';
import {Redirect} from 'react-router-dom';
import {MoneyButtonClient} from '@moneybutton/api-client'
import MoneyButton from '@moneybutton/react-money-button'
//import { PaymailClient } from '@moneybutton/paymail-client'
const MB_OAUTH_ID = process.env.REACT_APP_MBOAUTHID

const UserDB = window.Jigs.UserDB
//const Run = window.Run
const run = window.Jigs.RunInstance


export default class Login extends React.Component {
  constructor(props) {
    super(props)
    this.onPaymentSuccessUser = this.onPaymentSuccessUser.bind(this)
    this.onPaymentSuccessBusiness = this.onPaymentSuccessBusiness.bind(this)
    this.state = {
      renderUserRegistration: false,
      redirect: false,
      user: {},
    }
  }

  componentDidMount() {
    console.log("Login component did mount called");
    handleAuth().then(u => {
      console.log(u)
      this.setState({user: u})
      //this.setState({redirect: true});
      //here u has the user's MB information
      //this is where we need to create UserDB objects and save pubKeys
      this.getUser(u)
    })

  }
  
  renderRedirect() {
    if (!this.state.redirect) {
      return null
    }
    console.log("Login redirect called");
    return (<Redirect to="/"/>)
  }
  renderSpinner() {
    if (!this.state.renderUserRegistration) {
      return (
        <div className="container-fluid text-center">
          <h2>Logging in...</h2>
          <h3>Don't refresh the page, this could take up to a minute.</h3>
          <div className="spinner-grow">
          </div>
        </div>
      )
    }
  }
  onPaymentSuccessUser(payment) {
    console.log("Successfully paid")
    this.createUser(false).then(r=>{
      this.setState({redirect: true})
    })
  }
  onPaymentSuccessBusiness(payment) {
    console.log("Successfully paid")
    this.createUser(true).then(r=>{
      this.setState({redirect: true})
    })
  }

  renderUserRegistration() {
    if (!this.state.renderUserRegistration) {
      return null
    }
    return (
      <div className="container-fluid text-center">
        <h1>Welcome to TrueReviews Alpha</h1>
        <h1 class='text-primary'>{this.state.user.profile.primaryPaymail}!</h1>
        <hr/>
        <h3 class='text-danger'>Note: You will be registered with the primary paymail associated with your MoneyButton account.</h3>
        <h3>If you would like to register with a different paymail please change your settings on moneybutton.com. You may need to log out and log back in.</h3>
        <h2>Please swipe the MoneyButton to register:</h2>
        <MoneyButton
          to='truereviews@moneybutton.com'
          amount='.5'
          currency='USD'
          label='Register'
          onPayment={this.onPaymentSuccessBusiness}
        />
      </div>
    )
  }
  async getUser(u) {
    var res = await fetch('/api/users/'+u.profile.primaryPaymail)
    if (res.status === 200) {
      this.setState({redirect: true})
      return
    }
    if (res.status === 404) {
      this.setState({renderUserRegistration: true})
    }
  }
  async createUser(businessAccount) {
    fetch('/api/users/'+this.state.user.profile.primaryPaymail, {
      headers: {'Content-Type': 'application/json'},
      method: 'post',
      body: JSON.stringify({
        profile: this.state.user.profile,
        businessAccount: businessAccount
      })
    }).then(res => res.json()).then(rev => {
      console.log(rev)
      this.setState({redirect: true})
    })
  }

  render() {
    return (
      <div className="jumbotron jumbotron-transparent-25">
        {this.renderSpinner()}
        {this.renderUserRegistration()}
        {this.renderRedirect()}
      </div>
    )
  }
}

async function handleAuth() {
  var mbclient = new MoneyButtonClient(MB_OAUTH_ID)
  await mbclient.handleAuthorizationResponse()
  var identity = await mbclient.getIdentity()
  var profile = await mbclient.getUserProfile(identity.id)
  return {id: identity.id, profile: profile}
}

