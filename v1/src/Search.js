import React from 'react';
import {GetMBUser} from './MB';
import {Jumbotron} from 'react-bootstrap'
import GoogleMapLoader from 'react-google-maps-loader'
import GooglePlacesSuggest from 'react-google-places-suggest'
import ReviewTable from './ReviewTable.js';
 
const UnwriterAPIKey = process.env.REACT_APP_UNWRITERAPIKEY
const MY_API_KEY = process.env.REACT_APP_GOOGLE_API_KEY

export default class Search extends React.Component {
    constructor(props) {
      super(props);
      this.handleSelectSuggest = this.handleSelectSuggest.bind(this)
      this.handleInputChange = this.handleInputChange.bind(this)
      this.state = {
        search: '',
        placeID: '',
        placeDescription: '',
        address: '',
        moneyButtonID: '',
        moneyButtonName: '',
        locationSelected: false,
      };
    }
    componentDidMount() {
      GetMBUser().then(r=> {
        this.setState({moneyButtonID: r.id, moneyButtonName: r.name})
      })
    }

    handleInputChange(e) {
        this.setState({search: e.target.value, address: e.target.value, placeDescription: e.target.value})
    }
 
    handleSelectSuggest(geocodedPrediction, originalPrediction) {
        console.log(geocodedPrediction, originalPrediction) // eslint-disable-line
        console.log(originalPrediction.description)
        this.setState({search: '', address: geocodedPrediction.formatted_address, placeID: geocodedPrediction.place_id, placeDescription: originalPrediction.description, locationSelected: true})
    }
    
    handleNoResult() {
        console.log('No results for ', this.state.search)
    }
 
    handleStatusUpdate(status) {
        console.log(status)
    }
    renderReviewTable() {
      if (this.state.locationSelected) {
        return <ReviewTable reviews={getReviews(this.state.placeID)}/>
      }
      return null
    }
    render() {
        return (
          <Jumbotron>
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
                       textNoResults='My custom no results text' // null or  if you want to disable the no results item
                       customRender={prediction => (
                         <div className="customWrapper">
                           {prediction
                             ? prediction.description
                             : "My custom no results text"}
                         </div>
                       )}
                     >
                     <input
                        type='text'
                        value={this.state.placeDescription}
                        placeholder='Search a location'
                        onChange={this.handleInputChange}
                     />
                   </GooglePlacesSuggest>
                 )
               }
             />
             {this.renderReviewTable()}
          </Jumbotron>
        );
    }
}

function getReviews(placeID) {
  var query = {
    "v": 3,
    "q": {
      "find": {
        "out.s1": "tr-hack",
        "out.h2": "808a",
        "out.s9": placeID.toString()
      },
      "project": {
        "out.h2": 1,
        "out.s3": 1,
        "out.s4": 1,
        "out.s5": 1,
        "out.s6": 1,
        "out.s7": 1,
        "out.s8": 1,
        "out.s9": 1
      }
    },
    "r": {
      "f": "[ .[] | {type: .out[0].s3, name: .out[0].s4, reviewBody: .out[0].s5, rating: .out[0].s6, code: .out[0].h2, id: .out[0].s7, mbName: .out[0].s8, placeID: .out[0].s9} ]"
    }
  }
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
      console.log(r)
      var list = []
      var j = 0
      var displayNumber = r.c.length
      //var displayNumber = 5
        for (var i=0; i< displayNumber; i ++) {
            var rev = r.c[i]
            if (rev.rating == null) {
                continue
            }
            var b = {type: rev.type, locationName: rev.name, reviewBody: rev.reviewBody, rating: rev.rating, id: rev.id, mbName: rev.mbName, placeID: rev.placeID}
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
            b = {type: rev.type, locationName: rev.name, reviewBody: rev.reviewBody, rating: rev.rating, id: rev.id, mbName: rev.mbName, placeID: rev.placeID}
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

