import React from 'react';
import ReviewTable from './ReviewTable';
import {Button} from 'react-bootstrap';
import GoogleMap from 'google-map-react';
import Place from './Place';
const MY_API_KEY = process.env.REACT_APP_GOOGLE_API_KEY

export default class Transaction extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      id: this.props.id,
      renderSpinner: true,
      jig: {}
    }
    this.loadTx(this.props.id)
  }
  async loadTx(id) {
    var res = await fetch('/api/transaction/'+id)
    var out = await res.json()
    this.setState({jigs: out.transaction, renderSpinner: false})
  }
  renderExplorerButton() {
    if (this.state.jigs == null) {
      return null
    }
    var link = "https://whatsonchain.com/tx/" + this.state.id
    return (
      <div>
        <hr/>
        <Button href={link} target="_blank">View in explorer</Button>
      </div>
    )
  }
  renderJigs() {
    if (this.state.jigs == null) {
      return null
    }

    return this.state.jigs.map((jig, index) => {
      switch(jig.type) {
        case 'Location':
        case 'LocationV01':
          var zoom = 14
          var coords = {lat: jig.lat, lng: jig.lng}
          return (
            <div class="card" styles="width: 18rem;">
              <div class="card-body">
                <h3 class="card-title">{jig.type}</h3>
                <hr/>
                <h6 class="card-subtitle mb-2 text-center">{jig.name}</h6>
                <div className="container-fluid text-center" style={{ height: '30vh', width: '100%'}}>
                  <GoogleMap
                    bootstrapURLKeys={{key: MY_API_KEY}}
                    center={coords}
                    defaultZoom={zoom} >
                    <Place lat={coords.lat} lng={coords.lng} name={jig.name}/>
                  </GoogleMap>
                </div>
                <hr/>
                <h6 class="card-subtitle mb-2 text-right">Total Reviews: {jig.reviewCount}</h6>
              </div>
            </div>
          )

        case 'Review':
        case 'ReviewV01':
          var reviewList = []
          reviewList.push(jig)
          return (
            <div class="card" styles="width: 18rem;">
              <div class="card-body">
                <h3 class="card-title">{jig.type}</h3>
                <hr/>
                <ReviewTable
                  reviews={reviewList}
                  userID={this.props.user}
                  tokens={this.props.tokens}
                  loadNotifications={this.props.loadNotifications}
                  reviewsOnly={true}
                />
              </div>
            </div>
          )

        default:
          return null
      }
    })
  }

  renderSpinner() {
    if (this.state.renderSpinner) {
      return (
        <div className="container-fluid text-center">
          <h2>Loading transaction {this.state.id}...</h2>
          <div className="spinner-grow">
          </div>
        </div>
      )
    }
  }
  renderJigSnippet() {
    if (this.state.renderSpinner) {
      return null
    }
    if (this.state.jigs == null) {
      return (
        <h1>No True Review transaction data found</h1>
      )
    }
    return (
      <div>
        <h4>This transaction updated/created the following jigs:</h4>
        {this.renderJigs()}
        {this.renderExplorerButton()}
      </div>
    )
  }

  render() {
    return (
      <div className="jumbotron jumbotron-transparent-25">
        <div className="container-fluid text-center">
          {this.renderSpinner()}
          {this.renderJigSnippet()}
        </div>
      </div>
    )
  }
}
