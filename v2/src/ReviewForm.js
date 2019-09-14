import React from 'react';
import {GetMBUser} from './MB';
import MoneyButton from '@moneybutton/react-money-button'
import {Modal, Form, Button} from 'react-bootstrap'
import GoogleMap from 'google-map-react'
import Place from './Place';
import GoogleMapLoader from 'react-google-maps-loader'
import GooglePlacesSuggest from 'react-google-places-suggest'
const Review = window.Jigs.Review
const Location = window.Jigs.Location
const AllLocations = window.Jigs.AllLocations
const UserDB = window.Jigs.UserDB

let bsv = require('bsv');

const Run = window.Run
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
      this.handleFormChange = this.handleFormChange.bind(this)
      this.onSubmission = this.onSubmission.bind(this)
      

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
        moneyButtonName: '',
        reviewTx: '',
        coords: {lat: 59.93, lng: 30.33},
        renderMap: false,
        submitted: false,
        renderMB: false,
	validForm: false
      };
    }

    onSubmission(payment) {
      this.setState({submitted: true, reviewTx: payment.txid})
      console.log("TX: "+ payment.txid)
    }

    closeModal() {
      this.setState({submitted: false})
    }

    renderSubmissionModal() {
      var url = "https://whatsonchain.com/tx/" + this.state.reviewTx
      return (
        <div className="modal fade" id="succesModal" tabIndex="-1" role="dialog" aria-labelledby="succesModalLabel" aria-hidden="true">
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="successModalLabel">Modal title</h5>
                <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div className="modal-body">
                ...
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
                <button type="button" className="btn btn-primary">Save changes</button>
              </div>
            </div>
          </div>
        </div>
      )
        
    }

    async handleSubmit(event) { 
      run.activate()
      event.preventDefault();
      var all = run.owner.jigs.find(x => x.constructor.name == 'AllLocations')
      if (all == null) {
        console.log("Must be a new owner key... creating a new AllLocations jig")
        all = new AllLocations()
        await run.sync()
      }
      var x = all.get(this.state.placeID)
      await run.sync()
      if (x == null) {
        console.log('Adding location: ' + this.state.placeID + ' to AllLocations jig')
        var loc = new Location(this.state.placeID, this.state.coords)
        await run.sync().then(console.log("Adding new Location to AllLocations jig"));
        all.set(this.state.placeID, loc.location)
      }
      await run.sync()
      x = all.get(this.state.placeID)
      console.log("Location exists... adding review")
      var loc = await run.load(x)
      await loc.sync()
      loc.createReview(this.state.body, this.state.rating, this.state.moneyButtonID)
      await run.sync()
      console.log('Listing reviews:')
      var revs = Object.entries(loc.reviews)
      for (var [key, value] of revs) {
        console.log('User: ' + key + ' review: '+ value.location)
      }
      return

      // Send review jig to user OLD CODE
      const rev = new Review(loc, this.state.body, this.state.rating, this.state.moneyButtonID)
      //const rev = loc.createReview(loc, this.state.body, this.state.rating, this.state.moneyButtonID)
      await run.sync().then(console.log("Review Created"));      
      const user = run.owner.jigs.find(x => x.constructor.name == 'UserDB')
      
      var userID = this.state.moneyButtonID
      var userPubKey = user.get(userID)
      rev.send(userPubKey.toString())
      all.set(this.state.placeID, loc.location)
      this.setState({renderMB: true})
      return false


      //show modal to user with "coupon", replace the string below with the location name
      this.showModal("Kevin's Place Name")
    }

    //if you want to not use a location name then change the string below
    showModal(placeName) {
      alert("Congratulations, you just earned a coupon to " + placeName);
      //document.getElementById("succesModal").modal();
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
 
    handleStatusUpdate(status) {
      console.log(status)
    }
    render() {
        return (
          <div>
            <div>
              {this.renderSubmissionModal()}
            </div>           
	    <form onSubmit={this.handleSubmit} onChange={this.handleFormChange}>
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
                                // Optional options
                                // https://developers.google.com/maps/documentation/javascript/reference?hl=fr#AutocompletionRequest
                            }}
                            // Optional props
                            onNoResult={this.handleNoResult}
                            onSelectSuggest={this.handleSelectSuggest}
                            onStatusUpdate={this.handleStatusUpdate}
                            textNoResults='Did not find any matching locations' // null or  if you want to disable the no results item
                            customRender={prediction => (
                              <div className="customWrapper">
                                {prediction
                                  ? prediction.description
                                  : "Did not find any matching locations"}
                              </div>
                            )}
                        >
                            <input className="form-control"
                                type='text'
                                autoComplete='off'
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
              {this.renderSubmitButton()}
            </form>
            {this.renderPlaceMap()}
          </div>
        );
    }
}


