import React from 'react';
import ReviewForm from './ReviewForm'
import {Button} from 'react-bootstrap'
import {Link} from 'react-router-dom'
import { withRouter } from 'react-router'

class Submit extends React.Component {
  constructor(props) {
    super(props);
    var placeID = ''
    var address = ''
    var coords = {}
    var placeDescription = ''
    if (props.location != null && props.location.state != null) {
      placeID = props.location.state.placeID
      address = props.location.state.address
      coords = props.location.state.coords
      placeDescription = props.location.state.placeDescription
    }
    this.state = {
      place: {
        placeID: placeID,
        address: address,
        coords: coords,
        placeDescription: placeDescription
      }
    }
  }
  renderReviewForm() {
    if (this.props.tokens == null || this.props.tokens.reviews === 0) {
      return (
        <div className="container-fluid text-center">
          <h4>Please purchase more review credits before submitting a review</h4>
          <Link to='/purchase'><Button variant='primary' size='lg'>Purchase Credits</Button></Link>
        </div>
      )
    }
    console.log(this.state.place)
    return (
      <ReviewForm user={this.props.user} navigateTo={this.props.navigateTo} loadTokens={this.props.loadTokens} selectedPlace={this.state.place}/>
    )
  }
  render() {
    return (
      <div className="jumbotron jumbotron-transparent-25">
        <div className="container-fluid text-center">
          <h3>Submit a New Review</h3>
          <hr/>
        </div>
        {this.renderReviewForm()}
      </div>
    );
  }
}

export default withRouter(Submit);
