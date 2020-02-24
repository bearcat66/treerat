import React, {Component} from 'react';
import {Button, Modal, Tabs, Tab} from 'react-bootstrap';
import ReviewCard from './ReviewCard.js'
import './Profile.css'

export default class Profile extends Component {
  constructor(props) {
    super(props)
    this.mintCoupon = this.mintCoupon.bind(this)
    this.getCodes = this.getCodes.bind(this)
    this.renderRedemptionCodeModal = this.renderRedemptionCodeModal.bind(this)
    this.closeModal = this.closeModal.bind(this)
    this.state = {
      user: {},
      paymail: this.props.profile,
      userExists: true,
      isLoadingBusiness: false,
      isLoadingUser: false,
      mintSuccess: false,
      userReviews: [],
      codeList: [],
      amountEarned: 0,
      amountEarnedCalculated: false,
      getUserDone: false,
      getUserReviewsDone: false,
      newlyMintedCode: '',
      businessLocations: []
    }
    this.getUserInformation(this.props.profile)
  }
  componentDidUpdate(prevProps) {
    if (prevProps.profile !== this.props.profile) {
      this.getUserInformation(this.props.profile)
    }
  }
  async getAmountEarned(tokens) {
    var r = await fetch('https://api.blockchair.com/bitcoin-sv/stats')
    var res = await r.json()
    var amount = tokens * 1000 * res.data.market_price_usd / 100000000
    this.setState({amountEarned: amount, amountEarnedCalculated: true})
  }
  async getCodes(placeID) {
    var codes = []
    for (var i=0;i<this.state.businessLocations.length;i++) {
      if (this.state.businessLocations[i].placeID !== placeID) {
        continue
      }
      for (var j=0;j<this.state.businessLocations[i].redeemableRewards.length;j++) {
        if (this.state.businessLocations[i].redeemableRewards[j].redeemed) {
          continue
        }
        codes.push(this.state.businessLocations[i].redeemableRewards[j]._redemptionCode)
      }
      if (this.state.newlyMintedCode !== '') {
        codes.push(this.state.newlyMintedCode)
      }
      this.setState({codeList: codes})
      return codes
    }
    return codes
  }
  async getUserInformation(id) {
    if (id === '') {
      console.error('No user found')
      this.setState({userExists: false})
      return
    }
    var res = await fetch(
      '/api/users/'+id, {
        credentials: 'same-origin'
      }
    )
    if (res.status === 404) {
      return
    }
    var user = await res.json()
    this.setState({user: user, getUserDone: true})
    res = await fetch('/api/review/user/' + id)
    var reviews = await res.json()
    this.getAmountEarned(user.tokens)
    this.setState({userReviews: reviews, getUserReviewsDone: true, businessLocations: user.locations, userExists: true, isLoadingUser: false})
  }
  async mintCoupon(placeID) {
    this.setState({isLoadingBusiness: true})
    var res = await fetch('/api/truereview/'+placeID, {
      headers: {'Content-Type': 'application/json'},
      method: 'post',
      body: JSON.stringify({
        amount: 1,
        businessID: this.state.user.profile.primaryPaymail
      })
    })
    if (res.status !== 200) {
      return
    }
    var result = await res.json()
    this.setState({isLoadingBusiness: false, newlyMintedCode: result.redemptionCode, mintSuccess: true})
    return {code: result.redemptionCode}
  }
  renderMintCouponModal() {
    if (!this.state.mintSuccess) {
      return null
    }
    return (
      <Modal.Dialog>
        <Modal.Header closeButton>
          <Modal.Title>Successfully minted a new redeemable coupon!</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <p>The redemption code for this coupon is: {this.state.newlyMintedCode}</p>
        </Modal.Body>

        <Modal.Footer>
          <Button onClick={this.closeModal} variant="secondary">Close</Button>
        </Modal.Footer>
      </Modal.Dialog>
    )
  }
  renderCodes() {
    return this.state.codeList.map((code, index) => {
      return (
        <div className="container text-center">
          <p>{code}</p>
        </div>
      )
    })
  }
  closeModal() {
    this.setState({codeList: [], mintSuccess: false})
  }
  renderRedemptionCodeModal() {
    if (this.state.codeList.length === 0) {
      return null
    }
    return (
      <Modal.Dialog>
        <Modal.Header closeButton>
          <Modal.Title>Open Redemption Codes</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {this.renderCodes()}
        </Modal.Body>

        <Modal.Footer>
          <Button onClick={this.closeModal} variant="secondary">Close</Button>
        </Modal.Footer>
      </Modal.Dialog>
    )
  }
  renderSpinner(bool) {
    if (bool) {
      return null
    }
    return (
      <div className="container text-center">
        <p style={{color: '#1a6bbe'}}>Loading...</p>
        <div className="spinner-grow"/>
      </div>
    )
  }
  renderBusinessAccount() {
    if (Object.entries(this.state.user).length === 0) {
      return null
    }
    if (!this.state.user.businessAccount) {
      return null
    }
    if (this.state.codeList.length !== 0 || this.state.mintSuccess) {
      return null
    }

    return this.state.businessLocations.map((location, index) => {
      var redeemedCount = 0
      for (var i=0;i<location.redeemableRewards.length;i++) {
        if (location.redeemableRewards[i].redeemed) {
          redeemedCount++
        }
      }
      return (
        <div className="container text-center">
          <h1>Business Details</h1>
          <div class="card" styles="width: 18rem;">
            <div class="card-body">
              <h5 class="card-title">{location.name}</h5>
              <h6 class="card-subtitle mb-2 text-right">Rating: 10</h6>
              <h6 class="cart-subtitle mb-2 text-right">Issued Redeemables: {location.redeemableRewards.length}</h6>
                <h6 class="cart-subtitle mb-2 text-right">Redeemed Coupons: {redeemedCount}</h6>
              <div className="row">
                <div className="col">
                  {this.renderMintButton(location)}
                </div>
                <div className="col">
                  <Button variant="primary" onClick={() => this.getCodes(location.placeID)}>View Open Redemption Codes</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )})
  }
  renderMintButton(location) {
    if (this.state.isLoadingBusiness) {
      return (<Button variant="primary" disabled>Minting...</Button>)
    }
    return (
      <Button variant="primary" onClick={() => this.mintCoupon(location.placeID)}>Mint $1 Coupon Reward</Button>
    )
  }
  renderUserReviews() {
    if (Object.entries(this.state.user).length === 0) {
      return null
    }
    if (this.state.userReviews.length === 0) {
      return null
    }
    if (this.state.userReviews.reviews == null) {
      return null
    }
    return this.state.userReviews.reviews.map((review, index) => {
      if (review == null || review.points == null) {
        return null
      }
      console.log(review)
      return (
        <ReviewCard key={index} location={review.location} tokens={this.props.tokens} review={review} loadNotifications={this.props.loadNotifications} user={this.props.user}/>
      )
        /*return (
        <div className="card" styles="width: 18rem;">
          <div className="card-body">
            <h5 className="card-title">{review.locationName}</h5>
            <h6 className="card-subtitle mb-2 text-right">Rating: {review.rating}</h6>
            <h6 className="card-subtitle mb-2 text-right">Score: {review.points.score}</h6>
            <p className="card-text">{review.body}</p>
          </div>
        </div>
      )*/
    })
  }
  renderAmountEarned() {
    if (!this.state.amountEarnedCalculated) {
      return (
        <h5 className="text-left">Earned: <a target="_" href="https://www.moneybutton.com/money">
            <div className="spinner-border spinner-border-sm"/></a>
        </h5>
      )
    }
    return (
      <h5 className="text-left">Earned: <a target="_" href="https://www.moneybutton.com/money">${this.state.amountEarned.toFixed(3)}</a>
      </h5>
    )
  }
  renderUserInfo() {
    if (Object.entries(this.state.user).length === 0) {
      return null
    }
    return (
      <div className="container-fluid text-center border-info border-3 mb-3 rounded-lg" styles="width: 10rem;">
        <div className="card" styles="width: 10rem;">
          <div className="card-header">
            <img alt='avatar' className="avatar" src={'https://bitpic.network/u/'+this.state.user.profile.primaryPaymail}/>
          </div>
          <div className="card-body text-left">
            <h5 className="text-left">Paymail: {this.state.user.profile.primaryPaymail}</h5>
            <h5 className="text-left">Reputation: {this.state.user.tokens}</h5>
            {this.renderAmountEarned()}
            <h5 className="text-left">Run Address: <a target="_" href={"https://whatsonchain.com/address/"+this.state.user.address}>{this.state.user.address}</a></h5>
            <hr/>
          </div>
        </div>
      </div>
    )
  }
  renderCoupons() {
    if (Object.entries(this.state.user).length === 0) {
      return null
    }
    return this.state.user.coupons.map((coupon, index) => {
      return (
      <div className="card border-dark border-3 mb-3 rounded-lg" styles="width: 18rem;">
        <div class="card" styles="width: 18rem;">
          <div class="card-body">
            <h5 class="card-title">{coupon.placeName}</h5>
            <h5 class="card-text">${coupon.amount}</h5>
            <Button href={coupon.placeURL} target='_blank'>View on Google Maps</Button>
          </div>
        </div>
      </div>
      )
    })
  }
  renderAlphaTester() {
    if (Object.entries(this.state.user).length === 0) {
      return null
    }
    if (this.state.user.alphaTokens === 0) {
      return null
    }
    return (
      <div className="card border-dark border-3 mb-3 rounded-lg" styles="width: 18rem;">
        <div className="card-body">
          <img alt="logo" src="logocrop.png" width="100" height="100"/>
          <h3 className="card-title">True Review Alpha Tester</h3>
          <h5 className="card-text">Thanks for being a True Review Alpha Tester!</h5>
        </div>
      </div>
    )
  }

