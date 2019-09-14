import React from 'react';
import MoneyButton from '@moneybutton/react-money-button'
import {GetMBToken} from './MB.js'
import {Button} from 'react-bootstrap'
import bsv from 'bsv'
var img = "data:image/png;base64,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"

export default class Purchase extends React.Component {
  constructor(props) {
    super(props)
    this.onPaymentSuccessReviews = this.onPaymentSuccessReviews.bind(this)
    this.onPaymentSuccessVotes = this.onPaymentSuccessVotes.bind(this)
    this.onMBLoad = this.onMBLoad.bind(this)
    this.state = {
      loadedMBs: 0
    }
  }
  onPaymentSuccessReviews(payment) {
    console.log(payment)
  }
  onPaymentSuccessVotes(payment) {
    var amount = 50
    if (payment.spendAmountUsd[2] === '5') {
      amount = 100
    }
    this.props.setLoadingTokens()
    fetch('/api/tokens/user/'+this.props.user+'/votes', {
      headers: {'Content-Type': 'application/json'},
      method: 'post',
      body: JSON.stringify({
        amount: amount
      })
    }).then(r => {
      setTimeout(() => {
        this.props.loadTokens(this.props.user)
      }, 900)
    }).catch(e => {
      console.error(e)
    })
  }
  onMBLoad() {
    var tot = this.state.loadedMBs
    tot += 1
    this.setState({loadedMBs: tot})
  }
  renderMBs() {
    if (this.props.user == '') {
      return (
        <div>
          <h3>Login to purchase more credits</h3>
          <Button variant="primary" size="lg" onClick={GetMBToken}>Login</Button>
        </div>
      )
    }
    var script = bsv.Script.buildSafeDataOut(['truereviews.io', 'utf8', img]).toASM()
    console.log(script)
    var out = [{
      amount: 0,
      currency: 'BSV',
      script: script
    }]
    return (
      <div className="row text-center">
        <div className="col text-center">
          <h4>Reviews</h4>
          <hr/>
          {this.renderSpinner()}
          <MoneyButton
            label='Submit image'
            outputs={out}
            onLoad={this.onMBLoad}
            onPayment={this.onPaymentSuccessReviews}
          />
        </div>
      </div>
    )
  }
  renderSpinner() {
    if (this.state.loadedMBs !== 1) {
      return (
        <div className="container text-center">
          <p>Loading MoneyButton...</p>
          <div className="spinner-grow text-center"/>
        </div>
      )
    }
    return null
  }
  render() {
    return (
      <div className="jumbotron jumbotron-transparent-25">
        <div className="container-fluid text-center">
          <h3 style={{color: '#1a6bbe',  fontFamily: 'arial', fontWeight: '600'}}>Purchase More Credits</h3>
          <hr/>
          {this.renderMBs()}
        </div>
      </div>
    );
  }
}

