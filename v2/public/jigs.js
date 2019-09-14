// This will be used as a global map lookup
// const all = AllLocations()
// all.set(placeID, location.owner)
//
// Next time we want to create a location, check if we already have created it.
// We will own this jig so we are the only people who can update it

//class UserDB extends Run.Jig {
// init(userID, addr) {
//    this.userID = userID
//    this.addr = addr
//  }    
//}
// OWNER PRIV KwU2amxcNj1Ri7UihyVyNM8mJSzGiF9tLRwxYirX6WN3r6zT2Kf4
// OWNER PUB ADDRESS 17irYtTUaWvkpYQ6CctoCuaweFPctVrEQN
const OWNER_PRIVKEY = 'L2w31wT3VeqwuuKwDZSJsLN3BBRR45sb7LRkXveMnemZFAfSBNfW'
const PURSE_PRIVKEY = 'Kyt9WKt8XTymzwyQcwQeWtpEoELNHgkiwwbCFuBBHLWVPrjo7xBV'

const RunInstance = new Run({
  network: 'main',
  owner: OWNER_PRIVKEY,
  purse: PURSE_PRIVKEY
})

class UserDB extends Run.Jig {
  set(key, value) {this[key] = value}
  get(key) {return this[key]}
}

class AllLocations extends Run.Jig {
  set(key, value) {this[key] = value}
  get(key) {return this[key]}
}

class Location extends Run.Jig {
  init(placeID, coords) {
    this.placeID = placeID
    this.lat = coords.lat
    this.lng = coords.lng
    this.reviews = {}
  }
  createReview(body, rating, id) {
    console.log('Creating review for location: '+ this.placeID)
    var rev = new Review(this, body, rating, id)
    console.log(rev)
    if (this.reviews == null ) {
      this.reviews = {}
    }
    this.reviews[id] = rev
    console.log(this.reviews)
    //this.reviews.push(rev)
    //return rev
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
Location.deps = {Review}

class PlaceDB extends Run.Jig {
  set(key, value) {this[key] = value}
}
var Jigs = {Review, Location, PlaceDB, AllLocations, UserDB, RunInstance}
