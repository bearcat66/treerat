import React from 'react';
import ReviewTable from './ReviewTable.js';
import {GetMBUser, IsLoggedIn} from './MB';
import {ButtonGroup, ToggleButton, Jumbotron} from 'react-bootstrap';
import './App.css';
import GoogleMap from 'google-map-react';
import {geolocated} from 'react-geolocated';
import Place from './Place';
 
const MY_API_KEY = process.env.REACT_APP_GOOGLE_API_KEY
const UnwriterAPIKey = process.env.REACT_APP_UNWRITERAPIKEY

const query = {
  "v": 3,
  "q": {
    "find": {
      "out.s1": "tr-hack",
      "out.h2": "808a"
    },
    "project": {
      "out.h2": 1,
      "out.s3": 1,
      "out.s4": 1,
      "out.s5": 1,
      "out.s6": 1,
      "out.s7": 1,
      "out.s8": 1,
      "out.s9": 1,
      "out.s10": 1
    }
  },
  "r": {
    "f": "[ .[] | {type: .out[0].s3, name: .out[0].s4, reviewBody: .out[0].s5, rating: .out[0].s6, code: .out[0].h2, id: .out[0].s7, mbName: .out[0].s8, placeID: .out[0].s9, coords: .out[0].s10} ]"
  }
}

export class Reviews extends React.Component {
  constructor(props) {
    super(props)
    this.buttonToggle = this.buttonToggle.bind(this)
    this.state = {
      userID: '',
      showMap: true,
      showAllReviews: false,
      showUserReviews: false,
      loggedIn: false,
      places: []
    }
  }
  componentDidMount() {
    GetMBUser().then(r=>{
      this.setState({userID: r.id})
    })
    IsLoggedIn().then(r=>{
      this.setState({loggedIn: r})
    })
    getAllReviews().then(r => {
      var placeList = []
      var j = 0
      for (var i=0; i<r.length; i++) {
        var rev = r[i]
        if (rev.coords === null) {
          continue
        }
        placeList[j] = rev
        j++
      }
      this.setState({places: placeList})
    })
  }
  renderReviewTable() {
    if (this.state.showMap) {
      return null
    }
    if (this.state.showUserReviews) {
      if (this.state.userID === '') {
        return null
      }
      return (
        <ReviewTable
          reviews={getUserReviews(this.state.userID)}
        />
      )
    }
    return (
      <ReviewTable
        reviews={getAllReviews()}
      />
    )
  }
  renderPlaces() {
    return this.state.places
  }
    /*renderPlaces() {
    return this.state.places.map((place, index) => {
      if (place.coords === null) {
        return null
      }
      console.log('render: ' + place.coords)
      return <Place lat={place.coords.lat} lng={place.coords.lng} name={place.locationName}/>
    })
  }*/
  renderMap() {
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
      var c = JSON.parse(revs[i].coords)
      places[i] = <Place lat={c.lat} lng={c.lng} name={revs[i].locationName} key={i}/>
    }
    return (
      <div className="container text-center" style={{ height: '50vh', width: '50%'}}>
        <GoogleMap
          bootstrapURLKeys={{key: MY_API_KEY}}
          defaultCenter={center}
          defaultZoom={zoom}
          hoverDistace={40} >
          {places}
        </GoogleMap>
      </div>
    )
  }
  buttonToggle(event) {
    if (event.target.value === 'user') {
      this.setState({showMap: false})
      this.setState({showUserReviews: true})
      this.setState({showAllReviews: false})
    } else if (event.target.value === 'all') {
      this.setState({showMap: false})
      this.setState({showUserReviews: false})
      this.setState({showAllReviews: true})
    } else if (event.target.value === 'map') {
      this.setState({showMap: true})
      this.setState({showUserReviews: false})
      this.setState({showAllReviews: false})
    }
  }
  renderUserFilterButton() {
    if (!this.state.loggedIn) {
      return (
        null
      )
    }
    return (
      <div className="d-flex flex-column">
        <ButtonGroup toggle className="mt-3">
          <ToggleButton onClick={this.buttonToggle} type="radio" name="filter" defaultChecked value="map">Map View</ToggleButton>
          <ToggleButton onClick={this.buttonToggle} type="radio" name="filter" value="user">My Reviews</ToggleButton>
          <ToggleButton onClick={this.buttonToggle} type="radio" name="filter" value="all">All Reviews</ToggleButton>
        </ButtonGroup>
      </div>

      //<button onClick={this.buttonToggle} type="button" class="btn btn-primary" data-toggle="button" aria-pressed="false" autoComplete="off">My Reviews</button>
    )
  }
  render () {
    return (
    <Jumbotron>
      <div>
        <div>
          {this.renderUserFilterButton()}
          {this.renderReviewTable()}
          {this.renderMap()}
        </div>
      </div>
    </Jumbotron>
    );
  }
}

