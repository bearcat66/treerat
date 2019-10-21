import React, { Component } from 'react';

class ButtonList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      links: props.links,
      activeLocation: ''
    };

    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(key) {
    var navLocation = this.props.links[key].navLocation;
    this.setState({activeLocation: navLocation})
    this.props.navigateTo(navLocation);
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
    var buttonList = []
    this.state.links.map((item, key) => {
      if (this.state.activeLocation === item.title) {
        buttonList.push(<h1>test</h1>)
      }
      buttonList.push(<li key={key} className="nav-item"><button className='btn btn-link nav-link' aria-expanded='false' aria-controls='navbarContent' data-toggle='collapse' data-target='#navbarContent' onClick={() => this.handleClick(key)}>{item.title}</button></li>)
    });
    return buttonList
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
