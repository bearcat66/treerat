import React, {Component} from 'react';
import {GetMBUser, GetMBToken} from './MB';
import {Button, Table} from 'react-bootstrap';
import {MoneyButtonClient} from '@moneybutton/api-client'
const run = window.Jigs.RunInstance
const Run = window.Run
const PURSE_PRIVKEY = 'Kyt9WKt8XTymzwyQcwQeWtpEoELNHgkiwwbCFuBBHLWVPrjo7xBV'
const MB_OAUTH_ID = process.env.REACT_APP_MBOAUTHID

class Home extends Component {

  constructor(props) {
    super(props)
    this.state = {
      pubkey: '',
      moneyButtonID: '',
      isLoggedIn: false,
      showSpinner: true,
      userReviews: [],
      userProfile: {},
      userLocations: [],
      userTokens: 0,
      topReviewers: [],
      userLoaded: false,
      userDoesNotExist: false,
      topReviewersLoaded: false,
    }
  }
  componentDidMount() {
    GetMBUser().then(r=> {
      this.setState({moneyButtonID: r.id, showSpinner: false, isLoggedIn: true, userProfile: r.profile})
      this.loadUserItems().then(r=> {
        this.props.userExists(true)
        this.setState({userLoaded: true})
      }).catch(e => {
        console.log('tt')
        this.props.userExists(false)
        console.error(e)
        this.setState({userLoaded: true, userDoesNotExist: true})
      })
    }).catch(e => {
      console.error(e)
      this.setState({showSpinner: false, isLoggedIn: false})
    })

  }
  renderSpinner() {
    if (this.state.showSpinner) {
      return (
        <div className="container text-center">
          <p>Loading User Information...</p>
          <div className="spinner-grow"/>
        </div>
      )
    }
    return null
  }
  renderPlaceHolder() {
    if (this.state.showSpinner) {
      return null
    }
    return (
      <div className="container text-center">
        <h1>True Reviews</h1>
        <p>The place for high-quality reviews!</p>
      </div>
    )
  }
    /*renderTopReviewers() {
    if (!this.state.topReviewersLoaded) {
      return (
        <div class="text-center">
          <p>Loading top reviewers...</p>
          <div className="spinner-grow">
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      )
    }
    return (
      <div className="container text-center">
        <h2>Top True Reviewers!</h2>
        <Table striped bordered variant="dark">
          <thead>
            <tr>
              <th text-center="true">User</th>
              <th text-center="true">Reputation</th>
            </tr>
          </thead>
          <tbody>
            {this.renderTopReviewersData()}
          </tbody>
        </Table>
      </div>
    )
  }
  renderTopReviewersData() {
    return this.state.topReviewers.map((account, index) => {
      return (
        <tr>
          <td>{account.user}</td>
          <td>{account.reputation}</td>
        </tr>
      )
    })
  }
  getTopReviewers() {
    if (this.state.moneyButtonID === '' || this.state.userLoaded === false || this.state.topReviewersLoaded === true) {
      return
    }
    this.loadTopReviewers().then(r => {
      if (r == null) {
        return
      }
      this.setState({topReviewers: r, topReviewersLoaded: true})
    })
  }
  async loadTopReviewers() {
    run.activate()
    await run.sync()
    var userdb = run.owner.jigs.find(x => x.constructor.name === 'UserDB')
    if (userdb == null) {
      return null
    }
    var userEntries = Object.entries(userdb)
    var topReviewers = []
    for (var [key, value] of userEntries) {
      if (key === 'owner' || key === 'satoshis' || key === 'location' || key === 'origin') {
        continue
      }
      var userRunInstance = new Run({
        network: 'main',
        owner: value.privKey,
        purse: PURSE_PRIVKEY,
      })
      userRunInstance.activate()
      await userRunInstance.sync()
      var tokens = 0
      var jigs = userRunInstance.owner.jigs
      for (var i=0; i<jigs.length; i++) {
        if (jigs[i].constructor.name === 'TrueReviewToken') {
          tokens += jigs[i].amount
        }
      }
      var mbclient = new MoneyButtonClient(MB_OAUTH_ID)
      var profile = await mbclient.getUserProfile(key)
      console.log(profile)
      topReviewers.push({user: profile.name, reputation: tokens})
    }
    topReviewers.sort(function(a,b){return b.reputation - a.reputation})
    return topReviewers.slice(0, 3)
  }*/
  renderLoginSnippet() {
    return (
      <div className="text-center">
        <h5>Please login to submit reviews and vote on existing reviews!</h5>
        <Button variant="primary" size="lg" onClick={GetMBToken}>Login</Button>
      </div>
    )
  }
  renderUserItems() {
    if (!this.state.userLoaded && this.state.isLoggedIn) {
      return (
        <div class="text-center">
          <p>Loading user stats...</p>
          <div className="spinner-grow">
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      )
    }
    if (!this.state.isLoggedIn || this.state.userDoesNotExist) {
      return (
        <div>
          {this.renderLoginSnippet()}
        </div>
      )
    }

    return (
      <div className="container text-center">
        <h5>Your True Review Statistics</h5>
        <h6>Review Count: {this.state.userReviews.length}</h6>
        <h6>Reputation: {this.state.userTokens}</h6>
        <Button variant="primary" size="lg" onClick={() => {
          this.props.navigateTo('profile')
        }}>View My Profile</Button>
      </div>
    )
  }
  async loadUserItems() {
    if (this.state.moneyButtonID === '') {
      throw 'User not logged in'
    }
    console.log('loading user items')
    var res = await fetch('/api/users/' + this.state.userProfile.primaryPaymail, {credentials: 'same-origin'})
    if (res.status === 404) {
      throw 'User does not exist'
    }
    var userInfo = await res.json()
    console.log(userInfo)
    this.setState({userReviews: userInfo.reviews, userTokens: userInfo.tokens})
    return userInfo
  }

  render() {
    return(
      <div className="jumbotron jumbotron-fluid tr-brand-jumbotron">
        {this.renderSpinner()}
        <div className="container-fluid">
          <div className="row">
            {this.renderPlaceHolder()}
          </div>
          <hr/>
          <div className="row">
            <div className="col text-center">
              <p>TrueReviews is a review platform that is powered by Bitcoin to
                incentivize better reviews for any location on Google Maps.
                TrueReviews allows businesses to issue rewards to encourage
                feedback from their customers.</p>
            </div>
            <div className="col">
              {this.renderUserItems()}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Home

