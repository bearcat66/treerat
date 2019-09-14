import React from 'react';
import {GetMBUser} from './MB';
import {Jumbotron, Button, Modal} from 'react-bootstrap'
import GoogleMapLoader from 'react-google-maps-loader'
import GooglePlacesSuggest from 'react-google-places-suggest'
import ReviewTable from './ReviewTable.js';

//const UnwriterAPIKey = process.env.REACT_APP_UNWRITERAPIKEY
const MY_API_KEY = process.env.REACT_APP_GOOGLE_API_KEY

//const AllLocations = window.Jigs.AllLocations

//const Run = window.Run
const run = window.Jigs.RunInstance


export default class Search extends React.Component {
  constructor(props) {
    super(props);
    this.handleSelectSuggest = this.handleSelectSuggest.bind(this)
    this.handleInputChange = this.handleInputChange.bind(this)
    this.handleClaimSubmit = this.handleClaimSubmit.bind(this)
    this.transferLocation = this.transferLocation.bind(this)
    this.state = {
      search: '',
      placeID: '',
      reviewList: [],
      placeDescription: '',
      address: '',
      moneyButtonID: '',
      moneyButtonName: '',
      locationSelected: false,
      renderModal: false,
    };
  }
  componentDidMount() {
    GetMBUser().then(r=> {
      this.setState({moneyButtonID: r.id, moneyButtonName: r.name, paymail: r.profile.primaryPaymail})
    })
  }

  handleInputChange(e) {
    this.setState({search: e.target.value, address: e.target.value, placeDescription: e.target.value, locationSelected: false})
  }

  handleSelectSuggest(geocodedPrediction, originalPrediction) {
    this.setState({search: '', address: geocodedPrediction.formatted_address, placeID: geocodedPrediction.place_id, placeDescription: originalPrediction.description, locationSelected: true})
  }
  
  handleNoResult() {
    console.log('No results for ', this.state.search)
    this.setState({locationSelected: false})
  }

  handleStatusUpdate(status) {
  }
  renderReviewTable() {
    if (this.state.locationSelected) {
      return <ReviewTable reviews={getReviews(this.state.placeID)} userID={this.state.paymail}/>
    }
    return null
  }
  handleClaimSubmit() {
    this.setState({renderModal: true})
  }
  renderClaimBusinessButton() {
    return null
    if (this.state.locationSelected === false || this.state.moneyButtonID === '') {
      return null
    }
    return (
      <div className="container text-center">
        <Button onClick={this.handleClaimSubmit} type="submit" variant="primary" size="lg">
          Claim Location
        </Button>
      </div>
    )
  }
  async transferLocation() {
    if (this.state.placeID === '') {
      console.error('No place selected')
      return
    }
    fetch('/api/locations/'+this.state.placeID+'/transfer', {
      headers: {'Content-Type': 'application/json'},
      method: 'post',
      body: JSON.stringify({
        businessID: this.state.paymail
      })
    }).then(res => res.json()).then(rev =>  {
      this.setState({renderSuccessModal: true})
    })
  }
  renderClaimModal() {
    if (!this.state.renderModal) {
      return null
    }
    return (
      <Modal.Dialog>
        <Modal.Header closeButton>
          <Modal.Title>This is your location?</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <p>Please be certain you are the business owner of this location. We will KYC you to ensure users are not squatting locations.</p>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary">Close</Button>
          <Button onClick={this.transferLocation} variant="primary">Claim Location</Button>
        </Modal.Footer>
      </Modal.Dialog>
    )
  }
  
  render() {
    return (
      <div className="jumbotron jumbotron-transparent-25">
        <div className="container-fluid text-center">
          <h3>Search For A Location</h3>
          <hr/>
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
                 onChange={this.handleInputChange}
               />
               </GooglePlacesSuggest>
             )
           }
         />
         {this.renderClaimBusinessButton()}
         {this.renderClaimModal()}
         {this.renderReviewTable()}
       </div>
      </div>
    );
  }
}


//this function needs to be updated to account for jigs
function getReviews(placeID) {
  return fetch('/api/locations/'+placeID).then(res=> {
    if (res.status === 404) {
      throw 'Location not found'
    }
    return res.json()
  }).then(r => {
    return r.reviews
  })
}

async function loadJigs(placeID) {
  run.activate()
  var locs = run.owner.jigs.find(x => x.constructor.name === 'AllLocations')
  if (locs == null) {
    return null
  }
  var loc = locs.get(placeID)
  if (loc == null) {
    console.log("No location found")
    return null
  }
  console.log('location found: ' + loc)
  var jig = await run.load(loc)
  await jig.sync()
  var revs = Object.entries(jig.reviews)
  var reviewList = []
  for (var [key, value] of revs) {
    console.log('User: ' + key + ' review: ' + value.location)
    var rev = await run.load(value.location)
    console.log('Loading review...')
    reviewList.push({locationName: jig.name, rating: rev.rating, reviewBody: rev.body, mbName: rev.user})
  }
  return reviewList
}
