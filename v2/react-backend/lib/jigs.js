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
UserDB.originMainnet = '9989a0ea86710933e1265f609a8b8885be4a4984badb7e95064506ce980b14d8_o1'
UserDB.locationMainnet = '9989a0ea86710933e1265f609a8b8885be4a4984badb7e95064506ce980b14d8_o1'

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
TrueReview.originMainnet = '6ef91ebf1a96a0d3e3f81624df526a8c8aa4aef23455134add61fd2ae6a14e01_o1'
TrueReview.locationMainnet = '6ef91ebf1a96a0d3e3f81624df526a8c8aa4aef23455134add61fd2ae6a14e01_o1'

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
BusinessCoupon.originMainnet = '7c4c6c7506cffbb43e1d864dcff88cd332a99930b808c002aa2e4eb4e32777ca_o1'
BusinessCoupon.locationMainnet = '7c4c6c7506cffbb43e1d864dcff88cd332a99930b808c002aa2e4eb4e32777ca_o1'

TrueReview.deps = {BusinessCoupon}

class TrueReviewToken extends Run.Token {
}
TrueReviewToken.originTestnet = '629fdda9c078607df459bcf683e0a3be34969b3dcf0c0932b08bdd8cb16a3db4_o1'
TrueReviewToken.locationTestnet= '629fdda9c078607df459bcf683e0a3be34969b3dcf0c0932b08bdd8cb16a3db4_o1'
TrueReviewToken.originMainnet = '3a4dd18ffe1376848cfa1554a6eea3f65bba76895bb4888a8fae5005e79d2502_o1'
TrueReviewToken.locationMainnet = '3a4dd18ffe1376848cfa1554a6eea3f65bba76895bb4888a8fae5005e79d2502_o1'

class BadReviewToken extends Run.Token {
}
BadReviewToken.originTestnet = 'e325e07d25399be674a3f3a48479e63c36d3873f7dfb085e199a900c78dcd9dd_o1'
BadReviewToken.locationTestnet = 'e325e07d25399be674a3f3a48479e63c36d3873f7dfb085e199a900c78dcd9dd_o1'
BadReviewToken.originMainnet = '6c49216a6dcfc99235e6523facab196b75315bb0b4f1b9cd4dd419fd77bfb836_o1'
BadReviewToken.locationMainnet = '6c49216a6dcfc99235e6523facab196b75315bb0b4f1b9cd4dd419fd77bfb836_o1'

class TrueReviewAlphaTesterToken extends Run.Token {
}
TrueReviewAlphaTesterToken.originTestnet = '674d3335e8648b1bcc3f072328d542a5033ce090d1ef84f977b915ff1ef7a290_o1'
TrueReviewAlphaTesterToken.locationTestnet = '674d3335e8648b1bcc3f072328d542a5033ce090d1ef84f977b915ff1ef7a290_o1'
TrueReviewAlphaTesterToken.originMainnet = 'e40f94d5c3880eaff8cb7632252074f2e7d7c23aa81139e71388b679b2b7f68f_o1'
TrueReviewAlphaTesterToken.locationMainnet = 'e40f94d5c3880eaff8cb7632252074f2e7d7c23aa81139e71388b679b2b7f68f_o1'

class ReviewToken extends Run.Token {
}
ReviewToken.originTestnet = 'f41a25a9342db5fb5d4a09f45d56aa11a038c78c2f6396e396d8be03152dd50a_o1'
ReviewToken.locationTestnet = 'f41a25a9342db5fb5d4a09f45d56aa11a038c78c2f6396e396d8be03152dd50a_o1'
ReviewToken.originMainnet = '7bedc7dfd9aa24f92f66c30c3b3bfe6297d0386b1df4d4328293606a10b48769_o1'
ReviewToken.locationMainnet = '7bedc7dfd9aa24f92f66c30c3b3bfe6297d0386b1df4d4328293606a10b48769_o1'

class VoteToken extends Run.Token {
}
VoteToken.originTestnet = '431e9dd48509aef8a9f5f0a52e77f57944340f0a1947306444c05a77daa0eda4_o1'
VoteToken.locationTestnet = '431e9dd48509aef8a9f5f0a52e77f57944340f0a1947306444c05a77daa0eda4_o1'
VoteToken.originMainnet = '43ab12fde2dc8be8466b2701e206784e73429f30a47589b3a8c2cd6e2232f0c9_o1'
VoteToken.locationMainnet = '43ab12fde2dc8be8466b2701e206784e73429f30a47589b3a8c2cd6e2232f0c9_o1'


class AllLocations extends Run.Jig {
  set(key, value) {this[key] = value}
  get(key) {return this[key]}
}
AllLocations.originTestnet = '62da8bb61226cc9177ffa9eabadbf0fc374705715909f3af796a037bd37bd95e_o1'
AllLocations.locationTestnet = '62da8bb61226cc9177ffa9eabadbf0fc374705715909f3af796a037bd37bd95e_o1'
AllLocations.originMainnet = '34eeb2e621e66c51baecf24ff8b6561a2f6af70ee42c5d3a286b8e58dbb02751_o1'
AllLocations.locationMainnet = '34eeb2e621e66c51baecf24ff8b6561a2f6af70ee42c5d3a286b8e58dbb02751_o1'

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
Location.originMainnet = '96fa1454f490c9618b9bd9ebaad044d237127dca7c9a1a899d886b20acf83ea1_o1'
Location.locationMainnet = '96fa1454f490c9618b9bd9ebaad044d237127dca7c9a1a899d886b20acf83ea1_o1'

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
ReviewPointsDB.originMainnet = '1191653d65bb93d7a02c8d6b320fc96d628f01c4cec5f1c6f3098ae10fd9d21c_o1'
ReviewPointsDB.locationMainnet = '1191653d65bb93d7a02c8d6b320fc96d628f01c4cec5f1c6f3098ae10fd9d21c_o1'

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
Review.originMainnet = '1e1019ae2747e296dc1072fb15aedc34d8f0be7f44e3278a02164f1640623e60_o1'
Review.locationMainnet = '1e1019ae2747e296dc1072fb15aedc34d8f0be7f44e3278a02164f1640623e60_o1'

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
