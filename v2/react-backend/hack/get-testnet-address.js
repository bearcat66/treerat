var bsv = require('../node_modules/bsv')
var privKey = bsv.PrivateKey.fromWIF(process.argv[2])
console.log('Owner key: ' + privKey.toWIF())
console.log('Owner address: ' + bsv.Address.fromPrivateKey(privKey))

