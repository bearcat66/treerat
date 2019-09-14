import React, { Component } from 'react';

class ButtonList extends Component {
  constructor(props) {
    super(props);
    this.state={};
    this.links = this.props.links.map((item, key) =>
      <li key={key} className="nav-item"><button className='btn btn-link nav-link' onClick={() => this.handleClick(key)}>{item.title}</button></li>
    );

    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(key) {
    var navLocation = this.props.links[key].navLocation;
    this.props.navFunction(navLocation);
  }


  render() {
    return(  
        <ul className="navbar-nav mr-auto">
          {this.links}
        </ul>
    )
  }

}

export default ButtonList
