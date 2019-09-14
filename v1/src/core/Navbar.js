import React, { Component } from 'react';
import Avatar from './Avatar.js';
import ButtonList from './navbar_helpers/ButtonList';

class Navbar extends Component {
  constructor(props) {
    super(props);
    this.state={};
  }

  render() {
    return(  
      <nav className="navbar navbar-expand-lg">
        <a className="navbar-brand" href="/">Rev React</a>
        <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon">Show More</span>
        </button>
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ButtonList links={this.props.links} />
        <form className="form-inline my-2 my-lg-0">
          <input className="form-control mr-sm-2" type="search" placeholder="Search" aria-label="Search" />
          <button className="btn btn-outline-success my-2 my-sm-0" type="submit">Search</button>
        </form>
       </div>
       <Avatar />
      </nav>
    )
  }

}

export default Navbar
