import React from 'react';
import {Redirect} from 'react-router-dom';
import {MoneyButtonClient} from '@moneybutton/api-client'
import MoneyButton from '@moneybutton/react-money-button'
import QueryString from 'query-string'
import {GetMBToken} from './MB'
//import { PaymailClient } from '@moneybutton/paymail-client'
const MB_OAUTH_ID = process.env.REACT_APP_MBOAUTHID

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
    var params = QueryString.parse(this.props.location.search)
    fetch('/api/session').then(res => {
      if (res.status === 404 || res.status === 500) {
        throw new Error('Session not found')
      }
      return res.json()
    }).then(r => {
      this.setState({redirect: true})
    }).catch(e => {
      console.error(e)
      this.setState({loggedIn: false})
    })
    handleAuth().then(u => {
      loginUser(params, u.profile.primaryPaymail).then(r => {
        this.getUser(u)
      }).catch(e => {
        console.error(e)
      })
      this.setState({user: u})
    }).catch(e => {
      console.error(e)
      GetMBToken()
    })
  }
  
  renderRedirect() {
    if (!this.state.redirect) {
      return null
    }
    console.log("Login redirect called");
    this.props.updateSession()
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
        <h1 className='text-primary'>{this.state.user.profile.primaryPaymail}!</h1>
        <hr/>
        <h3 className='text-danger'>Note: You will be registered with the primary paymail associated with your MoneyButton account.</h3>
        <h3>If you would like to register with a different paymail please change your settings on moneybutton.com. You may need to log out and log back in.</h3>
        <h2>Please swipe the MoneyButton to register:</h2>
        <MoneyButton
          to='truereviews@moneybutton.com'
          amount='.001'
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

async function loginUser(params, paymail) {
  var res = await fetch('/api/login/'+paymail, {
    headers: {'Content-Type': 'application/json'},
    method: 'post',
    body: JSON.stringify({
      code: params.code,
      state: params.state
    })
  })
  var result = await res.json()
  return result
}
