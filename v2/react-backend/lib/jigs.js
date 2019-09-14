const NETWORK = process.env.TR_NETWORK
const OWNER = process.env.TR_OWNER
const PURSE = process.env.TR_PURSE
const PURSE2 = process.env.TR_PURSE2
const APP_ID = "TrueReviews"
const Run = require('./run.node.min')
const {promisify} = require('util')
const redis = require('redis')
const logger = require('../src/logger.js')
const blockchain = require('../src/blockchain.js')
const log = logger.CreateLogger()
const blockchainServer = new blockchain.BlockchainServer({ network: 'main', api: 'star' })

const redisClient = redis.createClient()
const redisGet = promisify(redisClient.get).bind(redisClient)
const redisSet = promisify(redisClient.set).bind(redisClient)
redisClient.on('error', (err) => {
  log.error('Redis error: ', err)
})

class redisStateCache {
  async get(location) {
    var value = await redisGet(location)
    return JSON.parse(value)
  }
  async set(location, value) {
    var val = JSON.stringify(value)
    await redisSet(location, val)
  }
}

const RunTrueReview = new Run ({
  //blockchain: 'bitindex',
  network: NETWORK,
  owner: OWNER,
  purse: PURSE,
  app: APP_ID,
  blockchain: blockchainServer,
  state: new redisStateCache(),
  logger: console
})

class UserDB extends Run.Jig {
  set(key, value) {this[key] = value}
  get(key) {return this[key]}
}
//UserDB.originTestnet = ''
//UserDB.locationTestnet = ''
UserDB.originMainnet = 'b13673f54d095138509f25bab5584bfd97b7fbde5a53fab30825a87a766c554b_o1'
UserDB.locationMainnet = 'b13673f54d095138509f25bab5584bfd97b7fbde5a53fab30825a87a766c554b_o1'

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
//TrueReview.originTestnet = ''
//TrueReview.locationTestnet = ''
TrueReview.originMainnet = '4e90052d00cf23108bfe89d6316419230546265415e0d3697a58c41f067205c2_o1'
TrueReview.locationMainnet = '4e90052d00cf23108bfe89d6316419230546265415e0d3697a58c41f067205c2_o1'

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
//BusinessCoupon.originTestnet = ''
//BusinessCoupon.locationTestnet = ''
BusinessCoupon.originMainnet = '56a08bfc9e7faa09e814827d5fe893ee4789ca5c2832f15daae28337dcd6e26e_o1'
BusinessCoupon.locationMainnet = '56a08bfc9e7faa09e814827d5fe893ee4789ca5c2832f15daae28337dcd6e26e_o1'

TrueReview.deps = {BusinessCoupon}

class TrueReviewToken extends Run.Token {
}
//TrueReviewToken.originTestnet = ''
//TrueReviewToken.locationTestnet = ''
TrueReviewToken.originMainnet = '3f5000a33d0b87551e67596b19a3fbd32713dae9cc6378c4f293eaf562f75b51_o1'
TrueReviewToken.locationMainnet = '3f5000a33d0b87551e67596b19a3fbd32713dae9cc6378c4f293eaf562f75b51_o1'

class BadReviewToken extends Run.Token {
}
//BadReviewToken.originTestnet = ''
//BadReviewToken.locationTestnet = ''
BadReviewToken.originMainnet = 'ae94892dc90e083098dace705ecc632742d3318decfa4521d76d8c1892699967_o1'
BadReviewToken.locationMainnet = 'ae94892dc90e083098dace705ecc632742d3318decfa4521d76d8c1892699967_o1'

class TrueReviewAlphaTesterToken extends Run.Token {
}
//TrueReviewAlphaTesterToken.originTestnet = ''
//TrueReviewAlphaTesterToken.locationTestnet = ''
TrueReviewAlphaTesterToken.originMainnet = 'c0342a566ea53ff3db1e966779017bc4ebdbb6a442925821a4f7216db15bfdd5_o1'
TrueReviewAlphaTesterToken.locationMainnet = 'c0342a566ea53ff3db1e966779017bc4ebdbb6a442925821a4f7216db15bfdd5_o1'

