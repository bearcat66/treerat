import React from 'react';
import {Link} from 'react-router-dom';

export default class UserInfo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: {}
    };
  }
  componentDidMount() {
    this.setState({user: this.props.userInfo, tokens: this.props.tokens})
  }
  componentDidUpdate(prevProps) {
    if (Object.entries(prevProps.userInfo).length !== Object.entries(this.props.userInfo).length && Object.entries(this.props.userInfo).length > 0) {
      this.setState({user: this.props.userInfo})
    }
    if (this.props.tokens !== prevProps.tokens) {
      console.log(this.props.tokens)
      this.setState({tokens: this.props.tokens})
    }
  }
  renderTokens() {
    if (this.props.loadingTokens || !this.state.tokens) {
      return (
        <div className="container text-info">
          <p>Loading credits...</p>
          <div className="spinner-border spinner-border-sm"/>
        </div>
      )
    }
    if (!this.state.tokens) {
      return null
    }
    return (
      <div>
        <h6 className="text-info">Available Reviews: {this.state.tokens.reviews}</h6>
        <h6 className="text-info">Available Votes: {this.state.tokens.votes}</h6>
      </div>
    )
  }
  render() {
    if (Object.entries(this.state.user).length === 0) {
      return null
    }
    if (this.state.user.name == null) {
      return null
    }
    return (
      <div className="justify-content-end">
        <Link to='/profile' title={this.state.user.name}>
            {this.state.user.name}   <img alt='avatar' className="navbar-expand-sm avatar-small" src={this.state.user.avatarUrl} />
          </Link>
        {this.renderTokens()}
      </div>
    );
  }
}

