import React, {Component} from 'react';
import './App.css';
import NavBar from './core/NavBar';
import App from './App.js';
import {Switch} from "react-router-dom";
import {Button, Card, ListGroup, ListGroupItem} from 'react-bootstrap';
import './AppRouter.css';

const alphabet = ' abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ`1234567890-=~!@#$%^&*()_+,./;\'[]\\<>?:"{}|'
const shuffled = 't08sY]m\'#$Dy1`}pCKrHG)f9[uq%3\\ha=!ZVMkJ-*L"xz67R? W~@wdO:Ecg|ITe52.+{ovBj>(&,/Q4lA;^<NPnXSFi_Ub'
const encArr = alphabet.split('')
const decArr = shuffled.split('')
const UnwriterAPIKey = process.env.REACT_APP_UNWRITERAPIKEY

const query = {
  "v": 3,
  "q": {
    "find": {"out.s2": "run", "out.s4": "TrueReviews"},
    "limit": 50
  },
  "r": {
    "f": " [.[] | {tx: .tx, outs: .out[] | {data: .s5, longdata: .ls5}}]"
  }
}

var queryJSON = JSON.stringify(query)
var queryb64 = new Buffer.from(queryJSON).toString('base64')
var url = "https://genesis.bitdb.network/s/1FnauZ9aUH2Bex6JzdcV4eNX7oLSSEbxtN/"+queryb64

class AppRouter extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showPage: "home",
      user: '',
      loggedIn: false,
      loadingUser: false,
      tokens: {
        votes: 1,
        reviews: 1,
      },
      profileUser: '',
      following: [],
      followedBy: [],
      showNotifications: false,
      notifications: [],
      navLocations: [
        {title: "About", navLocation: "about"},
        {title: "Contact", navLocation: "contact"},
        {title: "Browse", navLocation: "browse"},
        {title: "Search", navLocation: "search"},
      ]

    };
    this.showProfilePage = this.showProfilePage.bind(this)
    this.loadNotifications = this.loadNotifications.bind(this)
    this.updateSession = this.updateSession.bind(this)
    this.setLoadingUser = this.setLoadingUser.bind(this)
    this.toggleNotifications = this.toggleNotifications.bind(this)
    /*this.bitsocket = new EventSource(url)
    this.bitsocket.onmessage = this.handleBitsocketMessage*/
  }
  handleBitsocketMessage(e) {
    var message = filterSocketMessage(e.data)
    if (message === null) {
      return
    }
  }
  componentDidMount() {
    this.setState({loadingUser: true})
    fetch('/api/session').then(res => {
      if (res.status === 404 || res.status === 500) {
        throw new Error('Session not found')
      }
      return res.json()
    }).then(r => {
      this.setState({loggedIn: true, user: r.user, avatar: r.avatarUrl, name: r.name, following: r.following, followedBy: r.followedBy, notifications: r.notifications, loadingUser: false})
      this.setNavBarLocations()
    }).catch(e => {
      console.error(e)
      this.setState({loggedIn: false, loadingUser: false})
    })
  }
  setLoadingUser() {
    this.setState({loadingUser: true})
  }
  loadNotifications() {
    fetch('/api/users/'+this.state.user+'/notifications').then(res=> {
      return res.json()
    }).then(r => {
      this.setState({notifications: r.notifications})
    })
  }
  updateSession() {
    this.setState({loadingUser: true})
    fetch('/api/session').then(res => {
      if (res.status === 404 || res.status === 500) {
        throw new Error('Session not found')
      }
      return res.json()
    }).then(r => {
      console.log(r)
      this.setState({loggedIn: true, user: r.user, avatar: r.avatarUrl, name: r.name})
      this.setNavBarLocations()
    }).catch(e => {
      console.error(e)
      this.setState({loggedIn: false, loadingUser: false})
    })
  }

  showProfilePage() {
    this.setState({showPage: 'profile'})
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

  toggleNotifications() {
    var current = this.state.showNotifications
    this.setState({showNotifications: !current})
  }

  renderNotifications() {
    return this.state.notifications.map((notification, index) => {
      return (
        <ListGroupItem>{notification}</ListGroupItem>
      )
    })
  }

  async clearNotifications() {
    this.setState({notifications: []})
    await fetch('/api/users/'+this.state.user+'/notifications/clear', {
      headers: {'Content-Type': 'application/json'},
      method: 'post'
    })
  }

  renderClearAllButton() {
    if (this.state.notifications.length === 0) {
      return (
        <Button id='clearButton' variant="outline-danger" disabled>Clear All</Button>
      )
    }
    return (
      <Button id='clearButton' variant="outline-danger" onClick={(e) => {
        this.clearNotifications()
        e.stopPropagation()
      }}>Clear All</Button>
    )
  }

  renderNotificationOverlay() {
    if (!this.state.showNotifications) {
      return (
        <div id='notificationOverlay' style={{display: 'none'}}/>
      )
    }
    return (
      <div id='notificationOverlay' style={{display: 'block'}} onClick={this.toggleNotifications}>
        <div className="text-center" id='notificationText'>
          <ul/>
          <Card.Img variant="top" src="/icons/bell.svg" height="40px"/>
          <Card.Title>Notifications</Card.Title>
          <hr/>
          <ListGroup className="list-group-flush">
            {this.renderNotifications()}
          </ListGroup>
          <ul/>
          {this.renderClearAllButton()}
          <ul/>
        </div>
      </div>
    )
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
          loadingUser={this.state.loadingUser}
          toggleNotifications={this.toggleNotifications}
          notifications={this.state.notifications}
        />
        {this.renderNotificationOverlay()}
        <Switch>
          <App
            updateSession={this.updateSession}
            loadNotifications={this.loadNotifications}
            setLoadingUser={this.setLoadingUser}
            tokens={this.state.tokens}
            user={this.state.user}
            loggedIn={this.state.loggedIn}
            following={this.state.following}
            followedBy={this.state.followedBy}
          />
        </Switch>
        <footer className="text-center" style={{color: '#1a6bbe'}}>
          <font size="-6">
            <p>Version: Alpha-0.3.0</p>
          </font>
        </footer>
      </div>
    );
  }
}

function filterSocketMessage(msg) {
  var m = JSON.parse(msg)
  if (m.type === 'open') {
    return null
  }
  console.log(m.data)
  for (var i=0;i<m.data.length;i++) {
    console.log(m.data[i])
  }
}


export default AppRouter;
