import React from 'react';
import {Redirect} from 'react-router-dom';
import {MoneyButtonClient} from '@moneybutton/api-client'
const MB_OAUTH_ID = process.env.REACT_APP_MBOAUTHID

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
      this.setState({redirect: true});
      console.log(u);
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
  var f = await mbclient.getIdentity()
  //var foo = await mbclient.whoAmI()
  //console.log(foo)
  console.log(f)
  var foo = await mbclient.getValidAccessToken()
  console.log(foo) 
  return f
}
