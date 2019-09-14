import React from 'react';
import Login from './Login';
import Transaction from './Transaction';
import Home from './Home.js';
import Submit from './Submit.js';
import Browse from './Browse.js';
import Search from './Search.js';
import Purchase from './Purchase.js';
//import Redeem from './Redeem.js';
import Profile from './Profile.js';
import About from './About.js';
import Contact from './Contact.js';
import Location from './Location.js';
import Following from './Following.js';
import {Route, Switch, useParams} from "react-router-dom";
function Tx(props) {
  var {id} = useParams()
  return (
    <Transaction id={id} user={props.user} tokens={props.tokens} loadNotifications={props.loadNotifications}/>
  )
}

function Loc(props) {
  var {id} = useParams()
  return (
    <Location id={id} user={props.user} tokens={props.tokens} loadNotifications={props.loadNotifications}/>
  )
}
function User(props) {
  var {id} = useParams()
  return (
    <Profile profile={id} user={props.user} tokens={props.tokens} loadNotifications={props.loadNotifications}/>
  )
}

export default class App extends React.Component {
  render() {
    return (
      <div>
        <Switch>
          <Route exact path="/">
            <Home
              user={this.props.user}
              isLoggedIn={this.props.loggedIn}
            />
          </Route>
          <Route path="/about">
            <About/>
          </Route>
          <Route path="/browse">
            <Browse
              user={this.props.user}
              tokens={this.props.tokens}
              loadNotifications={this.props.loadNotifications}
              following={this.props.following}
              followedBy={this.props.followedBy}
              loggedIn={this.props.loggedIn}
            />
          </Route>
          <Route path="/contact">
            <Contact/>
          </Route>
          <Route path="/profile">
            <Profile
              user={this.props.user}
              profile={this.props.user}
              tokens={this.props.tokens}
              loadNotifications={this.props.loadNotifications}
              following={this.props.following}
              followedBy={this.props.followedBy}
              loggedIn={this.props.loggedIn}
            />
          </Route>
          <Route path="/search">
            <Search
              user={this.props.user}
              tokens={this.props.tokens}
              loadNotifications={this.props.loadNotifications}
              following={this.props.following}
              followedBy={this.props.followedBy}
              loggedIn={this.props.loggedIn}
            />
          </Route>
          <Route path="/submit">
            <Submit
              user={this.props.user}
              tokens={this.props.tokens}
              loadNotifications={this.props.loadNotifications}
            />
          </Route>
          <Route path="/tx/:id">
            <Tx
              tokens={this.props.tokens}
              user={this.props.user}
              loadNotifications={this.props.loadNotifications}
            />
          </Route>
          <Route path="/user/:id">
            <User
              tokens={this.props.tokens}
              user={this.props.user}
              loadNotifications={this.props.loadNotifications}
              following={this.props.following}
              followedBy={this.props.followedBy}
            />
          </Route>
          <Route path="/location/:id">
            <Loc
              tokens={this.props.tokens}
              user={this.props.user}
              loadNotifications={this.props.loadNotifications}
              following={this.props.following}
              followedBy={this.props.followedBy}
            />
          </Route>
          <Route path="/purchase">
            <Purchase/>
          </Route>
          <Route path="/following">
            <Following
              tokens={this.props.tokens}
              user={this.props.user}
              loadNotifications={this.props.loadNotifications}
              following={this.props.following}
              followedBy={this.props.followedBy}
            />
          </Route>
          <Route
            path="/login/"
            render={(props) => <Login {...props} updateSession={this.props.updateSession} loadNotifications={this.props.loadNotifications} setLoadingTokens={this.props.setLoadingTokens}/>}
          />
        </Switch>
      </div>
    )
  }
}