function getUserReviews(userId) {
  var userQuery = {
    "v": 3,
    "q": {
      "find": {
        "out.s1": "tr-hack",
        "out.h2": "808a",
        "out.s7": userId.toString()
      },
      "project": {
        "out.h2": 1,
        "out.s3": 1,
        "out.s4": 1,
        "out.s5": 1,
        "out.s6": 1,
        "out.s7": 1,
        "out.s8": 1,
        "out.s9": 1,
        "out.s10": 1,
      }
    },
    "r": {
      "f": "[ .[] | {type: .out[0].s3, name: .out[0].s4, reviewBody: .out[0].s5, rating: .out[0].s6, code: .out[0].h2, id: .out[0].s7, mbName: .out[0].s8, placeID: .out[0].s9, coords: .out[0].s10} ]"
    }
  }
  var suf = btoa(JSON.stringify(userQuery))
  var url = "https://genesis.bitdb.network/q/1FnauZ9aUH2Bex6JzdcV4eNX7oLSSEbxtN/"+suf
  //var url = "https://genesis.bitdb.network/q/1FnauZ9aUH2Bex6JzdcV4eNX7oLSSEbxtN/ewogICJ2IjogMywKICAicSI6IHsKICAgICJmaW5kIjogeyJvdXQuczEiOiAicmV2aWV3IiwgIm91dC5oMiI6ICI4MDhhIn0sCiAgICAicHJvamVjdCI6IHsKICAgICAgIm91dC5oMiI6IDEsCiAgICAgICJvdXQuczMiOiAxLAogICAgICAib3V0LnM0IjogMSwKICAgICAgIm91dC5zNSI6IDEsCiAgICAgICJvdXQuczYiOiAxLAogICAgICAib3V0LnM3IjogMSwKICAgICAgIm91dC5zOCI6IDEKICAgIH0KICB9LAogICJyIjogewogICAgImYiOiAiWyAuW10gfCB7dHlwZTogLm91dFswXS5zMywgbmFtZTogLm91dFswXS5zNCwgcmV2aWV3Qm9keTogLm91dFswXS5zNSwgcmF0aW5nOiAub3V0WzBdLnM2LCBjb2RlOiAub3V0WzBdLmgyLCBpZDogLm91dFswXS5zNywgbWJOYW1lOiAub3V0WzBdLnM4fSBdIgogIH0KfQ=="
    /*var source = new EventSource("https://genesis.bitdb.network/s/1FnauZ9aUH2Bex6JzdcV4eNX7oLSSEbxtN/ewogICJ2IjogMywKICAicSI6IHsKICAgICJmaW5kIjoge30sCiAgICAibGltaXQiOiAxMAogIH0KfQ==")
    source.onmessage = function(event) {
      var data = JSON.parse(event.data)
      console.log(data.data[0])

    }*/
    var header = {
      headers: { key: UnwriterAPIKey}
    };
    var l = fetch(url, header).then(function(r) {
      return r.json()
    }).then(function(r) {
      var list = []
      var j = 0
      var displayNumber = r.c.length
      //var displayNumber = 5
        for (var i=0; i< displayNumber; i ++) {
            var rev = r.c[i]
            if (rev.rating == null) {
                continue
            }
            var b = {type: rev.type, locationName: rev.name, reviewBody: rev.reviewBody, rating: rev.rating, id: rev.id, mbName: rev.mbName, placeID: rev.placeID, coords: rev.coords}
            if (b == null) {
                continue
            }
            list[j] = b
            j++
        }
      displayNumber = r.u.length
      //displayNumber = 0
        for (i=0; i< displayNumber; i ++) {
            rev = r.u[i]
            if (rev.rating == null) {
                continue
            }
            b = {type: rev.type, locationName: rev.name, reviewBody: rev.reviewBody, rating: rev.rating, id: rev.id, mbName: rev.mbName, placeID: rev.placeID, coords: rev.coords}
            if (b == null) {
                continue
            }
            list[j] = b
            j++
        }
        return list
    })
    return l
}