class ReviewToken extends Run.Token {
}
//ReviewToken.originTestnet = ''
//ReviewToken.locationTestnet = ''
ReviewToken.originMainnet = 'e2c58151d7c0186f6f9fe4df012eaa7f7d406598e40f9915dab41415761b49f6_o1'
ReviewToken.locationMainnet = 'e2c58151d7c0186f6f9fe4df012eaa7f7d406598e40f9915dab41415761b49f6_o1'

class VoteToken extends Run.Token {
}
VoteToken.originTestnet = 'f5a4ae1d8ca2cdaa3081581da422a175a692737886df717e0e3a7547e685afac_o1'
VoteToken.locationTestnet = 'f5a4ae1d8ca2cdaa3081581da422a175a692737886df717e0e3a7547e685afac_o1'
VoteToken.originMainnet = '066580abbabd5151e29daeb9010b2ab7646446b39fd96c908a24a996ff2da142_o1'
VoteToken.locationMainnet = '066580abbabd5151e29daeb9010b2ab7646446b39fd96c908a24a996ff2da142_o1'


class AllLocations extends Run.Jig {
  set(key, value) {this[key] = value}
  get(key) {return this[key]}
}
//AllLocations.originTestnet = ''
//AllLocations.locationTestnet = ''
AllLocations.originMainnet = '04efb68d41fc60a2c23ec1df1d467ba1c419cbcffe3ee081ca09b725237a22ac_o1'
AllLocations.locationMainnet = '04efb68d41fc60a2c23ec1df1d467ba1c419cbcffe3ee081ca09b725237a22ac_o1'

/************* Location **************/
// Alpha 0.2
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

Location.originTestnet = 'f83f861ad22aa5ea53451e914ea32873db6084213d2a5dca1de4fdb4bdf86687_o1'
Location.locationTestnet = 'f83f861ad22aa5ea53451e914ea32873db6084213d2a5dca1de4fdb4bdf86687_o1'
//Location.originMainnet = ''
//Location.locationMainnet = ''

//Alpha 0.2.1
class LocationV01 extends Location {
  createReview(body, rating, id, time) {
    var rev = new ReviewV01(this, body, rating, id, time)
    if (this.reviews == null) {
      this.reviews = {}
    }
    this.reviews[id] = rev
    return rev
  }
  addWebsite(website) {
    this.website = website
  }
  addPhoneNumber(number) {
    this.phoneNumber = number
  }
  addMenu(menu) {
    this.menu = menu
  }
  setImages(images) {
    this.images = images
  }
}

//LocationV01.originTestnet = ''
//LocationV01.locationTestnet = ''
LocationV01.originMainnet = '2c597992d3cc36511876be94710da02b0acce1472552ced6215db82747f00556_o2'
LocationV01.locationMainnet = '2c597992d3cc36511876be94710da02b0acce1472552ced6215db82747f00556_o2'

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
//ReviewPointsDB.originTestnet = ''
//ReviewPointsDB.locationTestnet = ''
ReviewPointsDB.originMainnet = '1ce23a53cd8bb9236e0c410da27b5732a34a948dbd93dfe52ce2761b7dbd7619_o1'
ReviewPointsDB.locationMainnet = '1ce23a53cd8bb9236e0c410da27b5732a34a948dbd93dfe52ce2761b7dbd7619_o1'

class User extends Run.Jig {
  init(paymail, name, createdAt) {
    this.paymail = paymail
    this.name = name
    this.reviewCount = 0
    this.reviews = []
    this.reputation = 0
    this.earned = 0
    this.notifications = []
  }
  newNotification(notification) {
    this.notifications.push(notification)
  }
  clearNotifications() {
    this.notifications = []
  }
  getNotifications() {
    return this.notifications
  }
}
User.originMainnet = '049b3e420793a558acbf8d20a057925a1e4c55e3b02218851461dc41538a4840_o1'
User.locationMainnet = '049b3e420793a558acbf8d20a057925a1e4c55e3b02218851461dc41538a4840_o1'
//User.originTestnet = ''
//User.locationTestnet = ''

