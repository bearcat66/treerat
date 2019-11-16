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
UserDB.originMainnet = '1050c9877ef584e6c21779eacbdd6dd1afca874ee515fd1202333cc84627a8c4_o1'
UserDB.locationMainnet = '1050c9877ef584e6c21779eacbdd6dd1afca874ee515fd1202333cc84627a8c4_o1'

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
TrueReview.originMainnet = '4cea12f82d3c4ed881915bc80262aacdb9f88c08c59de2320a039199ce71ea70_o1'
TrueReview.locationMainnet = '4cea12f82d3c4ed881915bc80262aacdb9f88c08c59de2320a039199ce71ea70_o1'

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
BusinessCoupon.originMainnet = '63be895e4fa0217a98e0ec39185c15a9d2a2c058780a70e4d8746b504014b42a_o1'
BusinessCoupon.locationMainnet = '63be895e4fa0217a98e0ec39185c15a9d2a2c058780a70e4d8746b504014b42a_o1'

TrueReview.deps = {BusinessCoupon}

class TrueReviewToken extends Run.Token {
}
TrueReviewToken.originTestnet = '629fdda9c078607df459bcf683e0a3be34969b3dcf0c0932b08bdd8cb16a3db4_o1'
TrueReviewToken.locationTestnet= '629fdda9c078607df459bcf683e0a3be34969b3dcf0c0932b08bdd8cb16a3db4_o1'
TrueReviewToken.originMainnet = '7585a32bba06e01415d7c4ea9c4867fba9e32f2909722814d08a02215346f7db_o1'
TrueReviewToken.locationMainnet = '7585a32bba06e01415d7c4ea9c4867fba9e32f2909722814d08a02215346f7db_o1'

class BadReviewToken extends Run.Token {
}
BadReviewToken.originTestnet = 'e325e07d25399be674a3f3a48479e63c36d3873f7dfb085e199a900c78dcd9dd_o1'
BadReviewToken.locationTestnet = 'e325e07d25399be674a3f3a48479e63c36d3873f7dfb085e199a900c78dcd9dd_o1'
BadReviewToken.originMainnet = '0fe9190f06a1e2bece3cf18ed9144231a601850fb6098b7c3a5f8fb0ea286503_o1'
BadReviewToken.locationMainnet = '0fe9190f06a1e2bece3cf18ed9144231a601850fb6098b7c3a5f8fb0ea286503_o1'

class TrueReviewAlphaTesterToken extends Run.Token {
}
TrueReviewAlphaTesterToken.originTestnet = '674d3335e8648b1bcc3f072328d542a5033ce090d1ef84f977b915ff1ef7a290_o1'
TrueReviewAlphaTesterToken.locationTestnet = '674d3335e8648b1bcc3f072328d542a5033ce090d1ef84f977b915ff1ef7a290_o1'
TrueReviewAlphaTesterToken.originMainnet = '253fee6d2324d1597e80c336efad08ac0bc6db0bf6ff9c2b20cf0d80fdcb0962_o1'
TrueReviewAlphaTesterToken.locationMainnet = '253fee6d2324d1597e80c336efad08ac0bc6db0bf6ff9c2b20cf0d80fdcb0962_o1'

class ReviewToken extends Run.Token {
}
ReviewToken.originTestnet = 'f41a25a9342db5fb5d4a09f45d56aa11a038c78c2f6396e396d8be03152dd50a_o1'
ReviewToken.locationTestnet = 'f41a25a9342db5fb5d4a09f45d56aa11a038c78c2f6396e396d8be03152dd50a_o1'
ReviewToken.originMainnet = '9dd7078b7f0b7e9a7b6ad3aae806a7a12ae626b3069de59b134e2e6b14183652_o1'
ReviewToken.locationMainnet = '9dd7078b7f0b7e9a7b6ad3aae806a7a12ae626b3069de59b134e2e6b14183652_o1'

class VoteToken extends Run.Token {
}
VoteToken.originTestnet = '431e9dd48509aef8a9f5f0a52e77f57944340f0a1947306444c05a77daa0eda4_o1'
VoteToken.locationTestnet = '431e9dd48509aef8a9f5f0a52e77f57944340f0a1947306444c05a77daa0eda4_o1'
VoteToken.originMainnet = '207ee9b7b1c6187815b169cb890cb2d0acf012155f275bc160bfae8a6d7285f7_o1'
VoteToken.locationMainnet = '207ee9b7b1c6187815b169cb890cb2d0acf012155f275bc160bfae8a6d7285f7_o1'


class AllLocations extends Run.Jig {
  set(key, value) {this[key] = value}
  get(key) {return this[key]}
}
AllLocations.originTestnet = '62da8bb61226cc9177ffa9eabadbf0fc374705715909f3af796a037bd37bd95e_o1'
AllLocations.locationTestnet = '62da8bb61226cc9177ffa9eabadbf0fc374705715909f3af796a037bd37bd95e_o1'
AllLocations.originMainnet = '5d6e355f31fecef6efe4a921d9203d5f47e444c065141c066939302b3e3b78f6_o1'
AllLocations.locationMainnet = '5d6e355f31fecef6efe4a921d9203d5f47e444c065141c066939302b3e3b78f6_o1'

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
Location.originMainnet = 'c0649f554f9435e150d75f6fc1f03b283a86405905f4d9c4c3e38a891f7cbf36_o1'
Location.locationMainnet = 'c0649f554f9435e150d75f6fc1f03b283a86405905f4d9c4c3e38a891f7cbf36_o1'

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
ReviewPointsDB.originMainnet = 'e008634551c5cb858d2d52f3e535b47e5b89eeb190da769b0fb05699e41dee6a_o1'
ReviewPointsDB.locationMainnet = 'e008634551c5cb858d2d52f3e535b47e5b89eeb190da769b0fb05699e41dee6a_o1'

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
Review.originMainnet = '8cf1a63a7bbf5b2056409af33ca8fa2ed75eb534b9c56644ae48bc477530a610_o1'
Review.locationMainnet = '8cf1a63a7bbf5b2056409af33ca8fa2ed75eb534b9c56644ae48bc477530a610_o1'

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
