import React from 'react';
import MoneyButton from '@moneybutton/react-money-button'

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
    var amount = 10
    console.log(payment.spendAmountUsd)
    if (payment.spendAmountUsd[0] === '1') {
      amount = 50
    }
    this.props.setLoadingTokens()
    fetch('/api/tokens/user/'+this.props.user+'/reviews', {
      headers: {'Content-Type': 'application/json'},
      method: 'post',
      body: JSON.stringify({
        amount: amount
      })
    }).then(r => {
      setTimeout(() => {
        this.props.loadTokens(this.props.user)
      }, 1500)
    }).catch(e => {
      console.error(e)
    })
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
      }, 1500)
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
    return (
      <div className="row text-center">
        <div className="col text-center">
          <h4>Reviews</h4>
          <hr/>
          {this.renderSpinner()}
          <MoneyButton
            to='truereviews@moneybutton.com'
            amount='.25'
            currency='USD'
            label='Ten Reviews'
            onLoad={this.onMBLoad}
            onPayment={this.onPaymentSuccessReviews}
          />
          <MoneyButton
            to='truereviews@moneybutton.com'
            amount='1'
            currency='USD'
            label='Fifty Reviews'
            onLoad={this.onMBLoad}
            onPayment={this.onPaymentSuccessReviews}
          />
        </div>
        <div className="col text-center">
          <h4>Votes</h4>
          <hr/>
          {this.renderSpinner()}
          <MoneyButton
            to='truereviews@moneybutton.com'
            amount='.3'
            currency='USD'
            label='Fifty Votes'
            onLoad={this.onMBLoad}
            onPayment={this.onPaymentSuccessVotes}
          />
          <MoneyButton
            to='truereviews@moneybutton.com'
            amount='.5'
            currency='USD'
            label='Hundred Votes'
            onLoad={this.onMBLoad}
            onPayment={this.onPaymentSuccessVotes}
          />
        </div>
      </div>
    )
  }
  renderSpinner() {
    if (this.state.loadedMBs !== 4) {
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
          <h3>Purchase more reviews or votes</h3>
          <hr/>
          {this.renderMBs()}
        </div>
      </div>
    );
  }
}
