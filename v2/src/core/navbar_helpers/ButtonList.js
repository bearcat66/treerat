import React, { Component } from 'react';

class ButtonList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      links: props.links
    };

    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(key) {
    var navLocation = this.props.links[key].navLocation;
    this.props.navFunction(navLocation);
  }

  componentDidUpdate(prevProps) {
    console.log(this.props.links.length)
    if (this.props.links.length != prevProps.links.length) {
      this.setState({
        links: this.props.links
      })
    }
  }
  renderLinks() {
    return this.state.links.map((item, key) =>
      <li key={key} className="nav-item"><button className='btn btn-link nav-link' aria-expanded='false' aria-controls='navbarContent' data-toggle='collapse' data-target='#navbarContent' onClick={() => this.handleClick(key)}>{item.title}</button></li>
    );
  }


  render() {
    return(  
      <ul className="navbar-nav mr-auto">
        {this.renderLinks()}
        </ul>
    )
  }

}

export default ButtonList
