import React from 'react';
import MoneyButton from '@moneybutton/react-money-button'
import {Button, Carousel, Dropdown, DropdownButton, Jumbotron, OverlayTrigger, Tooltip} from 'react-bootstrap'
import {Link} from 'react-router-dom'
import ImageUploader from 'react-images-upload'
import './ReviewCard.css'
import GoogleMap from 'google-map-react';
import Place from './Place';
import Compressor from 'compressorjs';
import bsv from 'bsv';
const MY_API_KEY = process.env.REACT_APP_GOOGLE_API_KEY

export default class ReviewCard extends React.Component {
  constructor(props) {
    super(props);
    this.setEditState = this.setEditState.bind(this)
    this.upvoteReview = this.upvoteReview.bind(this)
    this.downvoteReview = this.downvoteReview.bind(this)
    this.onDrop = this.onDrop.bind(this)
    this.onPaymentSuccess = this.onPaymentSuccess.bind(this)
    this.handleReviewBodyChange = this.handleReviewBodyChange.bind(this)
    this.handleReviewRatingChange = this.handleReviewRatingChange.bind(this)

    this.state = {
      userID: this.props.user,
      upvoting: false,
      review: this.props.review,
      location: this.props.location,
      editing: false,
      editedBody: this.props.review.body,
      editedRating: this.props.review.rating,
      following: this.props.following,
      followedBy: this.props.followedBy,
      paidImages: [],
      imageTxs: []
    };
  }
  componentDidUpdate(prevProps) {
    if (prevProps.review.body !== this.props.review.body) {
      this.setState({review: this.props.review})
    }
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
    this.props.loadNotifications()
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
    this.props.loadNotifications()
    this.setState({downvoting: false})
  }

  handleReviewBodyChange(event) {
    this.setState({editedBody: event.target.value})
  }
  handleReviewRatingChange(event) {
    this.setState({editedRating: event.target.value})
  }

  async saveEdits() {
    var review = this.state.review
    review.body = this.state.editedBody
    review.rating = this.state.editedRating
    review.images.push(this.state.imageTxs)
    this.setState({
      review: review,
      editing: false,
      waitForSavingEdits: true
    })
    var res = await fetch('/api/review/'+this.state.review.origin+'/edit', {
      headers: {'Content-Type': 'application/json'},
      method: 'post',
      body: JSON.stringify({
        userID: this.state.userID,
        editedBody: this.state.editedBody,
        editedRating: this.state.editedRating,
        newImages: this.state.imageTxs
      })
    })
    var s = await res.json()
    this.setState({waitForSavingEdits: false})
  }
  setEditState(to) {
    this.setState({
      editing: to,
    })
  }
  renderLocation() {
    var zoom = 8
    if (this.state.location == null) {
      return null
    }
    return (
      <div>
        <Link
          to={{
            pathname: '/location/'+this.state.location.placeID,
          }}>
          <h6 class="card-subtitle mb-2 text-center">{this.state.location.name}</h6>
        </Link>
        <div className="container-fluid text-center" style={{ height: '25vh', width: '75%'}}>
          <GoogleMap
            bootstrapURLKeys={{key: MY_API_KEY}}
            center={this.state.location.coords}
            defaultZoom={zoom} >
            <Place lat={this.state.location.coords.lat} lng={this.state.location.coords.lng} name={this.state.location.name}/>
          </GoogleMap>
        </div>
        <hr/>
      </div>
    )
  }

