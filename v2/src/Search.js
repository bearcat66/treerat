import React from 'react';
import {Button, Modal} from 'react-bootstrap'
import GoogleMapLoader from 'react-google-maps-loader'
import GooglePlacesSuggest from 'react-google-places-suggest'
import {Link} from 'react-router-dom'
import ReviewTable from './ReviewTable.js';

//const UnwriterAPIKey = process.env.REACT_APP_UNWRITERAPIKEY
const MY_API_KEY = process.env.REACT_APP_GOOGLE_API_KEY

//const AllLocations = window.Jigs.AllLocations

//const Run = window.Run


export default class Search extends React.Component {
  constructor(props) {
    super(props);
    this.handleSelectSuggest = this.handleSelectSuggest.bind(this)
    this.handleInputChange = this.handleInputChange.bind(this)
    this.handleClaimSubmit = this.handleClaimSubmit.bind(this)
    this.transferLocation = this.transferLocation.bind(this)
    this.state = {
      search: '',
      coords: {
        lat: 1,
        lng: 1
      },
      placeID: '',
      reviewList: [],
      placeDescription: '',
      address: '',
      locationSelected: false,
      renderModal: false,
      locationDNE: false,
    };
  }
  componentDidMount() {
  }

  handleInputChange(e) {
    this.setState({search: e.target.value, address: e.target.value, placeDescription: e.target.value, locationSelected: false})
  }

  handleSelectSuggest(geocodedPrediction, originalPrediction) {
    this.setState({
      search: '',
      coords: {
        lat: geocodedPrediction.geometry.location.lat(),
        lng: geocodedPrediction.geometry.location.lng(),
      },
      address: geocodedPrediction.formatted_address,
      placeID: geocodedPrediction.place_id,
      placeDescription: originalPrediction.description,
      loadingReviews: true
    })
    getReviews(geocodedPrediction.place_id).then(r => {
      if (r == null) {
        this.setState({locationDNE: true})
        return
      }
      this.setState({reviews: r.reviews, average: r.average, locationSelected: true, locationDNE: false, loadingReviews: false})
    }).catch(e => {
      console.error(e)
      this.setState({loadingReviews: false, locationDNE: true})
    })
  }
  
  handleNoResult() {
    console.log('No results for ', this.state.search)
    this.setState({locationSelected: false})
  }

  handleStatusUpdate(status) {
  }
  renderReviewTable() {
    if (this.state.loadingReviews) {
      return (
        <div className='container text-center'>
          <hr/>
          <p>Loading location...</p>
          <div className='spinner-grow'/>
        </div>
      )
    }
    if (this.state.locationDNE) {
      return (
        <div>
          <hr/>
          <h4>No Reviews Found</h4>
          <Link
            to={{
              pathname: '/submit',
              state: {
                placeID: this.state.placeID,
                address: this.state.address,
                placeDescription: this.state.placeDescription,
                coords: this.state.coords
              }
            }}>
            <Button variant="primary" size="lg">Review this location!</Button>
          </Link>
        </div>
      )
    }
    if (this.state.locationSelected) {
      return(
        <div>
          <hr/>
          <Link
            to={{
              pathname: '/submit',
              state: {
                placeID: this.state.placeID,
                address: this.state.address,
                placeDescription: this.state.placeDescription,
                coords: this.state.coords
              }
            }}>
            <Button variant="primary" size="lg">Review this location!</Button>
          </Link>
          <ul/>
          <Link
            to={{
              pathname: '/location/'+this.state.placeID,
            }}>
            <Button variant="dark" size="lg">Open location page</Button>
          </Link>
          <ReviewTable
            navigateTo={this.props.navigateTo}
            reviews={this.state.reviews}
            userID={this.props.user}
            averageRating={this.state.average}
            tokens={this.props.tokens}
            loadNotifications={this.props.loadNotifications}
          />
        </div>
      )
    }
    return null
  }
  handleClaimSubmit() {
    this.setState({renderModal: true})
  }
  renderClaimBusinessButton() {
    // DISABLE BUTTONG
    return null
    // REMOVE THIS
    if (this.state.locationSelected === false || this.props.user === '') {
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
        businessID: this.props.user
      })
    }).then(res =>  {
      return res.json()
    }).then(rev =>  {
      this.setState({renderSuccessModal: true})
    }).catcn(e => {
      console.error(e)
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
        <div className="container-fluid text-center" style={{maxWidth: '900px', marginRight: 'auto', marginLeft: 'auto'}}>
          <h3 style={{color: '#1a6bbe',  fontFamily: 'arial', fontWeight: '600'}}>Search For A Location</h3>
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
      throw new Error('Location not found')
    }
    return res.json()
  }).then(r => {
    return r
  })
}
