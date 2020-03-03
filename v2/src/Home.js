import React, {Component} from 'react';
import {GetMBToken} from './MB';
import {GetRecentActivity} from './planaria/latest.js'
import {Button} from 'react-bootstrap';
import {Link} from 'react-router-dom';
import './Home.css';

class Home extends Component {

  constructor(props) {
    super(props)
    this.state = {
      user: this.props.user,
      isLoggedIn: this.props.isLoggedIn,
      bitPicExists: true,
      messages: [],
      recentActivityLoaded: false,
      loadingRecentActivity: false,
    }
    this.loadBitPic(this.props.user)
  }
  componentDidMount() {
    this.loadBitPic(this.props.user)
    this.setState({loadingRecentActivity: true})
    GetRecentActivity().then(r => {
      console.log(r)
      this.setState({messages: r, recentActivityLoaded: true, loadingRecentActivity: false})
    })
  }
  componentDidUpdate(prevProps) {
    if (this.props.user !== prevProps.user) {
      this.loadBitPic(this.props.user)
    }
  }
  renderPlaceHolder() {
    return (
      <div className="container-fluid text-center">
        <img src="tr-logo.png" width='300px'/>
      </div>
    )
  }
  renderActivityIcon(type) {
    switch (type) {
      case 'createReview':
        return (
          <img src="/icons/document-richtext.svg" width="30px"/>
        )
      case 'upvote':
        return (
          <img src="/icons/chevron-up.svg" width="30px"/>
        )
      case 'downvote':
        return (
          <img src="/icons/chevron-down.svg" width="30px"/>
        )
      case 'register':
        return (
          <img src="/icons/person-fill.svg" width="30px"/>
        )
    }
  }
  renderActivityMessage(m) {
    var message = ''
    switch (m.type) {
      case 'createReview':
        var placeURL = 'location/'+m.info.placeID
        var bitPicURL = 'https://bitpic.network/u/'+m.info.reviewer
        var userURL = 'user/'+m.info.reviewer
        return (
          <td>
            <a href={userURL}><img alt='avatar' className="avatar-small" src={bitPicURL} style={{marginRight: '5px'}}/>{m.info.reviewer}</a> reviewed <a href={placeURL}>{m.info.locationName}</a>
          </td>
        )
      case 'upvote':
        var upvoterBitpicURL = 'https://bitpic.network/u/'+m.info.upvoter
        var reviewerBitpicURL = 'https://bitpic.network/u/'+m.info.reviewer
        var upvoterURL = 'user/'+m.info.upvoter
        var reviewerURL = 'user/'+m.info.reviewer
        var placeURL = 'location/'+m.info.placeID
        return (
          <td>
            <a href={upvoterURL}>
              <img alt='avatar' className="avatar-small" src={upvoterBitpicURL} style={{marginRight: '5px'}}/>{m.info.upvoter}
            </a> upvoted <a href={reviewerURL}><img alt='avatar' className="avatar-small" src={reviewerBitpicURL} style={{marginRight: '5px'}}/>{m.info.reviewer}</a>'s review of <a href={placeURL}>{m.info.locationName}</a>
          </td>
        )
      case 'downvote':
        var downvoterBitpicURL = 'https://bitpic.network/u/'+m.info.downvoter
        var reviewerBitpicURL = 'https://bitpic.network/u/'+m.info.reviewer
        var downvoterURL = 'user/'+m.info.downvoter
        var reviewerURL = 'user/'+m.info.reviewer
        var placeURL = 'location/'+m.info.placeID
        return (
          <td>
            <a href={downvoterURL}>
              <img alt='avatar' className="avatar-small" src={downvoterBitpicURL} style={{marginRight: '5px'}}/>{m.info.downvoter}
            </a> downvoted <a href={reviewerURL}><img alt='avatar' className="avatar-small" src={reviewerBitpicURL} style={{marginRight: '5px'}}/>{m.info.reviewer}</a>'s review of <a href={placeURL}>{m.info.locationName}</a>
          </td>
        )
      case 'register':
        var userURL = 'user/'+m.info.user
        var userBitpicURL = 'https://bitpic.network/u/'+m.info.user
        return (
          <td>
            <a href={userURL}><img alt='avatar' className='avatar-small' src={userBitpicURL} style={{marginRight: '5px'}}/>{m.info.user}</a> has joined TrueReviews!
          </td>
        )
    }
  }
  renderActivityTable() {
    return this.state.messages.map(r => {
      return (
        <tr>
          <th scope="row">{r.timestamp}</th>
          <th scope="row">
            {this.renderActivityIcon(r.type)}
          </th>
          {this.renderActivityMessage(r)}
        </tr>
      )
    })
  }
  renderRecentActivity() {
    if (!this.state.recentActivityLoaded && !this.state.loadingRecentActivity) {
      return null
    }
    if (this.state.loadingRecentActivity) {
      return (
        <div className="container-fluid text-center" style={{maxWidth: '900px', margin: 'auto'}}>
          <h4 style={{color: '#1a6bbe'}}>Loading Recent Activity...</h4>
          <div className='spinner-border spinner-border-lg'/>
        </div>
      )
    }
    return (
      <div className="container-fluid text-center" style={{maxWidth: '900px', margin: 'auto'}}>
        <h3 style={{color: '#1a6bbe'}}>Recent Activity</h3>
        <table className="table table-hover" style={{color: '#1a6bbe'}}>
          <thead>
            <tr>
              <th scope="col">Time</th>
              <th scope="col">Type</th>
              <th scope="col">Activity</th>
            </tr>
          </thead>
          <tbody>
            {this.renderActivityTable()}
          </tbody>
        </table>
      </div>
    )
  }
  renderLoginSnippet() {
    return (
      <div className="text-center">
        <h5>Please login to submit reviews and vote on existing reviews!</h5>
        <Button variant="outline-primary" size="lg" onClick={GetMBToken}>Login</Button>
      </div>
    )
  }
  async loadBitPic(paymail) {
    if (paymail == null || paymail === '') {
      return
    }
    console.log(paymail)
    var res = await fetch('https://bitpic.network/exists/'+paymail)
    var body = await res.json()
    if (body === 1) {
      return
    }
    this.setState({bitPicExists: false})
  }
  renderBitPicSetup() {
    if (this.state.bitPicExists) {
      return null
    }
    return (
      <div className="text-center">
        <h5>Setup your BitPic to include a picture of yourself with your review!</h5>
        <a className="btn btn-warning" href="https://bitpic.network" target="_" role="button">Add Avatar</a>
      </div>
    )
  }
  renderUserItems() {
    if (!this.props.isLoggedIn) {
      return (
        <div className="container text-center">
          {this.renderLoginSnippet()}
        </div>
      )
    }

    return (
      <div className="container text-center">
        <h5>Welcome back {this.props.user}!</h5>
        <Link to='/profile'><Button variant="outline-primary" size="lg">My Profile</Button></Link>
        <ul/>
        <h5>Vote on existing reviews or submit a new review to earn money!</h5>
        <Link to='/submit'><Button variant="outline-secondary" size="lg">New Review</Button></Link>
        <ul/>
        {this.renderBitPicSetup()}
      </div>
    )
  }

  render() {
    return(
      <div className="jumbotron jumbotron-fluid tr-brand-jumbotron">
        <div className="container-fluid">
          <div className="row">
            {this.renderPlaceHolder()}
          </div>
          <hr/>
          <div style={{maxWidth: '900px', marginLeft: 'auto', marginRight: 'auto'}}>
            <p style={{padding: '30px', textIndent: '20px'}}>TrueReviews is a review platform that is powered by Bitcoin to
              incentivize better reviews for any location on Google Maps.
              TrueReviews allows businesses to issue rewards to encourage
              feedback from their customers.</p>
            {this.renderUserItems()}
          </div>
          <ul/>
          {this.renderRecentActivity()}
        </div>
      </div>
    );
  }
}

export default Home

