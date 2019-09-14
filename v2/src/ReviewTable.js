import React from 'react';
import MoneyButton from '@moneybutton/react-money-button'
import {Button, Card, Dropdown, DropdownButton, Jumbotron, OverlayTrigger, Tooltip} from 'react-bootstrap'
import {Link} from 'react-router-dom'
import ReviewCard from './ReviewCard.js'
import './ReviewTable.css'
const GOOGLE_KEY = process.env.REACT_APP_GOOGLE_API_KEY

export default class ReviewTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      reviews: this.props.reviews,
      userID: this.props.userID,
      locationName: this.props.locationName,
      loadingReviews: false,
      averageRating: this.props.averageRating,
    };
  }
  componentDidUpdate(prevProps) {
    if (this.props.reviews == null || prevProps.reviews == null) {
      return
    }
    if (prevProps.reviews[0].body !== this.props.reviews[0].body) {
      this.setState({reviews: this.props.reviews})
    }
  }
  renderHours() {
    if (this.props.googleData.hours == null || this.props.googleData.hours.weekday_text == null) {
      return (
        <p>None</p>
      )
    }
    return this.props.googleData.hours.weekday_text.map((hours, index) => {
      var i = hours.indexOf(' ')
      var formatted = [hours.slice(0, i), hours.slice(i+1)]
      var day = formatted[0]
      var hour = formatted[1]
      return (
        <p className='card-subtitle mb-2 text-left'><span className='font-weight-bold'>{day} </span><span className='text-right'>{hour}</span></p>
      )
    })
  }
  renderGoogleInformation() {
    if (this.props.googleData == null) {
      return null
    }
    return (
      <div className="container" id='googleInfo' style={{margin: 'auto'}}>
        <div className='card border-dark mb-3 rounded-lg' style={{maxWidth: '40rem', margin: 'auto'}}>
          <ul/>
          <h3 className="cart-title" style={{margin: 'auto'}}>Location Information</h3>
          <div className="row" style={{margin: '10px'}}>
            <div className="column">
              <div className="row" style={{margin: '10px'}}>
                <div className="column text-center">
                  <img style={{margin: '10px'}} src="icons/clock.svg" alt="" width="32" height="32" title="Bootstrap"/>
                </div>
                <div className="column">
                  {this.renderHours()}
                </div>
              </div>
            </div>
            <div className="divider"/>
            <div className="column">
              <div className="row" style={{margin: '10px'}}>
                <img style={{marginRight: '10px'}} src="icons/map.svg" alt="" width="32" height="32" title="Bootstrap"/>
                <p>{this.props.googleData.address}</p>
              </div>
              <div className="row" style={{margin: '10px'}}>
                <img style={{marginRight: '10px'}} src="icons/phone.svg" alt="" width="32" height="32" title="Bootstrap"/>
                <p>{this.props.googleData.phone}</p>
              </div>
              <div className="row" style={{margin: '10px'}}>
                <img style={{marginRight: '10px'}} src="icons/window.svg" alt="" width="32" height="32" title="Bootstrap"/>
                <a target='_' href={this.props.googleData.website}>Website</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
  renderLocationInfo() {
    if (this.props.reviewsOnly) {
      return null
    }
    var fontColor = 'text-success font-weight-bold'
    if (this.state.averageRating < 4) {
      fontColor = 'text-danger font-weight-bold'
    } else if (this.state.averageRating < 7) {
      fontColor = 'text-warning font-weight-bold'
    }
    return (
      <div>
        <div className="divider"/>
        <h1 className="card-title" style={{color: '#1a6bbe', fontFamily: 'arial'}}>{this.state.locationName}</h1>
        <ul/>
        <h4 className="card-subtitle mb-2 text-center" style={{fontFamily: 'arial'}}>Average Rating: <h4><span className={fontColor}><font size="+4">{this.state.averageRating}</font></span></h4></h4>
        <h4 className="card-subtitle mb-2 text-center" style={{fontFamily: 'arial'}}>Total Reviews: <h4>{this.state.reviews.length}</h4></h4>
        <div className="card-body justify-content-center">
          {this.renderGoogleInformation()}
        </div>
        <div className="card-text text-center">
          <Link
            to={{
              pathname: '/submit',
              state: {
                placeID: this.props.placeID,
                placeDescription: this.props.locationName,
                coords: this.props.coords
              }
            }}>
            <Button variant="primary" size="lg">Review this location!</Button>
          </Link>
          <div className="divider"/>
          <Link
            to={{
              pathname: '/location/'+this.props.placeID,
            }}>
            <Button variant="dark" size="lg">Open location page</Button>
          </Link>
        </div>
        <div className="divider"/>
      </div>
    )
  }

  //this actually creates the cells in the reviewTable, if changing the properties when moving to jigs then we need to remove / update properties here (and remove headers from render fuinction)
  renderTableData() {
    if (this.state.reviews == null) {
      return null
    }

    var revs = this.state.reviews.sort(function(a,b){
      if (a.points == null || b.points == null) {
        return
      }
      return b.points.score-a.points.score
    })
    return revs.map((review, index) => {
      return (
        <ReviewCard
          user={this.props.userID}
          review={review}
          loadNotifications={this.props.loadNotifications}
          tokens={this.props.tokens}
          following={this.props.following}
          followedBy={this.props.followedBy}
        />
      )

    })
  }
  render() {
    return (
      <Jumbotron fluid>
        <div className="card border-primary border-3 rounded-lg" styles="width: 10rem;">
          <ul/>
          {this.renderLocationInfo()}
          <hr/>
          <h3 className="card-subtitle mb-2 text-center" style={{color: '#1a6bbe', fontFamily: 'arial', fontWeight: 'bold'}}>Reviews</h3>
          <div className="container overflow-auto" style={{maxHeight: 900}}>
            {this.renderTableData()}
          </div>
        </div>
      </Jumbotron>
    );
  }
}

