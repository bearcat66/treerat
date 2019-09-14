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
    this.props.handleUpvote()
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
    this.props.handleUpwnvote()
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
        <tr>
          <td>{review.body}</td>
          <td>{review.rating}</td>
          <td>{review.user}</td>
          <td>
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
          </td>
          <td>{review.points.score}</td>
          <td className='text-xs-right'>
            <MoneyButton
              to={review.userID}
              editable='true'
              currency='USD'
            />
          </td>
        </tr>
      )
    })
  }
  render() {
      return (
          <Jumbotron fluid>
              <Table striped bordered hover>
                  <thead>
                      <tr>
                          <th text-center="true">Body</th>
                          <th text-center="true">Rating</th>
                          <th text-center='true'>User</th>
                          <th text-center="true">Vote</th>
                          <th text-center="true">Score</th>
                          <th text-center="true">Tip</th>
                      </tr>
                  </thead>
                  <tbody>
                    {this.renderTableData()}
                  </tbody>
              </Table>
          </Jumbotron>
          );
  }
}

