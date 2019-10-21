import React from 'react';
import ReviewTable from './ReviewTable.js';
import {Jumbotron} from 'react-bootstrap';
import './App.css';
import GoogleMap from 'google-map-react';
import {geolocated} from 'react-geolocated';
import Place from './Place';
 
const MY_API_KEY = process.env.REACT_APP_GOOGLE_API_KEY
const run = window.Jigs.RunInstance

export class Browse extends React.Component {
  constructor(props) {
    super(props)
    this.handleMapClick = this.handleMapClick.bind(this)
    this.handleUpvote = this.handleUpvote.bind(this)
    this.state = {
      loadingLocations: true,
      showMap: true,
      loggedIn: false,
      isLoading: false,
      placeID: '',
      placeName: '',
      reviews: [],
      places: []
    }
  }
  componentDidMount() {
    this.getAllPlaces().then(r=>{
      this.setState({places: r, loadingLocations: false})
    })
  }
  handleMapClick(event) {
    this.setState({placeID: this.state.places[event].id, isLoading: true, placeName: this.state.places[event].locationName})
    this.getPlace(this.state.places[event].id).then(r=>{
      this.setState({reviews: r.reviews, isLoading: false})
    })
    console.log(this.state.reviews)
  }
  handleUpvote() {
    this.setState({placeID: this.state.placeID})
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
        <h5>Reviews for {this.state.placeName}</h5>
        <ReviewTable
          reviews={this.getPlace(this.state.placeID)}
          userID={this.props.user}
          handleUpvote={this.handleUpvote}
        />
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
      console.log(this.props.coords.latitude)
    }
    if (!this.state.showMap) {
      return null
    }
    var revs = this.state.places
    var places = []
    for (var i=0;i<revs.length;i++) {
      console.log(revs[i].coords)
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
  getPlace(id) {
    return loadPlace(id).then(r => {
      return r.reviews
    })
  }
  getAllPlaces() {
    return loadPlaces().then(r => {
      return r
    })
  }
  render () {
    return (
      <div className="jumbotron jumbotron-transparent-25">
        <div className="container-fluid text-center">
          <h3>Browse All Locations</h3>
          <hr/>
          {this.renderMap()}
          {this.renderReviewTable()}
        </div>
      </div>
    );
  }
}

async function loadPlace(id) {
  return fetch('/api/locations/'+id).then(res=>res.json()).then(l => {
    console.log(l)
    return l
  })
}

async function loadPlaces() {
  return fetch('/api/locations').then(res=>res.json()).then(l => {
    console.log(l)
    return l
  })
}

export default geolocated({
  positionOptions: {
      enableHighAccuracy: false,
    },
  userDecisionTimeout: 5000,
})(Browse);
