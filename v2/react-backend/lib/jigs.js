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
  app: APP_ID,
})

class UserDB extends Run.Jig {
  set(key, value) {this[key] = value}
  get(key) {return this[key]}
}
UserDB.originTestnet = '4f58f455f8182924a52fa625c819c0bf9915d811b5dd771be9942c18b739ee8e_o1'
UserDB.locationTestnet = '4f58f455f8182924a52fa625c819c0bf9915d811b5dd771be9942c18b739ee8e_o1'
UserDB.originMainnet = ''
UserDB.locationMainnet = ''

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
TrueReview.originTestnet = '9300efd822c8e3bc648c35100ea6808152dc978a3710345c56a871dad8ffa7ad_o1'
TrueReview.locationTestnet= '9300efd822c8e3bc648c35100ea6808152dc978a3710345c56a871dad8ffa7ad_o1'
TrueReview.originMainnet = ''
TrueReview.locationMainnet = ''

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
BusinessCoupon.originTestnet = '1c989cc87bafc2f552e43884d02c81f133063e106e8557d5a34683d81a8624f7_o1'
BusinessCoupon.locationTestnet = '1c989cc87bafc2f552e43884d02c81f133063e106e8557d5a34683d81a8624f7_o1'
BusinessCoupon.originMainnet = ''
BusinessCoupon.locationMainnet = ''

TrueReview.deps = {BusinessCoupon}

class TrueReviewToken extends Run.Token {
}
TrueReviewToken.originTestnet = '629fdda9c078607df459bcf683e0a3be34969b3dcf0c0932b08bdd8cb16a3db4_o1'
TrueReviewToken.locationTestnet= '629fdda9c078607df459bcf683e0a3be34969b3dcf0c0932b08bdd8cb16a3db4_o1'
TrueReviewToken.originMainnet = ''
TrueReviewToken.locationMainnet = ''

class BadReviewToken extends Run.Token {
}
BadReviewToken.originTestnet = 'e325e07d25399be674a3f3a48479e63c36d3873f7dfb085e199a900c78dcd9dd_o1'
BadReviewToken.locationTestnet = 'e325e07d25399be674a3f3a48479e63c36d3873f7dfb085e199a900c78dcd9dd_o1'
BadReviewToken.originMainnet = ''
BadReviewToken.locationMainnet = ''

class TrueReviewAlphaTesterToken extends Run.Token {
}
TrueReviewAlphaTesterToken.originTestnet = '674d3335e8648b1bcc3f072328d542a5033ce090d1ef84f977b915ff1ef7a290_o1'
TrueReviewAlphaTesterToken.locationTestnet = '674d3335e8648b1bcc3f072328d542a5033ce090d1ef84f977b915ff1ef7a290_o1'
TrueReviewAlphaTesterToken.originMainnet = ''
TrueReviewAlphaTesterToken.locationMainnet = ''

class ReviewToken extends Run.Token {
}
ReviewToken.originTestnet = 'f41a25a9342db5fb5d4a09f45d56aa11a038c78c2f6396e396d8be03152dd50a_o1'
ReviewToken.locationTestnet = 'f41a25a9342db5fb5d4a09f45d56aa11a038c78c2f6396e396d8be03152dd50a_o1'
ReviewToken.originMainnet = ''
ReviewToken.locationMainnet = ''

class VoteToken extends Run.Token {
}
VoteToken.originTestnet = '431e9dd48509aef8a9f5f0a52e77f57944340f0a1947306444c05a77daa0eda4_o1'
VoteToken.locationTestnet = '431e9dd48509aef8a9f5f0a52e77f57944340f0a1947306444c05a77daa0eda4_o1'
VoteToken.originMainnet = ''
VoteToken.locationMainnet = ''


class AllLocations extends Run.Jig {
  set(key, value) {this[key] = value}
  get(key) {return this[key]}
}
AllLocations.originTestnet = '62da8bb61226cc9177ffa9eabadbf0fc374705715909f3af796a037bd37bd95e_o1'
AllLocations.locationTestnet = '62da8bb61226cc9177ffa9eabadbf0fc374705715909f3af796a037bd37bd95e_o1'
AllLocations.originMainnet = ''
AllLocations.locationMainnet = ''

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
Location.originTestnet = 'b2343c9cec98c547604edddd0675a27fd9420d523e988ef114ba50eac51751b6_o1'
Location.locationTestnet = 'b2343c9cec98c547604edddd0675a27fd9420d523e988ef114ba50eac51751b6_o1'
Location.originMainnet = ''
Location.locationMainnet = ''

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
    db.upvotedUsers.push(upvoter)
    this.set(key, db)
    return db.score
  }
}
ReviewPointsDB.originTestnet = 'dee4bfc82701c991a451d32c02b7b8ebb7ccd6f50a49e3b217e735170e670135_o1'
ReviewPointsDB.locationTestnet = 'dee4bfc82701c991a451d32c02b7b8ebb7ccd6f50a49e3b217e735170e670135_o1'
ReviewPointsDB.originMainnet = ''
ReviewPointsDB.locationMainnet = ''

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
Review.originTestnet = 'b81a51b2482bfd3e3f985dc45eca220a806a7dabea36c493431253218cf00a2d_o1'
Review.locationTestnet = 'b81a51b2482bfd3e3f985dc45eca220a806a7dabea36c493431253218cf00a2d_o1'
Review.originMainnet = ''
Review.locationMainnet = ''

Location.deps = {TrueReview, Review, BusinessCoupon}

module.exports.Review = Review
module.exports.Location = Location
module.exports.AllLocations = AllLocations
module.exports.UserDB = UserDB
module.exports.TrueReviewToken = TrueReviewToken
module.exports.BadReviewToken = BadReviewToken
module.exports.ReviewToken = ReviewToken
module.exports.VoteToken = VoteToken
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
