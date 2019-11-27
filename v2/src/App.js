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
import {Route, Switch, useParams} from "react-router-dom";
function Tx(props) {
  var {id} = useParams()
  console.log(props)
  return (
    <Transaction id={id} user={props.user} tokens={props.tokens} loadTokens={props.loadTokens}/>
  )
}

function User() {
  var {id} = useParams()
  return (
    <Profile user={id}/>
  )
}

export default class App extends React.Component {
  render() {
    return (
      <div>
        <Switch>
          <Route exact path="/">
            <Home user={this.props.user} isLoggedIn={this.props.loggedIn}/>
          </Route>
          <Route path="/about">
            <About/>
          </Route>
          <Route path="/browse">
            <Browse user={this.props.user} tokens={this.props.tokens} loadTokens={this.props.loadTokens}/>
          </Route>
          <Route path="/contact">
            <Contact/>
          </Route>
          <Route path="/profile">
            <Profile user={this.props.user}/>
          </Route>
          <Route path="/search">
            <Search user={this.props.user} tokens={this.props.tokens} loadTokens={this.props.loadTokens}/>
          </Route>
          <Route path="/submit">
            <Submit user={this.props.user} tokens={this.props.tokens} loadTokens={this.props.loadTokens}/>
          </Route>
          <Route path="/tx/:id">
            <Tx tokens={this.props.tokens} user={this.props.user} loadTokens={this.props.loadTokens}/>
          </Route>
          <Route path="/user/:id">
            <User/>
          </Route>
          <Route path="/purchase">
            <Purchase user={this.props.user} loadTokens={this.props.loadTokens} setLoadingTokens={this.props.setLoadingTokens}/>
          </Route>
          <Route
            path="/login/"
            render={(props) => <Login {...props} updateSession={this.props.updateSession} setLoadingTokens={this.props.setLoadingTokens}/>}
          />
        </Switch>
      </div>
    )
  }
}

