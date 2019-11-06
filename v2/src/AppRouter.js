import React, {Component} from 'react';
import './App.css';
import Login from './Login';
import NavBar from './core/NavBar';
import Transaction from './Transaction';
import Home from './Home.js';
import Submit from './Submit.js';
import Browse from './Browse.js';
import Search from './Search.js';
//import Redeem from './Redeem.js';
import Profile from './Profile.js';
import About from './About.js';
import Contact from './Contact.js';
import {Route, Switch, useParams} from "react-router-dom";
function Tx() {
  var {id} = useParams()
  return (
    <Transaction id={id}/>
  )
}

function User() {
  var {id} = useParams()
  return (
    <Profile user={id}/>
  )
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showPage: "home",
      user: '',
      loggedIn: false,
      profileUser: '',
      navLocations: [
        {title: "About", navLocation: "about"},
        {title: "Contact", navLocation: "contact"},
      ]

    };
    this.showProfilePage = this.showProfilePage.bind(this)
  }
  componentDidMount() {
    fetch('/api/session').then(res => {
      if (res.status === 404) {
        throw new Error('Session not found')
      }
      return res.json()
    }).then(r => {
      console.log(r)
      this.setState({loggedIn: true, user: r.user, avatar: r.avatarUrl, name: r.name})
      this.setNavBarLocations()
    }).catch(e => {
      console.error(e)
      this.setState({loggedIn: false})
    })
  }
  navigate(newPage, profileUser) {
    console.log(profileUser)
    this.setState({showPage: newPage, profileUser: profileUser});
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
  render() {
    const App = () => (
      <div>
        <Switch>
          <Route exact path="/">
            <Home user={this.state.user} isLoggedIn={this.state.loggedIn}/>
          </Route>
          <Route path="/about">
            <About/>
          </Route>
          <Route path="/browse">
            <Browse/>
          </Route>
          <Route path="/contact">
            <Contact/>
          </Route>
          <Route path="/profile">
            <Profile user={this.state.user}/>
          </Route>
          <Route path="/search">
            <Search/>
          </Route>
          <Route path="/submit">
            <Submit user={this.state.user}/>
          </Route>
          <Route path="/tx/:id">
            <Tx/>
          </Route>
          <Route path="/user/:id">
            <User/>
          </Route>
          <Route path="/login/" component={Login} />
        </Switch>
      </div>
    )
    return (
      <div>
        <NavBar user={this.state.user} avatarUrl={this.state.avatar} name={this.state.name} onUserClick={this.showProfilePage} navigateTo = {this.navigate} navLocations = {this.state.navLocations} />
        <Switch>
          <App/>
        </Switch>
      </div>
    );
  }
}


export default App;