  renderVoters(voters) {
    if (voters == null || voters.length === 0) {
      return <p className='text-center'>None</p>
    }
    return voters.map((voter, index) => {
      return(
        <Dropdown.Item key={index} eventKey={index} drop='right'>{voter}</Dropdown.Item>
      )
    })
  }
  renderImages(review) {
    if (review.images == null) {
      return null
    }
    if (review.images.length === 0) {
      return null
    }
    return (
      <div className="carousel-custom" style={{maxWidth: '500px', marginLeft: 'auto', marginRight: 'auto'}}>
        <Carousel>
          {this.renderReviewImages(review.images)}
        </Carousel>
      </div>
    )
  }
  renderReviewImages(images) {
    if (images == null) {
      return null
    }
    return images.map((image, index) => {
      if (index === 0) {
        return (
          <Carousel.Item key={index}>
            <div className="img-holder">
              <img src={'https://bico.media/'+image} alt={index} style={{marginLeft: 'auto', marginRight: 'auto', maxWidth: '500px', maxHeight: '300px'}}/>
            </div>
          </Carousel.Item>
        )
      }
      return (
        <Carousel.Item key={index}>
          <div className="img-holder">
            <img src={'https://bico.media/'+image} alt={index} style={{marginLeft: 'auto', marginRight: 'auto', maxWidth: '500px', maxHeight: '300px'}}/>
          </div>
        </Carousel.Item>
      )
    })
  }
  onDrop(pictures) {
    var old = []
    for (var i=0;i<pictures.length;i++) {
      new Compressor(pictures[i], {
        quality: 0.6,
        convertSize: 200000,
        maxHeight: 800,
        maxWidth: 800,
        success: (result) => {
          // Send the compressed image file to server with XMLHttpRequest.
          var reader = new FileReader()
          reader.readAsDataURL(result)
          reader.onload = () => {
            var b64 = reader.result
            if (b64 === "") {
              return
            }
            old.push({
              name: result.name,
              image: b64,
              paid: false
            })
            console.log(result)
            this.setState({
              paidImages: old
            })
          }
        },
        error(err) {
          console.error(err.message);
        },
      });
    }
    this.setState({
      paidImages: old
    })
  }
  onPaymentSuccess(payment) {
    var txes = this.state.imageTxs
    txes.push(payment.txid)
    var old = this.state.paidImages
    for (var i=0;i<old.length;i++) {
      if (old[i].name === payment.buttonId) {
        old[i].paid = true
      }
    }
    this.setState({imageTxs: txes, paidImages: old})
  }
  renderImageMBs() {
    if (this.state.paidImages == null || this.state.paidImages.length === 0) {
      return null
    }
    return this.state.paidImages.map((res, index) => {
      if (res.paid) {
        return null
      }
      var image = res.image
      var script = bsv.Script.buildSafeDataOut(['truereviews.io', 'utf8', image]).toASM()
      var out = [{
        amount: 0,
        currency: 'BSV',
        script: script
      }]
      return (
        <div>
            <MoneyButton
              label={'Attach image'}
              outputs={out}
              onLoad={this.onMBLoad}
              onPayment={this.onPaymentSuccess}
              buttonId={res.name}
            />
        </div>
      )
    })
  }

  renderEditButtons(user) {
    if (this.state.userID !== user) {
      return null
    }
    if (this.state.waitForSavingEdits) {
      return (
        <div>
          <Button alt='Save' title='Save' variant='success' size='sm' onClick={() => {
            this.saveEdits()
          }} disabled>Saving...</Button>
          <hr/>
        </div>
      )
    }
    if (this.state.editing) {
      return (
        <div>
          <div className="form-group" id="reviewFormRating">
            <label>Rating: {this.state.editedRating}</label>
            <input className="form-control slider" value={this.state.editedRating} type="range" min="0" max="10" step="0.1" onInput={this.handleReviewRatingChange} required/>
            <div className="sliderticks">
              <p>0</p>
              <p>1</p>
              <p>2</p>
              <p>3</p>
              <p>4</p>
              <p>5</p>
              <p>6</p>
              <p>7</p>
              <p>8</p>
              <p>9</p>
              <p>10</p>
            </div>
          </div>
          <div className="form-group" id="reviewFormImages">
            <label>Attach Image</label>
            <ul/>
            <div style={{color: '#1a6bbe'}}>
              <ImageUploader
                withIcon={true}
                withPreview={true}
                buttonText='Choose images'
                onChange={this.onDrop}
                imgExtension={['.jpg', '.png', 'jpeg']}
                label={"Max size: 5mb; accepted: jpg|jpeg|png"}
                maxFileSize={5000001}
              />
            </div>
          </div>
          {this.renderImageMBs()}
          <Button alt='Cancel' title='Edit Review' variant='danger' size='sm' onClick={() => {
            this.setEditState(false)
            this.setState({editedRating: this.state.review.rating, editedBody: this.state.review.body})
          }}>Cancel</Button>
          <div className="divider"/>
          {this.renderSaveButton()}
          <hr/>
        </div>
      )
    }
    return (
      <div>
        <Button alt='Edit Review' title='Edit Review' variant='info' size='sm' onClick={() => {
          this.setEditState(true)
        }}>Edit Review</Button>
        <hr/>
      </div>
    )
  }
  renderSaveButton() {
    if (this.imagesAreNotPaid()) {
      return (
        <Button alt='Save' title='Save' variant='success' size='sm' disabled>Swipe MoneyButtons First</Button>
      )
    }
    return (
      <Button alt='Save' title='Save' variant='success' size='sm' onClick={() => {
        this.saveEdits()
      }}>Save</Button>
    )
  }
  imagesAreNotPaid() {
    var res = this.state.paidImages
    for (var i=0;i<res.length;i++) {
      if (!res[i].paid) {
        return true
      }
    }
    return false
  }
  renderReviewBody() {
    if (this.state.editing) {
      return (
        <textarea className="form-control" rows="3" value={this.state.editedBody} onChange={this.handleReviewBodyChange}/>
      )
    }
    return (
      <p className="card-text display-linebreak text-left">{this.state.review.body}</p>
    )
  }
  async followUser(userToFollow) {
    try {
      var res = await fetch('/api/users/'+userToFollow+'/follow', {
        headers: {'Content-Type': 'application/json'},
        method: 'post',
      })
      var s = await res.json()
    } catch(e) {
      console.error(e)
    }
  }
  renderFollowButton(user) {
    if (user === this.state.userID) {
      return null
    }
    if (this.state.following != null && this.state.following.includes(user)) {
      return (
        <Button alt='following' title='Following' variant='info' size='sm' disabled>Following</Button>
      )
    }
    return (
      <Button alt='follow' title='Follow' variant='info' size='sm' onClick={() => {
        this.followUser(user)
      }}>Follow</Button>
    )
  }

