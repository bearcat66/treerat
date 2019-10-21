import React, {Component} from 'react';
import NavBar from './core/NavBar';
import Home from './Home.js';
import Submit from './Submit.js';
import Browse from './Browse.js';
import Search from './Search.js';
import Redeem from './Redeem.js';
import Profile from './Profile.js';
import About from './About.js';
import Contact from './Contact.js';
import './App.css';


class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showPage: "home",
      user: '',
      loggedIn: false,
      navLocations: [
        {title: "About", navLocation: "about"},
        {title: "Contact", navLocation: "contact"},
      ]

    };
    this.showProfilePage = this.showProfilePage.bind(this)
    this.userExists = this.userExists.bind(this)
    this.navigate = this.navigate.bind(this);
  }
  componentDidMount() {
    fetch('/api/session').then(res => {
      if (res.status === 404) {
        throw 'Session not found'
      }
      return res.json()
    }).then(r => {
      console.log(r.user)
      this.setState({loggedIn: true, user: r.user})
      this.setNavBarLocations()
    }).catch(e => {
      console.error(e)
      this.setState({loggedIn: false})
    })
  }
  navigate(newPage) {
    this.setState({showPage: newPage});
  }
  showProfilePage() {
    this.setState({showPage: 'profile'})
  }
  userExists(yes) {
    console.log(yes)
    this.setState({loggedIn: yes})
    this.setNavBarLocations()
  }
  setNavBarLocations() {
    if (this.state.loggedIn) {
      this.setState({
        navLocations: [
          {title: "About", navLocation: "about"},
          {title: "Submit", navLocation: "submit"},
          {title: "Browse", navLocation: "browse"},
          {title: "Search", navLocation: "search"},
          //{title: "Redeem", navLocation: "redeem"},
          {title: "Contact", navLocation: "contact"},
        ]
      })
    } else {
      console.log('not logged in updating navLocations')
      this.setState({
        navLocations: [
          {title: "About", navLocation: "about"},
          {title: "Contact", navLocation: "contact"},
        ]
      })
    }
  }
  renderLoginModal(){
    if (this.state.loggedIn) {
    }
  }


  render() {
    return (
      <div>
        <NavBar user={this.state.user} onUserClick={this.showProfilePage} navigateTo = {this.navigate} navLocations = {this.state.navLocations} />
        {this.state.showPage === "home" ? <Home navigateTo={this.navigate} userExists={this.userExists} user={this.user}/> : null}
        {this.state.showPage === "about" ? <About /> : null}
        {this.state.showPage === "submit" ? <Submit navigateTo={this.navigate}/> : null}
        {this.state.showPage === "browse" ? <Browse/> : null}
        {this.state.showPage === "search" ? <Search/> : null}
        {this.state.showPage === "redeem" ? <Redeem/> : null}
        {this.state.showPage === "profile" ? <Profile/> : null}
        {this.state.showPage === "contact" ? <Contact/> : null}
      </div>
    );
  }
}

export default App;
