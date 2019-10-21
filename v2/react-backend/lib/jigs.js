const NETWORK = process.env.TR_NETWORK
const OWNER = process.env.TR_OWNER
const PURSE = process.env.TR_PURSE
const PURSE2 = process.env.TR_PURSE2
const APP_ID = "TrueReviews"
const Run = require('./run.node.min')
const RunTrueReview = new Run ({
  network: NETWORK,
  owner: OWNER,
  purse: PURSE,
  app: APP_ID
})

class UserDB extends Run.Jig {
  set(key, value) {this[key] = value}
  get(key) {return this[key]}
}

class TrueReview extends Run.Jig {
  init(placeID, amount, code) {
    this.reward = amount
    this.placeID = placeID
    this._redemptionCode = code
    this.redeemed = false
  }
  send(to) {
    this.owner = to
  }
  getRedemptionCode() {
    return this._redemptionCode
  }
  redeem(code, userAddress) {
    if (code === this._redemptionCode) {
      this.redeemed = true
      return new BusinessCoupon(this.reward)
    }
    return null
  }
}

class TrueReviewAlphaTester extends Run.Token {
}

class BusinessCoupon extends Run.Jig {
  init(amount) {
    this.amount = amount
    this.placeID = ''
  }
  setPlace(id) {
    this.placeID = id
  }
  send(to) {
    this.owner = to
  }
}

TrueReview.deps = {BusinessCoupon}

class PointsDB extends Run.Jig {
  get(key) {return this[key]}
  addTen(key) {
    var pts = this[key]
    pts += 10
    this.set(key, pts)
    return pts
  }
  subtractFifty(key) {
    var pts = this[key]
    pts -= 50
    this.set(key, pts)
    return pts
  }
  newUser(key) {
    this.set(key, 100)
  }
  addHundred(key) {
    var pts = this[key]
    pts += 100
    this.set(key, pts)
    return pts
  }
  set(key, value) {this[key] = value}
}

class TrueReviewToken extends Run.Token {
}

class BadReviewToken extends Run.Token {
}

class TrueReviewAlphaTesterToken extends Run.Token {
}


class AllLocations extends Run.Jig {
  set(key, value) {this[key] = value}
  get(key) {return this[key]}
}

class Location extends Run.Jig {
  init(placeID, coords, name) {
    this.placeID = placeID
    this.lat = coords.lat
    this.lng = coords.lng
    this.name = name
    this.redeemableRewards = []
    this.reviews = {}
  }
  send(to) {
    this.owner = to
  }
  createReview(body, rating, id) {
    console.log('Creating review for location: '+ this.placeID)
    var rev = new Review(this, body, rating, id)
    if (this.reviews == null ) {
      this.reviews = {}
    }
    this.reviews[id] = rev
    return rev
  }
  mintRedeemableReward(amount, code) {
    this.redeemableRewards.push(new TrueReview(this.placeID, amount, code))
  }
}

class ReviewPointsDB extends Run.Jig {
  set(key, value) {this[key] = value}
  get(key) {return this[key]}
  downvote(key, downvoter) {
    var db = this[key]
    db.score -= 3
    db.downvotedUsers.push(downvoter)
    this.set(key, db)
    return db.score
  }
  upvote(key, upvoter) {
    var db = this[key]
    db.score += 5
    db.downvotedUsers.push(upvoter)
    this.set(key, db)
    return db.score
  }
}

class Review extends Run.Jig {
  init(reviewLocation, body, rating, user) {
    this.reviewLocation = reviewLocation
    this.body = body
    this.rating = rating
    this.user = user
  }
  send(to) {
    this.owner = to
  }
}
Location.deps = {TrueReview, Review, BusinessCoupon}

class PlaceDB extends Run.Jig {
  set(key, value) {this[key] = value}
}

module.exports.Review = Review
module.exports.Location = Location
module.exports.AllLocations = AllLocations
module.exports.UserDB = UserDB
module.exports.TrueReviewToken = TrueReviewToken
module.exports.BadReviewToken = BadReviewToken
module.exports.TrueReviewAlphaTesterToken = TrueReviewAlphaTesterToken
module.exports.RunTrueReview = RunTrueReview
module.exports.TrueReview = TrueReview
module.exports.ReviewPointsDB = ReviewPointsDB
module.exports.BusinessCoupon = BusinessCoupon
module.exports.NETWORK = NETWORK
module.exports.BSVNETWORK = `${NETWORK}net`
module.exports.OWNER_KEY = OWNER
module.exports.PURSE_KEY = PURSE
module.exports.PURSE2_KEY = PURSE2
module.exports.APP_ID = APP_ID
