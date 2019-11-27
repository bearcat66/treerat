import React from 'react';
import MoneyButton from '@moneybutton/react-money-button'
import {Button, Jumbotron, OverlayTrigger, Tooltip} from 'react-bootstrap'
import {Link} from 'react-router-dom'

export default class ReviewTable extends React.Component {
  constructor(props) {
    super(props);
    this.upvoteReview = this.upvoteReview.bind(this)
    this.downvoteReview = this.downvoteReview.bind(this)
    this.state = {
      reviews: this.props.reviews,
      userID: this.props.userID,
      loadingReviews: false,
      averageRating: this.props.averageRating,
      upvoting: false,
      renderVoteModal: false
    };
  }
  async upvoteReview(id) {
    this.setState({upvoting: true})
    try {
      var res = await fetch('/api/review/'+id+'/upvote', {
        headers: {'Content-Type': 'application/json'},
        method: 'post',
        body: JSON.stringify({
          userID: this.state.userID
        })
      })
      var s = await res.json()
    } catch(e) {
      console.error(e)
    }
    this.props.loadTokens(this.state.userID)
    this.setState({upvoting: false})
  }

  async downvoteReview(id) {
    this.setState({downvoting: true})
    var res = await fetch('/api/review/'+id+'/downvote', {
      headers: {'Content-Type': 'application/json'},
      method: 'post',
      body: JSON.stringify({
        userID: this.state.userID
      })
    })
    var s = await res.json()
    this.props.loadTokens(this.state.userID)
    this.setState({downvoting: false})
  }
  renderLocationInfo() {
    if (this.props.reviewsOnly) {
      return null
    }
    return (
      <div>
        <h3>Total Reviews: {this.state.reviews.length}</h3>
        <h3>Average Rating: {this.state.averageRating}</h3>
        <hr/>
      </div>
    )
  }

  //this actually creates the cells in the reviewTable, if changing the properties when moving to jigs then we need to remove / update properties here (and remove headers from render fuinction)
  renderTableData() {
    if (this.state.reviews == null) {
      return null
    }

    var revs = this.state.reviews.sort(function(a,b){
      return b.points.score-a.points.score
    })
    return revs.map((review, index) => {
      var tx = review.origin.split("_")[0]
      var txUrl = '/tx/'+tx
      var disableButton = false
      var upvoted = false
      var downvoted = false
      var upvoteButtonText = 'Great Review!'
      var downvoteButtonText = 'Bad Review'
      var tooltipText = 'Use Credit'
      if (review.points == null) {
        return null
      }
      if (review.points.upvotedUsers == null) {
        return null
      }
      //if (review.points.downvotedUsers == null) {
      //  return
      //}
      for (var i=0;i<review.points.upvotedUsers.length;i++) {
        if (review.points.upvotedUsers[i] === this.state.userID) {
          upvoteButtonText = 'Upvoted!'
          downvoteButtonText = 'Voted'
          disableButton = true
          upvoted = true
          tooltipText= 'Already voted'
        }
      }
      if (!upvoted) {
        for (i=0;i<review.points.downvotedUsers.length;i++) {
          if (review.points.downvotedUsers[i] === this.state.userID) {
            tooltipText= 'Already voted'
            upvoteButtonText = 'Voted'
            downvoteButtonText = 'Downvoted!'
            disableButton = true
            downvoted=true
          }
        }
      }
      if (this.props.tokens == null || this.props.tokens.votes === 0) {
        disableButton = true
        tooltipText = 'Purchase more vote credits'
      }
      var profileLink = '/user/' + review.user
      var time = new Date(review.timestamp)
      return (
        <div key={index}>
        <div className="card" styles="width: 10rem;">
          <div className="card-body">
            <h6 className="card-subtitle mb-2 text-right">{time.toLocaleString()}</h6>
            <h5 className="card-title">{review.user}</h5>
            <h6 className="card-subtitle mb-2 text-right">Rating: {review.rating}</h6>
            <h6 className="card-subtitle mb-2 text-right">Score: {review.points.score}</h6>
            <p className="card-text">{review.body}</p>
            <div className="card-text text-center">
              <Button disabled={disableButton} alt={tooltipText} title={tooltipText} variant="primary" size="sm" onClick={() => {
                review.points.score += 5
                review.points.upvotedUsers.push(this.state.userID)
                this.upvoteReview(review.origin)
              }}>{upvoteButtonText}</Button>
              <Button disabled={disableButton} alt={tooltipText} title={tooltipText} variant="danger" size="sm" onClick={() => {
                review.points.score -= 3
                review.points.downvotedUsers.push(this.state.userID)
                this.downvoteReview(review.origin)
              }}>{downvoteButtonText}</Button>
          </div>
          <ul/>
          <div className="card-text text-center">
            <h6 className="card-subtitle mb-2 text-center">Leave a tip!</h6>
            <MoneyButton
              to={review.userID}
              currency='USD'
              editable
            />
          </div>
          <hr/>
          <Link to={txUrl} className="card-link">View TX</Link>
          <ul/>
          <Link to={profileLink} className="card-link">{review.user}'s Profile</Link>
          </div>
        </div>
      </div>
      )
    })
  }
  render() {
    return (
      <Jumbotron fluid>
        {this.renderLocationInfo()}
        {this.renderTableData()}
      </Jumbotron>
    );
  }
}

