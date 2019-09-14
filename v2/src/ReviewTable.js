import React from 'react';
import MoneyButton from '@moneybutton/react-money-button'
import {Button, Jumbotron, Table} from 'react-bootstrap'
const run = window.Jigs.RunInstance

export default class ReviewTable extends React.Component {
  constructor(props) {
    super(props);
    this.upvoteReview = this.upvoteReview.bind(this)
    this.downvoteReview = this.downvoteReview.bind(this)
    this.state = {
      reviews: [],
      userID: '',
      upvoting: false,
      renderVoteModal: false
    };
  }
  componentDidMount() {
    this.props.reviews.then(r => {
      this.setState({reviews: r})
    })
    this.setState({userID: this.props.userID})
  }
  componentDidUpdate(prevProps) {
    this.props.reviews.then(r => {
      if (r == null || r === null || r.length === 0) {
        return null
      }
      if (r.length !== this.state.reviews.length || r[0].origin !== this.state.reviews[0].origin) {
        this.setState({reviews: r})
      }
    })
  }
  async upvoteReview(id) {
    this.setState({upvoting: true})
    var res = await fetch('/api/review/'+id+'/upvote', {
      headers: {'Content-Type': 'application/json'},
      method: 'post',
      body: JSON.stringify({
        userID: this.state.userID
      })
    })
    var s = await res.json()
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
    this.setState({downvoting: false})
  }

  //this actually creates the cells in the reviewTable, if changing the properties when moving to jigs then we need to remove / update properties here (and remove headers from render fuinction)
  renderTableData() {
    if (this.state.reviews == null) {
      return null
    }
    var revs = this.state.reviews.sort(function(a,b){return b.points.score-a.points.score})
    return revs.map((review, index) => {
      var disableButton = false
      var upvoted = false
      var downvoted = false
      var upvoteButtonText = 'Great Review!'
      var downvoteButtonText = 'Bad Review'
      console.log(review.points)
      if (review.points.upvotedUsers == null) {
        return
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
        }
      }
      if (!upvoted) {
        for (var i=0;i<review.points.downvotedUsers.length;i++) {
          if (review.points.downvotedUsers[i] === this.state.userID) {
            upvoteButtonText = 'Voted'
            downvoteButtonText = 'Downvoted!'
            disableButton = true
            downvoted=true
          }
        }
      }
      return (
        <div>
        <div class="card" styles="width: 10rem;">
          <div class="card-body">
            <h5 class="card-title">User: {review.user}</h5>
            <h6 class="card-subtitle mb-2 text-right">Rating: {review.rating}</h6>
            <h6 class="card-subtitle mb-2 text-right">Score: {review.points.score}</h6>
            <p class="card-text">{review.body}</p>
            <div class="card-text text-center">
              <Button disabled={disableButton} variant="primary" size="sm" onClick={() => {
                review.points.score += 5
                review.points.upvotedUsers.push(this.state.userID)
                this.upvoteReview(review.origin)
              }}>{upvoteButtonText}</Button>
              <Button disabled={disableButton} variant="danger" size="sm" onClick={() => {
                review.points.score -= 3
                review.points.downvotedUsers.push(this.state.userID)
                this.downvoteReview(review.origin)
              }}>{downvoteButtonText}</Button>
          </div>
          <ul/>
          <div class="card-text text-center">
            <h6 class="card-subtitle mb-2 text-center">Leave a tip!</h6>
            <MoneyButton
              to={review.userID}
              editable='true'
              currency='USD'
            />
          </div>
          <hr/>
          </div>
        </div>
      </div>
      )
    })
  }
  render() {
      return (
        <Jumbotron fluid>
          {this.renderTableData()}
          </Jumbotron>
          );
  }
}

