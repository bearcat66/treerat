import React from 'react';
import MoneyButton from '@moneybutton/react-money-button'
import {Button} from 'react-bootstrap'

export default class Following extends React.Component {
  render() {
    return (
      <div className="jumbotron jumbotron-transparent-25">
        <div className="container-fluid text-center">
          <h3>Following</h3>
          <hr/>
          <p>
            {this.props.following}
            {this.props.followedBy}
          </p>
        </div>
      </div>
    );
  }
}