function getAllReviews() {
  var suf = btoa(JSON.stringify(query))
  var url = "https://genesis.bitdb.network/q/1FnauZ9aUH2Bex6JzdcV4eNX7oLSSEbxtN/"+suf
  //var url = "https://genesis.bitdb.network/q/1FnauZ9aUH2Bex6JzdcV4eNX7oLSSEbxtN/ewogICJ2IjogMywKICAicSI6IHsKICAgICJmaW5kIjogeyJvdXQuczEiOiAicmV2aWV3IiwgIm91dC5oMiI6ICI4MDhhIn0sCiAgICAicHJvamVjdCI6IHsKICAgICAgIm91dC5oMiI6IDEsCiAgICAgICJvdXQuczMiOiAxLAogICAgICAib3V0LnM0IjogMSwKICAgICAgIm91dC5zNSI6IDEsCiAgICAgICJvdXQuczYiOiAxLAogICAgICAib3V0LnM3IjogMSwKICAgICAgIm91dC5zOCI6IDEKICAgIH0KICB9LAogICJyIjogewogICAgImYiOiAiWyAuW10gfCB7dHlwZTogLm91dFswXS5zMywgbmFtZTogLm91dFswXS5zNCwgcmV2aWV3Qm9keTogLm91dFswXS5zNSwgcmF0aW5nOiAub3V0WzBdLnM2LCBjb2RlOiAub3V0WzBdLmgyLCBpZDogLm91dFswXS5zNywgbWJOYW1lOiAub3V0WzBdLnM4fSBdIgogIH0KfQ=="
    /*var source = new EventSource("https://genesis.bitdb.network/s/1FnauZ9aUH2Bex6JzdcV4eNX7oLSSEbxtN/ewogICJ2IjogMywKICAicSI6IHsKICAgICJmaW5kIjoge30sCiAgICAibGltaXQiOiAxMAogIH0KfQ==")
    source.onmessage = function(event) {
      var data = JSON.parse(event.data)
      console.log(data.data[0])

    }*/
    var header = {
      headers: { key: UnwriterAPIKey}
    };
    var l = fetch(url, header).then(function(r) {
      return r.json()
    }).then(function(r) {
        var list = []
      var j = 0
      var displayNumber = r.c.length
      //var displayNumber = 5
        for (var i=0; i< displayNumber; i ++) {
            var rev = r.c[i]
            if (rev.rating == null) {
                continue
            }
            var b = {type: rev.type, locationName: rev.name, reviewBody: rev.reviewBody, rating: rev.rating, id: rev.id, mbName: rev.mbName, placeID: rev.placeID, coords: rev.coords}
            if (b == null) {
                continue
            }
            list[j] = b
            j++
        }
      displayNumber = r.u.length
      //displayNumber = 0
        for (i=0; i< displayNumber; i ++) {
            rev = r.u[i]
            if (rev.rating == null) {
                continue
            }
            b = {type: rev.type, locationName: rev.name, reviewBody: rev.reviewBody, rating: rev.rating, id: rev.id, mbName: rev.mbName, placeID: rev.placeID, coords: rev.coords}
            if (b == null) {
                continue
            }
            list[j] = b
            j++
        }
        return list
    })
    return l
}

export default geolocated({
  positionOptions: {
      enableHighAccuracy: false,
    },
  userDecisionTimeout: 5000,
})(Reviews);
