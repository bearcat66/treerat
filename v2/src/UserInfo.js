import React from 'react';
import {Link} from 'react-router-dom';
import {Badge} from 'react-bootstrap';
import './UserInfo.css'

export default class UserInfo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: {},
      bitPicURL: ''
    };
  }
  componentDidMount() {
    this.setState({user: this.props.userInfo, tokens: this.props.tokens})
    this.loadBitPic(this.props.userInfo.paymail)
  }
  async loadBitPic(paymail) {
    var res = await fetch('https://bitpic.network/exists/'+paymail)
    var body = await res.json()
    if (body === 1) {
      this.setState({bitPicURL: 'https://bitpic.network/u/'+paymail})
    }
  }
  componentDidUpdate(prevProps) {
    if (Object.entries(prevProps.userInfo).length !== Object.entries(this.props.userInfo).length && Object.entries(this.props.userInfo).length > 0) {
      this.setState({user: this.props.userInfo})
      this.loadBitPic(this.props.userInfo.paymail)
    }
    if (this.props.tokens !== prevProps.tokens) {
      this.setState({tokens: this.props.tokens})
    }
  }
  renderLoading() {
    if (!this.props.loadingUser) {
      return null
    }
    return (
      <div className="container text-info text-right">
        <p>Loading user...</p>
        <div className="spinner-border spinner-border-sm"/>
      </div>
    )
  }
  renderNotificationIcon() {
    if (this.props.notifications != null && this.props.notifications.length !== 0) {
      return (
        <div className="align-self-center">
          <img alt='notifications' src='/icons/bell-fill.svg' height="40px" id="notificationIcon" onClick={this.props.toggleNotifications}/>
	      {/*<Badge pill variant='dark' id='notificationBadge'>{this.props.notifications.length}</Badge>*/}
        </div>
      )
    }
    return (
      <img alt='notifications' className="align-self-center"  src='/icons/bell.svg' height="40px" id="notificationIcon" onClick={this.props.toggleNotifications}/>
    )
  }
  renderDropdown() {
    return (
      <div className="dropdown">
        <button class="btn btn-default dropdown-toggle" type="button" id="menu1" data-toggle="dropdown">
          {this.renderNotificationIcon()}
        </button>
        <ul className="dropdown-menu" aria-labelledby="dropdown">
          <a className="dropdown-item">No New Notifications</a>
        </ul>
      </div>
    )
  }
  render() {
    if (this.props.loadingUser) {
      return (
        <div className="text-right" style={{color: '#1a6bbe'}}>
          <p>Loading user...</p>
          <div className="spinner-border spinner-border-sm"/>
        </div>
      )
    }
    if (Object.entries(this.state.user).length === 0) {
      return null
    }
    if (this.state.user.name == null) {
      return null
    }
    var imageURL = this.state.user.avatarUrl
    if (this.state.bitPicURL !== '') {
      imageURL = this.state.bitPicURL
    }
    
    return (
      <div className="">	    
        <ul className="nav navbar-nav-right justify-content-end">
          <li className="nav-item d-flex">
	    {this.renderNotificationIcon()}
	  </li>
	  <li className="nav-item dropdown">
            <a className="nav-link dropdown-toggle" href='#' data-toggle="dropdown" title={this.state.user.name}>
              <img alt='avatar' className="avatar-small" src={imageURL} style={{marginLeft: '10px', width: '40px', height: '40px'}}/>
            </a>
	    <div className="dropdown-menu dropdown-menu-right">
	      <a className="dropdown-item" href="/profile">View Profile</a>
	      <a className="dropdown-item" href="#" onClick={() => {logOut(this.state.user)}}>Log Out</a>
	    </div>
	  </li>
        </ul>
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