  render() {
    if (!this.state.userExists) {
      return (
        <div>
          <h3>Something went wrong with user registration... log out and back in again.</h3>
        </div>
      )
    }
    return (
      <div className="jumbotron jumbotron-transparent-25" style={{maxWidth: '900px', marginRight: 'auto', marginLeft: 'auto'}}>
      <div className="container-fluid text-center">
        <div>
          <h1 className="text-center" style={{color: '#1a6bbe'}}>Profile</h1>
          <hr/>
          {this.renderUserInfo()}
          {this.renderSpinner(this.state.getUserDone)}
        </div>
        <Tabs defaultActiveKey="reviews" id="profile-tab">
          <Tab eventKey="reviews" title="My Reviews" className="border-dark">
            <ul/>
            <h3 style={{color: '#1a6bbe'}}>Reviews</h3>
            {this.renderUserReviews()}
            {this.renderSpinner(this.state.getUserReviewsDone)}
          </Tab>
          <Tab eventKey="rewards" title="My Rewards">
            <ul/>
            <h3 style={{color: '#1a6bbe'}}>Rewards</h3>
            {this.renderSpinner(this.state.getUserReviewsDone)}
            {this.renderCoupons()}
            {this.renderAlphaTester()}
          </Tab>
        </Tabs>
        <div>
          {this.renderMintCouponModal()}
          {this.renderBusinessAccount()}
          {this.renderRedemptionCodeModal()}
        </div>
      </div>
    </div>
    )
  }
}
