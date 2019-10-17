import React from 'react';
import {GetMBUser} from './MB';
//import MoneyButton from '@moneybutton/react-money-button'
import {Jumbotron, Button, Modal, Spinner} from 'react-bootstrap'
import GoogleMap from 'google-map-react'
import Place from './Place';
import GoogleMapLoader from 'react-google-maps-loader'
import GooglePlacesSuggest from 'react-google-places-suggest'
const Review = window.Jigs.Review
const Location = window.Jigs.Location
const AllLocations = window.Jigs.AllLocations
//const UserDB = window.Jigs.UserDB


//const Run = window.Run
const run = window.Jigs.RunInstance




const MY_API_KEY = process.env.REACT_APP_GOOGLE_API_KEY



export default class ReviewForm extends React.Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleSelectSuggest = this.handleSelectSuggest.bind(this)
    this.handleNoResult = this.handleNoResult.bind(this)
    this.handleStatusUpdatStatusUpdatee = this.handleStatusUpdate.bind(this)
    this.handleLocationChange = this.handleLocationChange.bind(this)
    this.handleLocationTypeChange = this.handleLocationTypeChange.bind(this)
    this.handleReviewBodyChange = this.handleReviewBodyChange.bind(this)
    this.handleReviewRatingChange = this.handleReviewRatingChange.bind(this)
    this.handleReviewCodeChange = this.handleReviewCodeChange.bind(this)
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
      moneyButtonID: '',
      paymail: '',
      moneyButtonName: '',
      reviewTx: '',
      redeemCode: '',
      coords: {lat: 59.93, lng: 30.33},
      renderMap: false,
      submitted: false,
      codeValid: false,
      renderSuccessModal: false,
      renderErrorModal: false,
      isLoading: false
    };
  }

  closeModal() {
    this.setState({renderSuccessModal: false, renderErrorModal: false})
  }

  renderErrorModal() {
    if (this.state.renderErrorModal === false) {
      return null
    }
    return (
      <Modal.Dialog>
        <Modal.Header closeButton>
          <Modal.Title>Failed to create a review.</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <p>There was a problem submitting your review:</p>
          <p>{this.state.errorMessage}</p>
          <p>Please try again.</p>
        </Modal.Body>

        <Modal.Footer>
          <Button onClick={this.closeModal} variant="secondary">Close</Button>
        </Modal.Footer>
      </Modal.Dialog>
    )
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
          {this.state.redeemCode !== '' ? <p>You have successfully redeemed your code for a dollar!</p> : null}
        </Modal.Body>

        <Modal.Footer>
          <Button onClick={this.closeModal} variant="secondary">Close</Button>
          <Button onClick={this.props.showProfilePage} variant="primary">View Review</Button>
        </Modal.Footer>
      </Modal.Dialog>
    )
  }

  async handleSubmit(event) { 
    event.preventDefault();
    this.setState({isLoading: true})
    if (this.state.redeemCode !== '') {
      var res = await fetch('/api/truereview/'+this.state.placeID+'/redeem', {
        headers: {'Content-Type': 'application/json'},
        method: 'post',
        body: JSON.stringify({
          code: this.state.redeemCode,
          userID: this.state.paymail,
          dryRun: true
        })
      })
      if (res.status === 500) {
        this.setState({renderErrorModal: true, codeValid: false, errorMessage: 'Failed to redeem True Review code', isLoading: false})
        throw "Failed to redeem code"
      }
      var result = await res.json()
      this.setState({codeValid: true})
      if (!this.state.codeValid) {
        return
      }
      console.log('Dry run succeeded')
    }

    if (this.state.redeemCode !== '') {
      var res = await fetch('/api/truereview/'+this.state.placeID+'/redeem', {
        headers: {'Content-Type': 'application/json'},
        method: 'post',
        body: JSON.stringify({
          code: this.state.redeemCode,
          userID: this.state.paymail,
          dryRun: false
        })
      })
      if (res.status !== 200) {
        throw 'Redeeming failed'
      }
      var result = await res.json()
      console.log(result)
    }
    console.log(this.state.paymail)
    fetch('/api/review/'+this.state.placeID, {
      headers: {'Content-Type': 'application/json'},
      method: 'post',
      body: JSON.stringify({
        locationName: this.state.placeDescription,
        coords: this.state.coords,
        reviewBody: this.state.body,
        rating: this.state.rating,
        userID: this.state.paymail
      })
    }).then(res => res.json()).then(rev =>  {
      this.setState({renderSuccessModal: true, isLoading: false})
      console.log(rev)
    })
  }

  renderSubmitButton(){
    console.log('rendering submit button')
    if (this.state.moneyButtonID === '' || this.state.badInput) {
      return (
        <Button variant="primary" type="submit" disabled>Submit Review</Button>
      )
    }
    if (this.state.isLoading) {
      return (
          <Button variant="primary" disabled>
             <Spinner
               as="span"
               animation="grow"
               size="sm"
               role="status"
               aria-hidden="true"
             />
             Submitting...
           </Button>
      )
    }
    return (
      <Button variant="primary" type="submit">Submit Review</Button>
    )
  }

  componentDidMount() {
    GetMBUser().then(r=> {
      this.setState({moneyButtonID: r.id, moneyButtonName: r.name, paymail: r.profile.primaryPaymail})
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

  handleReviewCodeChange(event) {
    this.setState({redeemCode: event.target.value})
  }

  handleReviewRatingChange(event) {
    event.preventDefault()
    this.setState({rating: event.target.value})
  }

  handleSelectSuggest(geocodedPrediction, originalPrediction) {
    this.setState({
      badInput: false,
      renderMap: true,
      coords: {
        lat: geocodedPrediction.geometry.location.lat(),
        lng: geocodedPrediction.geometry.location.lng(),
      },
      search: '',
      address: geocodedPrediction.formatted_address,
      placeID: geocodedPrediction.place_id,
      placeDescription: originalPrediction.description
    })
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

  renderForm() {
    console.log('rerender')
    console.log(this.state.placeDescription)
    if (this.state.renderSuccessModal || this.state.renderErrorModal) {
      return null
    }
    return (
      <Jumbotron>
          <form onSubmit={this.handleSubmit}>
            <div className="form-group" id="reviewFormLocation">
              <label>Location to Review</label>
              <GoogleMapLoader
                params={{
                  key: MY_API_KEY,
                  libraries: "places,geocode",
                }}
                render={googleMaps =>
                  googleMaps && (
                    <GooglePlacesSuggest
                      googleMaps={googleMaps}
                      autocompletionRequest={{
                        input: this.state.search,
                      }}
                      onNoResult={this.handleNoResult}
                      onSelectSuggest={this.handleSelectSuggest}
                      onStatusUpdate={this.handleStatusUpdate}
                      textNoResults='Did not find any matching locations' // null or  if you want to disable the no results item
                      >
                        <input
                          className="form-control"
                          type='text'
                          value={this.state.placeDescription}
                          placeholder='Search a location'
                          onChange={this.handleLocationChange}
                          required
                        />

                      </GooglePlacesSuggest>
                    )
                }
              />
            </div>
      <div className="form-group" id="reviewFormBody">
        <label>Review Body</label>
        <textarea className="form-control" rows="3" onChange={this.handleReviewBodyChange} required/>
      </div>
      <div className="form-group" id="reviewFormRating">
        <label>Rating</label>
        <input className="form-control" type="number" min="0" max="10" step=".1" onInput={this.handleReviewRatingChange}  required/>
      </div>
      <div className="form-group" id="reviewFormRedeemCode">
        <label>True Review Code (Optional)</label>
        <input className="form-control" type="text" maxLength="6" onInput={this.handleReviewCodeChange}/>
      </div>
      {this.renderSubmitButton()}
    </form>
  </Jumbotron>
    )
  }
  handleStatusUpdate(status) {
    console.log('status')
  }
  render() {
      return (
        <div>
          <div className="container-fluid text-center">
            <h3>Submit a New Review</h3>
            <hr/>
          </div>
          <div className="container-fluid">
            {this.renderForm()}
            {this.renderSubmissionModal()}
            {this.renderErrorModal()}
          </div>           
          {this.renderPlaceMap()}
        </div>
      );
  }
}

