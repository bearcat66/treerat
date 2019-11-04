import React from 'react';
import {GetMBUser} from './MB';
//import MoneyButton from '@moneybutton/react-money-button'
import {Button, Modal} from 'react-bootstrap'
import GoogleMap from 'google-map-react'
import Place from './Place';
import GoogleMapLoader from 'react-google-maps-loader'
import GooglePlacesSuggest from 'react-google-places-suggest'




const MY_API_KEY = process.env.REACT_APP_GOOGLE_API_KEY



export default class Redeem extends React.Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleRedeemSubmit = this.handleRedeemSubmit.bind(this)
    this.handleSelectSuggest = this.handleSelectSuggest.bind(this)
    this.handleNoResult = this.handleNoResult.bind(this)
    this.handleStatusUpdatStatusUpdatee = this.handleStatusUpdate.bind(this)
    this.handleLocationChange = this.handleLocationChange.bind(this)
    this.handleLocationTypeChange = this.handleLocationTypeChange.bind(this)
    this.handleReviewBodyChange = this.handleReviewBodyChange.bind(this)
    this.handleReviewRatingChange = this.handleReviewRatingChange.bind(this)
    this.handleRedeemCodeChange = this.handleRedeemCodeChange.bind(this)
    this.handleBusinessIDChange = this.handleBusinessIDChange.bind(this)
    this.handleFormChange = this.handleFormChange.bind(this)
    this.closeModal = this.closeModal.bind(this)
    

    this.state = {
      badInput: false,
      type: '',
      name: '',
      body: '',
      search: '',
      placeID: '',
      placeDescription: '',
      address: '',
      rating: '',
      businessID: '',
      redeemCode: '',
      moneyButtonID: '',
      moneyButtonName: '',
      reviewTx: '',
      coords: {lat: 59.93, lng: 30.33},
      renderMap: false,
      submitted: false,
      renderMB: false,
      validForm: false,
      renderReviewForm: false,
      renderRedeemForm: true,
      invalidRedemptionCode: false,
      renderSuccessModal: false,
    };
  }

  closeModal() {
    this.setState({renderSuccessModal: false})
  }

  renderSubmissionModal() {
    if (this.state.renderSuccessModal === false) {
      return null
    }
    return (
      <Modal.Dialog>
        <Modal.Header closeButton>
          <Modal.Title>Successfully created a review!</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <p>Congratulations! You have earned 1 reputation point. Thanks for reviewing {this.state.placeDescription}</p>
        </Modal.Body>

        <Modal.Footer>
          <Button onClick={this.closeModal} variant="secondary">Close</Button>
          <Button variant="primary">View Review</Button>
        </Modal.Footer>
      </Modal.Dialog>
    )
  }

  async handleSubmit(event) { 
    event.preventDefault();
    fetch('/api/review/'+this.state.placeID, {
      headers: {'Content-Type': 'application/json'},
      method: 'post',
      body: JSON.stringify({
        locationName: this.state.placeDescription,
        coords: this.state.coords,
        reviewBody: this.state.body,
        rating: this.state.rating,
        userID: this.state.moneyButtonID
      })
    }).then(res => res.json()).then(rev =>  {
      this.setState({renderSuccessModal: true})
      console.log(rev)
    })
  }

  async handleRedeemSubmit(event) { 
    event.preventDefault();
    fetch('/api/truereview/'+this.state.businessID+'/redeem', {
      headers: {'Content-Type': 'application/json'},
      method: 'post',
      body: JSON.stringify({
        code: this.state.redeemCode,
        userID: this.state.moneyButtonID,
        dryRun: true
      })
    }).then(res => {
      if (res.status !== 200) {
        throw 'Invalid redemption code'
      }
      return res.json()
    }).then(red =>  {
      if (!red.redeemed) {
        throw 'Error redeeming code'
      }
      console.log(red)
      this.setState({invalidRedemptionCode: false, renderReviewForm: true, renderRedeemForm: false, placeID: red.placeID})
    }).catch(e => {
      console.error(e)
      this.setState({invalidRedemptionCode: true})
    })
  }

  renderRedeemErrorMessage() {
    if (!this.state.invalidRedemptionCode) {
      return null
    }
    return (
      <div>
        <h1>Invalid Redemption Code</h1>
      </div>
    )
  }

  renderRedeemSubmitButton(){
    console.log(this.state.moneyButtonID)
    if (this.state.moneyButtonID === '' || this.state.badInput) {
      return (
        <Button variant="primary" type="submit" disabled>Redeem Code</Button>
      )
    }
    return (
      <Button variant="primary" type="submit">Redeem Code</Button>
    )
  }
  renderSubmitButton(){
    console.log(this.state.moneyButtonID)
    if (this.state.moneyButtonID === '' || this.state.badInput) {
      return (
        <Button variant="primary" type="submit" disabled>Submit Review</Button>
      )
    }
    return (
      <Button variant="primary" type="submit">Submit Review</Button>
    )
  }

  componentDidMount() {
    GetMBUser().then(r=> {
      this.setState({moneyButtonID: r.id, moneyButtonName: r.name})
    })
  }

  //handle changes to the form entered by the user
  handleLocationChange(e) {
      this.setState({search: e.target.value, address: e.target.value, placeDescription: e.target.value})
  }

  handleLocationTypeChange(event) {
    this.setState({type: event.target.value})
  }
 
  handleReviewBodyChange(event) {
    this.setState({body: event.target.value});
  }

  handleRedeemCodeChange(event) {
    this.setState({redeemCode: event.target.value});
  }

  handleBusinessIDChange(event) {
    this.setState({businessID: event.target.value});
  }

  handleReviewRatingChange(event) {
    event.preventDefault()
    console.log(event.target.value)
    this.setState({rating: event.target.value})
    console.log(this.state)
    console.log(this.state.rating === '')

  }

  handleFormChange(event) {
    if (this.state.placeID === '' || this.state.body === '', this.state.rating === '') {
      this.setState({renderMB: false, validForm: false})
    }
    else {
      this.setState({renderMB: true, validForm: true})
    }
  }

  handleSelectSuggest(geocodedPrediction, originalPrediction) {
    this.setState({badInput: false})
    this.setState({renderMap: true})
    this.setState({
      coords: {
        lat: geocodedPrediction.geometry.location.lat(),
        lng: geocodedPrediction.geometry.location.lng(),
      }
    })
    console.log(originalPrediction.description)
    this.setState({search: '', address: geocodedPrediction.formatted_address, placeID: geocodedPrediction.place_id, placeDescription: originalPrediction.description})
  }
  
  handleNoResult() {
    this.setState({badInput: true})
    console.log('No results for ', this.state.search)
  }
  renderPlaceMap() {

  if (!this.state.renderMap) {
      return null
    }
    var zoom = 14
    return (
      <div className="container text-center" style={{ height: '50vh', width: '50%' , justifyContent: 'center', alignItems: 'center'}}>
        <GoogleMap
          bootstrapURLKeys={{key: MY_API_KEY}}
          center={this.state.coords}
          defaultZoom={zoom} >
          <Place lat={this.state.coords.lat} lng={this.state.coords.lng} name={this.state.placeDescription}/>
        </GoogleMap>
      </div>
    )
  }

  renderReviewForm() {
    if (this.state.renderSuccessModal || !this.state.renderReviewForm) {
      return null
    }
    return (
      <form onSubmit={this.handleSubmit} onChange={this.handleFormChange}>
        <div className="form-group" id="reviewFormBody">
          <label>Review Body</label>
          <textarea className="form-control" rows="3" onChange={this.handleReviewBodyChange} required/>
        </div>
        <div className="form-group" id="reviewFormRating">
          <label>Rating</label>
          <input className="form-control" type="number" min="0" max="10" step=".1" onInput={this.handleReviewRatingChange}  required/>
        </div>
        {this.renderSubmitButton()}
      </form>
    )
  }

  renderRedeemForm() {
    if (!this.state.renderRedeemForm) {
      return null
    }
    return (
      <div>
        <h3 className="text-center">Redeem your rewards</h3>
        <form onSubmit={this.handleRedeemSubmit}>
          <div className="form-group" id="redeemFormBusinessID">
            <label for="businessIDCode">Business Identity Code</label>
            <input id="businessIDCode" className="form-control" type="text" onChange={this.handleBusinessIDChange} placeholder="Enter the ID of the Business" required/>
          </div>
          <div className="form-group" id="redeemFormCode">
            <label for="redemptionCode">Redemption Code</label>
            <input id="redemptionCode" className="form-control" type="text" onChange={this.handleRedeemCodeChange} placeHolder="Enter your redemption code" required/>
          </div>
          {this.renderRedeemSubmitButton()}
          {this.renderRedeemErrorMessage()}
        </form>
      </div>
    )
  }

  handleStatusUpdate(status) {
    console.log(status)
  }
  render() {
      return (
        <div className="jumbotron jumbotron-transparent-25">
          <div className="container-fluid">
            {this.renderReviewForm()}
            {this.renderSubmissionModal()}
            {this.renderRedeemForm()}
          </div>
          {this.renderPlaceMap()}
        </div>
      );
  }
}


