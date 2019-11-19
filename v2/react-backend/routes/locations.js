var mb = require('@moneybutton/api-client')

var express = require('express');
var router = express.Router();
var users = require('./users.js')
var review = require('./review.js')
var bsv = require('bsv')
var ecies = require('bsv/ecies')
const logger = require('../src/logger')
var log = logger.CreateLogger()

const Run = require('../lib/run.node.min')
const Jigs = require('../lib/jigs')
const run = Jigs.RunTrueReview
const ownerPrivKey = bsv.PrivateKey.fromWIF(Jigs.OWNER_KEY)
const MB_OAUTH_ID = process.env.REACT_APP_MBOAUTHID

/* GET locations listing. */
router.get('/', function(req, res, next) {
  run.activate()
  //ensureLocationDBCreated()
  var locs = getAllLocations()
  locs.then(r=> {
    res.json(r)
  })
});

router.get('/:id', function (req, res) {
  run.activate()
  log.info('Getting information for location: '+ req.params.id)
  var db = getAllLocationsJig()
  db.sync().then(d => {
    var location = d.get(req.params.id)
    if (location == null) {
      res.status(404).send('Did not find location')
      return
    }
    loadLocation(location.location).then(r=> {
      res.json(r)
    })
  })
});

router.post('/:id/transfer', function(req, res) {
  transferLocation(req.params.id, req.body.businessID).then(r=> {
    res.json({transferSuccess: true})
  }).catch(e => {
    log.error(e)
    res.status(409).send(JSON.stringify({'error': e}))
  })
})

async function transferLocation(placeID, recipientID) {
  run.activate()
  await run.sync()
  var userdb = run.owner.jigs.find(x => x.constructor.name === 'UserDB')
  var allLocs = run.owner.jigs.find(x => x.constructor.name === 'AllLocations')
  var user = userdb.get(recipientID)
  var loc = allLocs.get(placeID)
  if (loc == null) {
    log.error('Location doesnt exist')
    throw 'Location does not exist'
  }
  var location = await run.load(loc.location)
  await location.sync()
  var bug = Buffer.from(user.keys)
  var enc = ecies.bitcoreECIES().privateKey(ownerPrivKey).decrypt(bug)
  var keys = JSON.parse(enc.toString())
  location.send(keys.pubKey)
  allLocs.set(placeID, {ownedBy: user.profile.primaryPaymail, location: loc.location, coords: loc.coords})
  await run.sync()
  return
}

async function loadLocation (location) {
  run.activate()
  await run.sync()
  var l = await run.load(location)
  await l.sync()
  var location = {placeID: l.placeID, lat: l.lat, lng: l.lng, name: l.name, reviews: []}
  log.info(l.reviews)
  var entries = Object.entries(l.reviews)
  var total = entries.length
  var totalScore = 0
  for (var [key, value] of entries) {
    log.info(key)
    if (key == null || key == 'undefined') {
      log.error('Found null user key')
      // I don't know how this got here. Not good!!
      continue
    }
    var profile = await users.LoadUserProfile(key)
    var score = await review.GetScore(value.origin)
    totalScore += value.rating
    location.reviews.push({user: profile.profile.primaryPaymail, userID: profile.profile.id, body: value.body, rating: value.rating, origin: value.origin, points: score})
  }
  var avg = totalScore / total
  avg = Math.round(avg * 10) / 10
  log.info(avg)
  location.average = avg
  return location
}


/* ALL USERDB FUNCTIONS */
function ensureLocationDBCreated() {
  var dbjig = getAllLocationsJig()
  if (dbjig === null || dbjig == null) {
    createAllLocations()
  }
  return
}

function getAllLocationsJig() {
  return run.owner.jigs.find(x => x.constructor.name === 'AllLocations')
}

async function createAllLocations() {
  log.info('Creating new AllLocations object')
  new Jigs.AllLocations()
  await run.sync()
}

function getAllLocations() {
  return loadAllLocations().then(r => {
    return r
  })
}

async function loadAllLocations() {
  log.info('Loading all locations...')
  run.activate()
  await run.sync()
  var db = getAllLocationsJig()
  if (db == null) {
    return null
  }
  await db.sync()
  var entries = Object.entries(db)
  var locationList = []
  for (var [key,value] of entries) {
    if (key === 'owner' || key === 'satoshis' || key === 'location' || key === 'origin') {
      continue
    }
    var loc = db.get(key)
    run.activate()
    await run.sync()
    var l = await run.load(loc.location)
    locationList.push({id: key, location: loc.location, coords: loc.coords, locationName: l.name})
  }
  return locationList
}

module.exports = router;
module.exports.GetAllLocationsDB = getAllLocationsJig
