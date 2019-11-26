import React, {Component} from 'react';
import {GetMBToken} from './MB';
import {Button} from 'react-bootstrap';
import {Link} from 'react-router-dom';

class Home extends Component {

  constructor(props) {
    super(props)
    this.state = {
      user: this.props.user,
      isLoggedIn: this.props.isLoggedIn,
    }
  }
  renderPlaceHolder() {
    return (
      <div className="container text-center">
        <h1>True Reviews (Alpha v2.0)</h1>
        <p>The place for high-quality reviews!</p>
      </div>
    )
  }
  renderLoginSnippet() {
    return (
      <div className="text-center">
        <h5>Please login to submit reviews and vote on existing reviews!</h5>
        <Button variant="primary" size="lg" onClick={GetMBToken}>Login</Button>
      </div>
    )
  }
  renderUserItems() {
    if (!this.props.isLoggedIn) {
      return (
        <div>
          {this.renderLoginSnippet()}
        </div>
      )
    }

    return (
      <div className="container text-center">
        <h5>Welcome back {this.props.user}!</h5>
        <Link to='/profile'><Button variant="primary" size="lg">View My Profile</Button></Link>
      </div>
    )
  }

  render() {
    return(
      <div className="jumbotron jumbotron-fluid tr-brand-jumbotron">
        <div className="container-fluid">
          <div className="row">
            {this.renderPlaceHolder()}
          </div>
          <hr/>
          <div className="row">
            <div className="col text-center">
              <p>TrueReviews is a review platform that is powered by Bitcoin to
                incentivize better reviews for any location on Google Maps.
                TrueReviews allows businesses to issue rewards to encourage
                feedback from their customers.</p>
            </div>
            <div className="col">
              {this.renderUserItems()}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Home

