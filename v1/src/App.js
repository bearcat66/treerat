import React, {Component} from 'react';
import NavBar from './core/NavBar';
import Home from './Home.js';
import Submit from './Submit.js';
import Users from './Users.js';
import Reviews from './Reviews.js';
import Search from './Search.js';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showPage: "home",
      navLocations: [
        {title: "Home", navLocation: "home"},
        {title: "Submit", navLocation: "submit"},
        {title: "Reviews", navLocation: "reviews"},
        {title: "Search", navLocation: "search"},
        {title: "Users", navLocation: "users"}
      ]

    };

    this.navigate = this.navigate.bind(this);
  }

  navigate(newPage) {
    this.setState({showPage: newPage});
  }

  render() {
    return (
      <div>
        <NavBar navFunction = {this.navigate} navLocations = {this.state.navLocations} />
	{this.state.showPage === "home" ? <Home /> : null}
	{this.state.showPage === "submit" ? <Submit /> : null}
	{this.state.showPage === "reviews" ? <Reviews /> : null}
	{this.state.showPage === "search" ? <Search /> : null}
	{this.state.showPage === "users" ? <Users /> : null}
      </div>
    );
  }
}

export default App;
