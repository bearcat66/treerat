import React from 'react';
import ReviewForm from './ReviewForm'
import {Button} from 'react-bootstrap'
import {Link} from 'react-router-dom'

export default class Submit extends React.Component {
  renderReviewForm() {
    if (this.props.tokens == null || this.props.tokens.reviews === 0) {
      return (
        <div className="container-fluid text-center">
          <h4>Please purchase more review credits before submitting a review</h4>
          <Link to='/purchase'><Button variant='primary' size='lg'>Purchase Credits</Button></Link>
        </div>
      )
    }
    return (
      <ReviewForm user={this.props.user} navigateTo={this.props.navigateTo} loadTokens={this.props.loadTokens}/>
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
