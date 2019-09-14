import React from 'react';
import GoogleMap from 'google-map-react';
import Place from './Place';
import ReviewTable from './ReviewTable';
import {Button} from 'react-bootstrap';
const MY_API_KEY = process.env.REACT_APP_GOOGLE_API_KEY
export default class Location extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      placeID: this.props.id,
      loadingLocation: true
    }
    this.loadLocation(this.props.id)
  }
  async loadLocation(placeID) {
    var res = await fetch('/api/locations/'+placeID)
    if (res.status !== 200) {
      this.setState({loadingLocation:false})
      return
    }
    var out = await res.json()
    this.setState({location: out, loadingLocation: false})
  }
  renderSpinner() {
    if (!this.state.loadingLocation) {
      return null
    }
    return (
      <div className="container text-center">
        <p>Loading Location Information...</p>
        <div className="spinner-grow"/>
      </div>
    )
  }
  renderLocationInfo() {
    if (this.state.location == null) {
      return null
    }
    var zoom = 14
    var loc = this.state.location
    var coords = {lat: loc.lat, lng: loc.lng}
    return (
      <div class="card" styles="width: 18rem;">
        <div class="card-body">
          <h3 class="card-title">{loc.name}</h3>
          <hr/>
          <div className="container-fluid text-center" style={{ height: '30vh', width: '100%'}}>
            <GoogleMap
              bootstrapURLKeys={{key: MY_API_KEY}}
              center={coords}
              defaultZoom={zoom} >
              <Place lat={coords.lat} lng={coords.lng} name={loc.name}/>
            </GoogleMap>
          </div>
          <hr/>
          <h6 class="card-subtitle mb-2 text-right">Total Reviews: {loc.reviews.length}</h6>
          <h6 class="card-subtitle mb-2 text-right">Average Rating: {loc.average}</h6>
          <Button href={loc.googleURL} target='_blank'>View on Google Maps</Button>
          <hr/>
          <h3 class="card-title">Reviews</h3>
          <ReviewTable
            reviews={loc.reviews}
            userID={this.props.user}
            tokens={this.props.tokens}
            loadNotifications={this.props.loadNotifications}
            reviewsOnly={true}
          />
        </div>
      </div>
    )
  }
  render() {
    return (
      <div className="jumbotron jumbotron-transparent-25">
        <div className="container-fluid text-center">
          <h3>Location</h3>
          <hr/>
          {this.renderSpinner()}
          {this.renderLocationInfo()}
        </div>
      </div>
    );
  }
}
