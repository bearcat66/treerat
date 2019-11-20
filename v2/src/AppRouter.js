import React, {Component} from 'react';
import './App.css';
import NavBar from './core/NavBar';
import App from './App.js';
import {Switch} from "react-router-dom";

class AppRouter extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showPage: "home",
      user: '',
      loggedIn: false,
      loadingTokens: false,
      profileUser: '',
      navLocations: [
        {title: "About", navLocation: "about"},
        {title: "Contact", navLocation: "contact"},
      ]

    };
    this.showProfilePage = this.showProfilePage.bind(this)
    this.loadTokens = this.loadTokens.bind(this)
    this.updateSession = this.updateSession.bind(this)
    this.setLoadingTokens = this.setLoadingTokens.bind(this)
  }
  componentDidMount() {
    fetch('/api/session').then(res => {
      if (res.status === 404 || res.status === 500) {
        throw new Error('Session not found')
      }
      return res.json()
    }).then(r => {
      this.setState({loggedIn: true, user: r.user, avatar: r.avatarUrl, name: r.name})
      this.setNavBarLocations()
      this.loadTokens(r.user)
    }).catch(e => {
      console.error(e)
      this.setState({loggedIn: false})
    })
  }
  setLoadingTokens() {
    this.setState({loadingTokens: true})
  }
  loadTokens(user) {
    this.setState({loadingTokens: true})
    fetch('/api/tokens/user/'+user, {
      headers: {'Cache-Control': 'no-cache'},
    }).then(res => {
      return res.json()
    }).then(r => {
      this.setState({
        tokens: {
          reviews: r.reviews,
          votes: r.votes
        },
        loadingTokens: false
      })
    }).catch(e => {
      console.error(e)
    })
  }
  updateSession() {
    fetch('/api/session').then(res => {
      if (res.status === 404 || res.status === 500) {
        throw new Error('Session not found')
      }
      return res.json()
    }).then(r => {
      console.log(r)
      this.setState({loggedIn: true, user: r.user, avatar: r.avatarUrl, name: r.name})
      this.setNavBarLocations()
      this.loadTokens(r.user)
    }).catch(e => {
      console.error(e)
      this.setState({loggedIn: false})
    })
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
          {title: "Purchase", navLocation: "purchase"},
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
    return (
      <div>
        <NavBar
          user={this.state.user}
          avatarUrl={this.state.avatar}
          name={this.state.name}
          navLocations = {this.state.navLocations}
          tokens={this.state.tokens}
          loadingTokens={this.state.loadingTokens}
        />
        <Switch>
          <App
            updateSession={this.updateSession}
            loadTokens={this.loadTokens}
            setLoadingTokens={this.setLoadingTokens}
            tokens={this.state.tokens}
            user={this.state.user}
            loggedIn={this.state.loggedIn}
          />
        </Switch>
      </div>
    );
  }
}


export default AppRouter;
