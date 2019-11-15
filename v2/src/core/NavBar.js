import React, {Component} from 'react';
import UserInfo from '../UserInfo'
import {GetMBToken, LogOutOfMB} from '../MB'
import ButtonList from './navbar_helpers/ButtonList';

class NavBar extends Component {
  constructor(props) {
    super (props)
    this.state = {
      loggedIn: false,
      user: {},
      paymail: '',
      navLocations: props.navLocations
    }
  }
  componentDidMount() {
    var loggedIn = false
    if (this.props.user !== '') {
      loggedIn = true
    }
    this.setState({
      navLocations: this.props.navLocations,
      loggedIn: loggedIn,
      paymail: this.props.user,
      name: this.props.name,
      avatarUrl: this.props.avatarUrl
    })
  }
  componentDidUpdate(prevProps) {
    if (this.props.navLocations.length !== prevProps.navLocations.length) {
      this.setState({navLocations: this.props.navLocations})
    }
    if (this.props.user !== prevProps.user && this.props.user != null) {
      this.setState({
        paymail: this.props.user,
        loggedIn: true,
        user: {
          name: this.props.name,
          avatarUrl: this.props.avatarUrl
        }
      })
    }
    if (this.props.tokens !== prevProps.tokens) {
      this.setState({
        tokens: this.props.tokens
      })
    }
  }

  render() {
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
              <ButtonList links={this.state.navLocations} navigateTo={this.props.navigateTo} />
            </div>
          </div>
        </div>
        <div className='col justify-content-end text-right'>
          <UserInfo userInfo={this.state.user} tokens={this.state.tokens}/>
          <ul/>
          {!this.state.loggedIn ? <button className="btn btn-link" onClick={GetMBToken}>Login in with MB</button> : null }
          {this.state.loggedIn ? <button className="btn btn-link" onClick={() => {
            logOut(this.state.paymail)
          }}>Log Out</button> : null }
        </div>
      </nav>
    );
  }
}

async function logOut(user) {
  var res = await fetch('/api/logout/'+user, {
    headers: {'Content-Type': 'application/json'},
    method: 'post'
  })
  window.location.reload()
}

export default NavBar

