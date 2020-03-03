import React, {Component} from 'react';
import UserInfo from '../UserInfo'
import {GetMBToken, LogOutOfMB} from '../MB'
import ButtonList from './navbar_helpers/ButtonList';
import {Toast} from 'react-bootstrap'

class NavBar extends Component {
  constructor(props) {
    super (props)
    this.state = {
      loggedIn: false,
      user: {},
      paymail: '',
      navLocations: props.navLocations,
      showToast: true
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
          avatarUrl: this.props.avatarUrl,
          paymail: this.props.user
        }
      })
    }
    if (this.props.tokens !== prevProps.tokens) {
      this.setState({
        tokens: this.props.tokens
      })
    }
  }
  setShow(show) {
    this.setState({showToast: show})
  }
  renderToasts() {
    var show = this.state.showToast
    return (
      <Toast onClose={() => this.setShow(false)} show={show} delay={3000} autohide>
        <Toast.Header>
          <img src="/icons/alert-square-fill.svg" height='20' width='20' className="rounded mr-2" alt="" />
          <strong className="mr-auto">Bootstrap</strong>
          <small>2 seconds ago</small>
        </Toast.Header>
        <Toast.Body>Heads up, toasts will stack automatically</Toast.Body>
      </Toast>
    )
  }
  renderToastHolder() {
    return (
      <div
        aria-live="polite"
        aria-atomic="true"
        class="d-flex justify-content-center align-items-center"
        style={{
          position: 'relative',
          maxHeight: 0,
          top: -75,
        }}>
          {this.renderToasts()}
        </div>
    )
  }

  render() {
    return (
      <div>
      <nav className="navbar navbar-light bg-light navbar-expand-lg">
        <div>
          <div className="container-fluid">
            <a className="navbar-brand" href="/">
              <img alt="logo" src="/tr-logo.png" height="50" width="150" style={{padding: '2px'}}/>
            </a>
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
          <UserInfo userInfo={this.state.user} tokens={this.state.tokens} loadingUser={this.props.loadingUser} toggleNotifications={this.props.toggleNotifications} notifications={this.props.notifications}/>
          <ul/>
          {!this.state.loggedIn && !this.props.loadingUser ? <button className="btn btn-link" onClick={GetMBToken}>Login in with MB</button> : null }
          {this.state.loggedIn ? <button className="btn btn-link" onClick={() => {
            logOut(this.state.paymail)
          }}>Log Out</button> : null }
        </div>
      </nav>
      {/*this.renderToastHolder()*/}
    </div>
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

