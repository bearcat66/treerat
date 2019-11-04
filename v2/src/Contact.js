import React from 'react';
import {TwitterFollowButton} from 'react-twitter-embed';
export default class Contact extends React.Component {
  render() {
    return (
      <div className="jumbotron jumbotron-transparent-25">
        <div className="container-fluid text-center">
          <h3>Contact Us</h3>
          <hr/>
          <p>Please feel free to send us an email at connor@truereviews.io if you have any questions or feedback.</p>
          <TwitterFollowButton
            screenName={'truereviews_io'}
          />
        </div>
      </div>
    );
  }
}