// Full Credit below to Brenton Gunning. This is an example of big data in a
// Jig. I am using b64 encoding for images anyway so it fits his example to a
// T.  Switched Data for Image class.
class Chunk extends Run.Jig {
  init(data) {this.data = data }
}
Chunk.MAX_SIZE = 80000
//Chunk.originTestnet = ''
//Chunk.locationTestnet = ''
Chunk.originMainnet = 'e64119e7d4747bcb2e63191ebadb266a681852ad758268c583e5dcd2c6d581dd_o4'
Chunk.locationMainnet = 'e64119e7d4747bcb2e63191ebadb266a681852ad758268c583e5dcd2c6d581dd_o4'

class Image extends Run.Jig {
  init(chunks) {
    this.chunks = chunks
  }
  getData() {
    return this.chunks.reduce((data, chunk) => data.concat(chunk.data), "")
  }
  static build(data) {
    const chunks = []
    while (data.length > Chunk.MAX_SIZE) {
      chunks.push(new Chunk(data.slice(0, Chunk.MAX_SIZE)))
      data = data.slice(Chunk.MAX_SIZE)
    }
    if (data.length !== 0) {
      chunks.push(new Chunk(data))
    }
    return new Image(chunks)
  }
}
Image.deps = {Chunk}
//Image.originTestnet = ''
//Image.locationTestnet = ''
Image.originMainnet = 'e64119e7d4747bcb2e63191ebadb266a681852ad758268c583e5dcd2c6d581dd_o3'
Image.locationMainnet = 'e64119e7d4747bcb2e63191ebadb266a681852ad758268c583e5dcd2c6d581dd_o3'

/************* REVIEW **************/
// Alpha 0.2.0
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

Review.originTestnet = 'b37767ceea762261f343cc616a3753753246e316e49f0536b1d0343eea0a78c4_o1'
Review.locationTestnet = 'b37767ceea762261f343cc616a3753753246e316e49f0536b1d0343eea0a78c4_o1'
//Review.originMainnet = ''
//Review.locationMainnet = ''

// Alpha 0.2.1
class ReviewV01 extends Review {
  init(reviewLocation, body, rating, user, time) {
    super.init(reviewLocation, body, rating, user)
    this.lastModified = time
    this.createdAt = time
    this.images = []
    this.comments = {}
    this.userJig = {}
  }
  updateBody(newBody, newTime) {
    this.body = newBody
    this.lastModified = newTime
  }
  updateRating(newRating, newTime) {
    this.rating = newRating
    this.lastModified = newTime
  }
  addImage(newImage, newTime) {
    this.images.push(newImage)
    this.lastModified = newTime
  }
  addComment(user, comment) {
    this.comments[user] = comment
  }
}

ReviewV01.deps = {Image}
//ReviewV01.originTestnet = ''
//ReviewV01.locationTestnet = ''
ReviewV01.originMainnet = 'e64119e7d4747bcb2e63191ebadb266a681852ad758268c583e5dcd2c6d581dd_o2'
ReviewV01.locationMainnet = 'e64119e7d4747bcb2e63191ebadb266a681852ad758268c583e5dcd2c6d581dd_o2'

Location.deps = {TrueReview, Review, BusinessCoupon}
LocationV01.deps = {TrueReview, ReviewV01, BusinessCoupon}

// Redis
module.exports.RedisStateCache = redisStateCache

// Jigs
module.exports.Chunk = Chunk
module.exports.Image = Image
module.exports.Review = ReviewV01
module.exports.Location = LocationV01
module.exports.AllLocations = AllLocations
module.exports.UserDB = UserDB
module.exports.User = User
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