  //this actually creates the cells in the reviewTable, if changing the
  //properties when moving to jigs then we need to remove / update properties
  //here (and remove headers from render fuinction)
  renderReview() {
    var review = this.state.review
    var tx = review.origin.split("_")[0]
    var txUrl = '/tx/'+tx
    var disableButton = false
    var upvoted = false
    var downvoted = false
    var upvoteButtonText = 'Great Review!'
    var downvoteButtonText = 'Bad Review'
    var tooltipText = 'Use Credit'
    if (review.points == null) {
      review.points = {upvotedUsers: [], downvotedUsers: []}
    }
    if (review.points.upvotedUsers == null) {
      review.points.upvotedUsers = []
    }
    if (review.points.downvotedUsers == null) {
      review.points.downvotedUsers = []
    }
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
    if (this.props.tokens == null || this.props.tokens.votes === 0 || this.props.user == null || this.props.user === '') {
      disableButton = true
      tooltipText = 'Log in to vote'
    }
    if (review.user === this.props.user) {
      disableButton = true
      tooltipText = 'Cannot vote on your own review'
    }
    var profileLink = '/user/' + review.user
    var time = new Date(review.timestamp)
    var fontColor = 'text-success font-weight-bold'
    if (review.rating < 4) {
      fontColor = 'text-danger font-weight-bold'
    } else if (review.rating < 7) {
      fontColor = 'text-warning font-weight-bold'
    }
    //var lastModified = new Date(review.lastModified)
    return (
      <div className="card border-dark border-3 mb-3 rounded-lg" styles="width: 10rem;">
        <div className="card-body">
          {this.renderLocation()}
          <h6 className="card-subtitle mb-2 text-right">Created at: {time.toLocaleString()}</h6>
          {/*<h6 className="card-subtitle mb-2 text-right">Last Modified: {lastModified.toLocaleString()}</h6>*/}
          <Link to={profileLink} className="card-title card-link">
            <img alt='avatar' className="avatar" src={'https://bitpic.network/u/'+review.user}/>
            <h5>{review.user}</h5>
          </Link>
          {/*this.renderFollowButton(review.user)*/}
          <h6 className="card-subtitle mb-2 text-right">Rating: <span className={fontColor}><font size='+3'>{this.state.editedRating}</font></span></h6>
          <h6 className="card-subtitle mb-2 text-right">Score: {review.points.score}</h6>
          {this.renderReviewBody()}
          {this.renderEditButtons(review.user)}
          {this.renderImages(review)}
          <ul/>
          <div className="card-text text-center">
            <Button disabled={disableButton} alt={tooltipText} title={tooltipText} variant="primary" size="sm" onClick={() => {
              review.points.score += 5
              review.points.upvotedUsers.push(this.state.userID)
              this.upvoteReview(review.origin)
            }}>{upvoteButtonText}</Button>
            <div className="divider"/>
            <Button disabled={disableButton} alt={tooltipText} title={tooltipText} variant="danger" size="sm" onClick={() => {
              review.points.score -= 3
              review.points.downvotedUsers.push(this.state.userID)
              this.downvoteReview(review.origin)
            }}>{downvoteButtonText}</Button>
            <DropdownButton variant='light'title='See voters' size='sm' id='dropdown-menu'>
              <p className="text-center" style={{color: 'green', fontWeight: 'bold'}}>Great Review!</p>
              <Dropdown.Divider/>
              {this.renderVoters(review.points.upvotedUsers)}
              <Dropdown.Divider />
              <p className="text-center" style={{color: 'red', fontWeight: 'bold'}}>Bad Review</p>
              <Dropdown.Divider />
              {this.renderVoters(review.points.downvotedUsers)}
            </DropdownButton>
          </div>
          <ul/>
          <div className="card-text text-center">
            <h6 className="card-subtitle mb-2 text-center">Leave a tip!</h6>
            <MoneyButton
              to={review.user}
              currency='USD'
              editable
            />
          </div>
          <hr/>
          <Link to={txUrl} className="card-link">View TX</Link>
        </div>
      </div>
    )
  }
  render() {
    return (
      <div>
        {this.renderReview()}
      </div>
    );
  }
}

