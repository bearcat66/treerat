import React from 'react';
import {Navbar} from 'react-bootstrap'

export default class UserInfo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: {}
    };
  }
  componentDidMount() {
    console.log(this.props.userInfo)
    this.setState({user: this.props.userInfo})
  }
  componentDidUpdate(prevProps) {
    if (Object.entries(prevProps.userInfo).length !== Object.entries(this.props.userInfo).length) {
      console.log(this.props.user)
      this.setState({user: this.props.userInfo})
    }
  }
  render() {
    if (Object.entries(this.state.user).length === 0) {
      return null
    }
    return (
      <div className="justify-content-end">
        <a href='#' onClick={this.props.onUserClick} title={this.state.user.name}>
          {this.state.user.name}   <img className="navbar-expand-sm avatar-small" src={this.state.user.avatarUrl} />
        </a>
      </div>
    );
  }
}

