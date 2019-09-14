import React, { Component } from 'react';
  
class Avatar extends Component {i
  constructor(props) {
    super(props);
    this.state={
    	iconURL: "https://cdn.coolwallet.io/wp-content/uploads/2019/04/download.png",
    };
  }

  render() {
    return(
      <img alt="True Review" src={this.state.iconURL} width="30" height="30" />
    )
  }

}

export default Avatar

