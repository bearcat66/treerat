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
  var locs = getAllLocations(log)
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
    loadLocation(log, location.location).then(r=> {
      res.json(r)
    })
  })
});

router.post('/:id/transfer', function(req, res) {
  transferLocation(log, req.params.id, req.body.businessID).then(r=> {
    res.json({transferSuccess: true})
  }).catch(e => {
    log.error(e)
    res.status(409).send(JSON.stringify({'error': e}))
  })
})

async function transferLocation(log, placeID, recipientID) {
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

async function loadLocation (log, location) {
  log.info('Loading location information for [' + location + ']')
  run.activate()
  await run.sync()
  var l = await run.load(location)
  await l.sync()
  var location = {placeID: l.placeID, lat: l.lat, lng: l.lng, name: l.name, reviews: []}
  log.info('Found location [' + l.placeID + ']')
  var entries = Object.entries(l.reviews)
  var total = entries.length
  var totalScore = 0
  for (var [key, value] of entries) {
    if (key == null || key == 'undefined') {
      log.error(new Error('Found null user key'))
      // I don't know how this got here. Not good!!
      continue
    }
    var profile = await users.LoadUserProfile(log, key)
    var score = await review.GetScore(log, value.origin)
    var time = await review.GetReviewTimestamp(log, value.origin)
    totalScore += parseFloat(value.rating)
    location.reviews.push({user: profile.profile.primaryPaymail, userID: profile.profile.id, body: value.body, rating: value.rating, origin: value.origin, points: score, timestamp: time})
  }
  var avg = totalScore / total
  avg = Math.round(avg * 10) / 10
  location.average = avg
  log.info('Successfully loaded information for location [' + location.placeID + ']')
  return location
}

function getAllLocationsJig() {
  return run.owner.jigs.find(x => x.constructor.name === 'AllLocations')
}

function getAllLocations(log) {
  return loadAllLocations(log).then(r => {
    return r
  })
}

async function loadAllLocations(log) {
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
  log.info('Successfully loaded all locations')
  return locationList
}

module.exports = router;
module.exports.GetAllLocationsDB = getAllLocationsJig
