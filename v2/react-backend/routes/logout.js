var mb = require('@moneybutton/api-client')
var bsv = require('bsv')
var ecies = require('bsv/ecies')

var express = require('express');
var router = express.Router();

//const Run = require('../lib/run.node.min')
//const Jigs = require('../lib/jigs')
//const run = Jigs.RunTrueReview
const MB_OAUTH_ID = process.env.REACT_APP_MBOAUTHID
const MB_CLIENT_ID = process.env.MB_CLIENT_ID
const MB_CLIENT_SECRET = process.env.MB_CLIENT_SECRET
const logger = require('../src/logger')
var log = logger.CreateLogger()


router.post('/:id', function(req, res) {
  log.info('Logging out user ['+req.params.id+']')
  req.session.destroy()
  res.json(JSON.stringify({'loggedOut': true}))
  log.info('Successfully logged out user ['+req.params.id+']')
})

module.exports = router;
