import React from 'react';
import {GetMBUser} from './MB';
import MoneyButton from '@moneybutton/react-money-button'
import {Modal, Form, Button} from 'react-bootstrap'
import GoogleMap from 'google-map-react'
import Place from './Place';
import GoogleMapLoader from 'react-google-maps-loader'
import GooglePlacesSuggest from 'react-google-places-suggest'
 
const MY_API_KEY = process.env.REACT_APP_GOOGLE_API_KEY
let bsv = require('bsv');

export default class ReviewForm extends React.Component {
    constructor(props) {
      super(props);
      this.handleSubmit = this.handleSubmit.bind(this)
      this.handleSelectSuggest = this.handleSelectSuggest.bind(this)
      this.handleNoResult = this.handleNoResult.bind(this)
      this.handleStatusUpdatStatusUpdatee = this.handleStatusUpdate.bind(this)
      this.handleInputChange = this.handleInputChange.bind(this)
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
      };
    }
    onSubmission(payment) {
      this.setState({submitted: true, reviewTx: payment.txid})
      console.log("TX: "+ payment.txid)
    }
    closeModal() {
      this.setState({submitted: false})
    }
    renderMoneyButton() {
      if (this.state.renderMB) {
        var code = new Buffer.from('808a', 'hex')
        console.log(this.state.placeID)
        var data = bsv.Script.buildDataOut(['tr-hack', code, this.state.type, this.state.placeDescription, this.state.body, this.state.rating, this.state.moneyButtonID, this.state.moneyButtonName, this.state.placeID, JSON.stringify(this.state.coords)]).toASM()

        // User creation code. Non-standard tx
        //var userCode = new Buffer.from('808b', 'hex')
        //var userData = bsv.Script.buildDataOut(['review-dev', userCode, '1313', 'Dylan']).toASM()
        //var out = [{type: "SCRIPT", script: data, amount: "0", currency: "BSV"}, {type: "SCRIPT", script: userData, currency: "BSV", amount: "0"}]

        var out = [{type: "SCRIPT", script: data, amount: "0", currency: "BSV"}]
        return <MoneyButton outputs={out} onPayment={this.onSubmission}/>
      }
      return null
    }
    renderSubmissionModal() {
      if (!this.state.submitted) {
        return null
      }
      var url = "https://whatsonchain.com/tx/" + this.state.reviewTx
      return (
        <Modal.Dialog>
          <Modal.Header closeButton>
            <Modal.Title>Successfully Reviewed {this.state.name}!</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>Transaction ID: {this.state.reviewTx}</p>
          </Modal.Body>
          <Modal.Footer>
            <Button href={url} variant="secondary">View Transaction</Button>
            <Button href='/reviews' variant="primary">All Reviews</Button>
          </Modal.Footer>
        </Modal.Dialog>
      )
        
    }
    handleSubmit(event) {
      this.setState({
        type: event.target.reviewFormType.value,
        body: event.target.reviewFormBody.value,
        rating: event.target.reviewFormRating.value,
        renderMB: true,
      })
      event.preventDefault();
      return false
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

    handleInputChange(e) {
        this.setState({search: e.target.value, address: e.target.value, placeDescription: e.target.value})
    }
 
    handleSelectSuggest(geocodedPrediction, originalPrediction) {
      console.log('place_id: ' + geocodedPrediction.place_id)
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
      console.log("rendering map")
      var zoom = 14
      return (
        <div class="container text-center" style={{ height: '50vh', width: '50%' , justifyContent: 'center', alignItems: 'center'}}>
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
            {this.renderPlaceMap()}
            <Form onSubmit={this.handleSubmit}>
              <Form.Group controlId="reviewFormLocation">
                <Form.Label>Location to Review</Form.Label>
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
                            <Form.Control
                                type='text'
                                autoComplete='off'
                                value={this.state.placeDescription}
                                placeholder='Search a location'
                                onChange={this.handleInputChange}
                                required
                            />

                        </GooglePlacesSuggest>
                      )
                  }
                />
              </Form.Group>
              <Form.Group controlId="reviewFormType">
                <Form.Label>Location Type</Form.Label>
                <Form.Control as="select" required>
                  <option>Brewery</option>
                  <option>Restaurant</option>
                  <option>Bar</option>
                  <option>Location</option>
                </Form.Control>
              </Form.Group>
              <Form.Group controlId="reviewFormBody">
                <Form.Label>Review Body</Form.Label>
                <Form.Control as="textarea" required/>
              </Form.Group>
              <Form.Group controlId="reviewFormRating">
                <Form.Label>Rating</Form.Label>
                <Form.Control type="number" required/>
              </Form.Group>
              {this.renderSubmitButton()}
            </Form>
            <div>
              {this.renderMoneyButton()}
            </div>
          </div>
        );
    }
}
