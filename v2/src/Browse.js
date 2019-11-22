import React from 'react';
import ReviewTable from './ReviewTable.js';
import './App.css';
import GoogleMap from 'google-map-react';
import {geolocated} from 'react-geolocated';
import Place from './Place';
import {Button} from 'react-bootstrap';
import {Link} from 'react-router-dom';
 
const MY_API_KEY = process.env.REACT_APP_GOOGLE_API_KEY

export class Browse extends React.Component {
  constructor(props) {
    super(props)
    this.handleMapClick = this.handleMapClick.bind(this)
    this.handleUpvote = this.handleUpvote.bind(this)
    this.state = {
      average: 0,
      loadingLocations: true,
      showMap: true,
      loggedIn: false,
      isLoading: false,
      placeID: '',
      placeName: '',
      coords: {},
      address: '',
      reviews: [],
      places: []
    }
  }
  componentDidMount() {
    loadPlaces().then(r=>{
      this.setState({places: r, loadingLocations: false})
    })
  }
  handleMapClick(event) {
    console.log(this.state.places[event])
    this.setState({
      placeID: this.state.places[event].id,
      isLoading: true,
      placeName: this.state.places[event].locationName,
      coords: this.state.places[event].coords
    })
    loadPlace(this.state.places[event].id).then(r=>{
      this.setState({reviews: r.reviews, isLoading: false, average: r.average})
    })
  }
  handleUpvote() {
    this.setState({placeID: this.state.placeID})
    this.props.loadTokens()
  }
  renderReviewTable() {
    if (this.state.placeID === '') {
      return null
    }
    if (this.state.isLoading) {
      return (
        <div className="container text-center">
          <h5>Loading...</h5>
          <div className="spinner-grow"/>
        </div>
      )
    }
    return (
      <div className='container-fluid'>
        <hr/>
        <Link
          to={{
            pathname: '/submit',
            state: {
              placeID: this.state.placeID,
              placeDescription: this.state.placeName,
              coords: this.state.coords
            }
          }}>
          <Button variant="primary" size="lg">Review this location!</Button>
        </Link>
        <ReviewTable
          reviews={this.state.reviews}
          userID={this.props.user}
          handleUpvote={this.handleUpvote}
          navigateTo={this.props.navigateTo}
          averageRating={this.state.average}
          tokens={this.props.tokens}
          loadTokens={this.props.loadTokens}
        />
      </div>
    )
  }
  renderLocationInfo() {
    if (this.state.placeID === '') {
      return null
    }
    return (
      <div>
        <hr/>
        <h3>{this.state.placeName}</h3>
      </div>
    )
  }
  renderMap() {
    if (this.state.loadingLocations) {
      return (
        <div className='container text-center'>
          <p>Loading Map...</p>
          <div className='spinner-grow'/>
        </div>
      )
    }
    var center ={lat: 35.7, lng: -78.7}
    var zoom = 4
    if (this.props.coords !== null) {
      center = {lat: this.props.coords.latitude, lng: this.props.coords.longitude}
      zoom = 14
    }
    if (!this.state.showMap) {
      return null
    }
    var revs = this.state.places
    var places = []
    for (var i=0;i<revs.length;i++) {
      var c = revs[i].coords
      places[i] = <Place lat={c.lat} lng={c.lng} name={revs[i].locationName} key={i}/>
    }
    return (
      <div className="container-fluid text-center" style={{ height: '50vh', width: '100%'}}>
        <GoogleMap
          bootstrapURLKeys={{key: MY_API_KEY}}
          defaultCenter={center}
          defaultZoom={zoom}
          onChildClick={this.handleMapClick}
          hoverDistance={40} >
          {places}
        </GoogleMap>
      </div>
    )
  }
  render () {
    return (
      <div className="jumbotron jumbotron-transparent-25">
        <div className="container-fluid text-center">
          <h3>Browse All Locations</h3>
          <hr/>
          {this.renderMap()}
          {this.renderLocationInfo()}
          {this.renderReviewTable()}
        </div>
      </div>
    );
  }
}

async function loadPlace(id) {
  return fetch('/api/locations/'+id).then(res=>res.json()).then(l => {
    return l
  })
}

async function loadPlaces() {
  return fetch('/api/locations').then(res=>res.json()).then(l => {
    return l
  })
}

export default geolocated({
  positionOptions: {
      enableHighAccuracy: false,
    },
  userDecisionTimeout: 5000,
})(Browse);
