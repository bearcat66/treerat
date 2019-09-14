import React from 'react';
import ReviewForm from './ReviewForm'
import {Button} from 'react-bootstrap'
import {Link} from 'react-router-dom'
import {GetMBToken} from './MB.js'
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
    if (this.props.user == '') {
      return (
        <div className="container-fluid text-center">
          <h4>Login to submit a review</h4>
          <Button variant='primary' size='lg' onClick={GetMBToken}>Login</Button>
        </div>
      )
    }
    if (this.props.tokens == null || this.props.tokens.reviews === 0) {
      return (
        <div className="container-fluid text-center">
          <h4>Please purchase more review credits before submitting a review</h4>
          <Link to='/purchase'><Button variant='primary' size='lg'>Purchase Credits</Button></Link>
        </div>
      )
    }
    return (
      <ReviewForm user={this.props.user} navigateTo={this.props.navigateTo} loadNotifications={this.props.loadNotifications} selectedPlace={this.state.place}/>
    )
  }
  render() {
    return (
      <div className="jumbotron jumbotron-transparent-25">
        <div className="container-fluid text-center">
          <h3 style={{color: '#1a6bbe',  fontFamily: 'arial', fontWeight: '600'}}>Submit a New Review</h3>
          <hr/>
        </div>
        <div style={{maxWidth: '900px', marginLeft: 'auto', marginRight: 'auto'}}>
          {this.renderReviewForm()}
        </div>
      </div>
    );
  }
}

export default withRouter(Submit);
