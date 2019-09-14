import React, {Component} from 'react';
import {GetMBUser} from './MB';
let bsv = require('bsv')

const UserDB = window.Jigs.UserDB
const Run = window.Run
const run = window.Jigs.RunInstance

class Home extends Component {

  constructor(props) {
    super(props)
    this.state = {
      pubkey: '',
      moneyButtonID: ''
    }
  }
    componentDidMount() {
       GetMBUser().then(r=> {
         this.setState({moneyButtonID: r.id})
       })
    }
  


  render() {
    return(
      <div className="jumbotron jumbotron-fluid tr-brand-jumbotron">
        <div className="container text-center">
          <h1>True Reviews</h1>
          <p>The place for high-quality reviews!</p>
        </div>
      </div>
    );
  }
}

export default Home

