import React from 'react';
import {GetMBUser} from './MB';
import {Jumbotron} from 'react-bootstrap'
import GoogleMapLoader from 'react-google-maps-loader'
import GooglePlacesSuggest from 'react-google-places-suggest'
import ReviewTable from './ReviewTable.js';
 
const UnwriterAPIKey = process.env.REACT_APP_UNWRITERAPIKEY
const MY_API_KEY = process.env.REACT_APP_GOOGLE_API_KEY

const AllLocations = window.Jigs.AllLocations

const Run = window.Run
const run = window.Jigs.RunInstance


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
        getReviews(this.state.placeID)
        //return <ReviewTable reviews={getReviews(this.state.placeID)}/>
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
                       }}
                       
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
             {this.renderReviewTable()}
          </Jumbotron>
        );
    }
}


//this function needs to be updated to account for jigs
function getReviews(placeID) {
  loadJigs(placeID)
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
  console.log(jig)
  await jig.sync()
  var revs = Object.entries(jig.reviews)
  console.log(revs)
  for (var [key, value] of revs) {
    console.log('User: ' + key + ' review: ' + value.location)
  }
}
