import React, { Component } from 'react';
import {Link} from 'react-router-dom'

class ButtonList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      links: props.links,
      activeLocation: ''
    };
  }

  componentDidUpdate(prevProps) {
    console.log(this.props.links.length)
    if (this.props.links.length !== prevProps.links.length) {
      this.setState({
        links: this.props.links
      })
    }
  }
  renderLinks() {
    var buttonList = []
    this.state.links.map((item, key) => {
      var href = '/'+item.navLocation
      buttonList.push(<li key={key} className="nav-item"><Link to={href}><button className='btn btn-link nav-link' aria-expanded='false' aria-controls='navbarContent' data-toggle='collapse' data-target='#navbarContent'>{item.title}</button></Link></li>)
      return null
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
