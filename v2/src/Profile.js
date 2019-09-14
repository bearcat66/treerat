import React, {Component} from 'react';
import {GetMBUser} from './MB'
import {Button, Modal} from 'react-bootstrap';

export default class Profile extends Component {
  constructor(props) {
    super(props)
    this.mintCoupon = this.mintCoupon.bind(this)
    this.getCodes = this.getCodes.bind(this)
    this.renderRedemptionCodeModal = this.renderRedemptionCodeModal.bind(this)
    this.closeModal = this.closeModal.bind(this)
    this.state = {
      user: {},
      userExists: true,
      isLoadingBusiness: false,
      mintSuccess: false,
      userReviews: [],
      codeList: [],
      getUserDone: false,
      newlyMintedCode: '',
      businessLocations: []
    }
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
      console.log(codes)
      if (this.state.newlyMintedCode !== '') {
        codes.push(this.state.newlyMintedCode)
      }
      this.setState({codeList: codes})
      return codes
    }
    return codes
  }
  async getUserInformation(id) {
    var res = await fetch('/api/users/'+id)
    if (res.status === 404) {
      return
    }
    var user = await res.json()
    res = await fetch('/api/review/user/' + id)
    var reviews = await res.json()
    return {user: user, reviews: reviews}
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
    console.log(result)
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
  componentDidMount() {
    GetMBUser().then(r=> {
      this.getUserInformation(r.profile.primaryPaymail).then(r => {
        console.log(r)
        if (r == null) {
          this.setState({userExists: false})
          return
        }
        this.setState({user: r.user, getUserDone: true, userReviews: r.reviews, businessLocations: r.user.locations, userExists: true})
      })
    })
  }
  async loadBusinessLocations() {
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
  renderSpinner() {
    if (this.state.getUserDone) {
      return null
    }
    return (
      <div className="container text-center">
        <p>Loading User Information...</p>
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
      console.log(location)
      return (
        <div className="container text-center">
          <h1>My Business Details</h1>
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
    console.log(this.state.userReviews)
    return this.state.userReviews.reviews.map((review, index) => {
      return (
        <div class="card" styles="width: 18rem;">
          <div class="card-body">
            <h5 class="card-title">{review.locationName}</h5>
            <h6 class="card-subtitle mb-2 text-right">Rating: {review.rating}</h6>
            <h6 class="card-subtitle mb-2 text-right">Score: {review.points.score}</h6>
            <p class="card-text">{review.body}</p>
          </div>
        </div>
      )
    })
  }
  renderUserInfo() {
    if (Object.entries(this.state.user).length === 0) {
      return null
    }
    console.log(this.state.user.reviews)
    return (
      <div>
        <h3>Paymail: {this.state.user.profile.primaryPaymail}</h3>
        <h3>Reputation: {this.state.user.tokens}</h3>
      </div>
    )
  }
  renderCoupons() {
    if (Object.entries(this.state.user).length === 0) {
      return null
    }
    console.log(this.state.user.coupons)
    return this.state.user.coupons.map((coupon, index) => {
      return (
        <div class="card" styles="width: 18rem;">
          <div class="card-body">
            <h5 class="card-title">{coupon.placeName}</h5>
            <h5 class="card-text">${coupon.amount}</h5>
            <Button href={coupon.placeURL} target='_blank'>View on Google Maps</Button>
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
      <div class="card" styles="width: 18rem;">
        <div class="card-body">
          <img src="logocrop.png" width="100" height="100"/>
          <h3 class="card-title">True Review Alpha Tester</h3>
          <h5 class="card-text">Thanks for being a True Review Alpha Tester!</h5>
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
      <div className="jumbotron jumbotron-transparent-25">
      <div className="container-fluid text-center">
        <div>
          <h1>My Profile</h1>
          <hr/>
          {this.renderUserInfo()}
          {this.renderSpinner()}
        </div>
        <div className="row">
          <div className="col">
            <h3>My Reviews</h3>
            {this.renderUserReviews()}
          </div>
          <div className="col">
            <h3>My Rewards</h3>
            {this.renderCoupons()}
            {this.renderAlphaTester()}
          </div>
        </div>
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
