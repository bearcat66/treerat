import React from 'react';
import {Navbar} from 'react-bootstrap'

export default class UserInfo extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        id: '',
        name: '',
        balance: '',
        paymail: '',
	avatarUrl: ''
      };
    }
    componentDidMount() {
      this.props.userInfo.then(r => {
        this.setState({id: r.id, name: r.name, balance: r.balance, paymail: r.paymail, avatarUrl: r.avatarUrl})
      })
    }
    render() {
      if (this.state.id === '') {
        return null
      }
      return (
        <div className="justify-content-end">
          <a href='#' onClick={this.props.onUserClick} title={this.state.name}>
	    {this.state.name}   <img className="navbar-expand-sm avatar-small" src={this.state.avatarUrl} />
	  </a>
        </div>
        );
    }
}

