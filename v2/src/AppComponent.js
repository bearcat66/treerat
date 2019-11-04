import React, {Component} from 'react';
import Home from './Home.js';
import Submit from './Submit.js';
import Browse from './Browse.js';
import Search from './Search.js';
import Redeem from './Redeem.js';
import Profile from './Profile.js';
import About from './About.js';
import Contact from './Contact.js';
import './App.css';


export default class AppComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: this.props.user,
    };
  }
  render() {
    return (
      <div>
        {this.state.showPage === "home" ? <Home navigateTo={this.navigate} userExists={this.userExists} user={this.state.user}/> : null}
        {this.state.showPage === "about" ? <About /> : null}
        {this.state.showPage === "submit" ? <Submit user={this.state.user} navigateTo={this.navigate}/> : null}
        {this.state.showPage === "browse" ? <Browse user={this.state.user} navigateTo={this.navigate}/> : null}
        {this.state.showPage === "search" ? <Search user={this.state.user} navigateTo={this.navigate}/> : null}
        {this.state.showPage === "redeem" ? <Redeem/> : null}
        {this.state.showPage === "profile" ? <Profile user={this.state.user} profileUser={this.state.profileUser}/> : null}
        {this.state.showPage === "contact" ? <Contact/> : null}
      </div>
    );
  }
}
