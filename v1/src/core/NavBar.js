import React, {Component} from 'react';
import UserInfo from '../UserInfo'
import {MoneyButtonClient} from '@moneybutton/api-client'
import {GetMBToken, LogOutOfMB, IsLoggedIn} from '../MB'
import ButtonList from './navbar_helpers/ButtonList';
const MB_OAUTH_ID = process.env.REACT_APP_MBOAUTHID

class NavBar extends Component {
  constructor(props) {
    super (props)
    this.state = {
      loggedIn: false
    }
  }
  componentDidMount() {
    IsLoggedIn().then(r => {
      this.setState({loggedIn: r});
    })
  }

  render() {
    return (
      <nav className="navbar navbar-light bg-light navbar-expand-lg">
	<button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarContent" aria-controls="navbarContent" aria-expanded="false" aria-label="Toggle navigation">
          <i className="material-icons">list</i>
        </button>
        <a className="navbar-brand" href="/">True Reviews</a>
        <div className="collapse navbar-collapse" id="navbarContent">
          <ButtonList links={this.props.navLocations} navFunction={this.props.navFunction} />
        </div>
        <UserInfo userInfo={getMBInfo()}/>
        <ul/>
        {!this.state.loggedIn ? <button className="btn btn-link" onClick={GetMBToken}>Login in with MB</button> : null }
        {this.state.loggedIn ? <button className="btn btn-link" onClick={LogOutOfMB}>Log Out</button> : null }
      </nav>
    );
  }
}

export default NavBar

async function getMBInfo() {
  var mbclient = new MoneyButtonClient(MB_OAUTH_ID)
  var identity = await mbclient.getIdentity()
  await mbclient.getValidAccessToken()
  var bal = await mbclient.getBalance(identity.id)
  console.log(bal)
  return {id: identity.id, name: identity.name, balance: bal.amount}
}
