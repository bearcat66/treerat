import React from 'react';
import ReviewForm from './ReviewForm'

export default class Submit extends React.Component {
  constructor(props) {
    super(props);
  };
  render() {
    return (
      <div className="jumbotron jumbotron-transparent-25">    
        <ReviewForm user={this.props.user} navigateTo={this.props.navigateTo}/>
      </div>
    );
  }
}
