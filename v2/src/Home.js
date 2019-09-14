import React, {Component} from 'react';
import {GetMBToken} from './MB';
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
    }
    this.loadBitPic(this.props.user)
  }
  componentDidMount() {
    this.loadBitPic(this.props.user)
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
        </div>
      </div>
    );
  }
}

export default Home

