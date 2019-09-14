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
      loggedIn: false,
      navLocations: props.navLocations
    }
  }
  componentDidMount() {
    IsLoggedIn().then(r => {
      this.setState({loggedIn: r});
    })
    console.log('props')
    console.log(this.props)
    this.setState({navLocations: this.props.navLocations})
  }
  componentDidUpdate(prevProps) {
    console.log('update')
    console.log(this.props.navLocations)
    if(this.props.navLocations.length != prevProps.navLocations.length) {
      console.log('here')
      this.setState({navLocations: this.props.navLocations})
    }
  }

  render() {
    console.log('render')
    return (
      <nav className="navbar navbar-light bg-light navbar-expand-lg">
        <div>
          <div className="container-fluid">
            <a className="navbar-brand" href="/">True Reviews</a>
          </div>
          <div className='col'>
	          <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarContent" aria-controls="navbarContent" aria-expanded="false" aria-label="Toggle navigation">
              <i className="material-icons">list</i>
            </button>
            <div className="collapse navbar-collapse" id="navbarContent">
              <ButtonList links={this.state.navLocations} navFunction={this.props.navFunction} />
            </div>
          </div>
        </div>
        <div className='col justify-content-end text-right'>
          <UserInfo onUserClick={this.props.onUserClick} userInfo={getMBInfo()}/>
          <ul/>
          {!this.state.loggedIn ? <button className="btn btn-link" onClick={GetMBToken}>Login in with MB</button> : null }
          {this.state.loggedIn ? <button className="btn btn-link" onClick={LogOutOfMB}>Log Out</button> : null }
        </div>
      </nav>
    );
  }
}

export default NavBar

async function getMBInfo() {
  var mbclient = new MoneyButtonClient(MB_OAUTH_ID)
  var identity = await mbclient.getIdentity()
  await mbclient.getValidAccessToken()
  var profile = await mbclient.getUserProfile(identity.id)
  console.log(profile)
  return {id: identity.id, name: identity.name, paymail: profile.primaryPaymail, avatarUrl: profile.avatarUrl}
}
