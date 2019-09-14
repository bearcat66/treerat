var bsv = require('../node_modules/bsv')
var privKey = bsv.PrivateKey.fromRandom(bsv.Networks['testnet'])
var privKey2 = bsv.PrivateKey.fromRandom(bsv.Networks['testnet'])
console.log('Owner key: ' + privKey.toWIF())
console.log('Owner address: ' + bsv.Address.fromPrivateKey(privKey))
console.log('Purse key: ' + privKey2.toWIF())
console.log('Purse address: ' + bsv.Address.fromPrivateKey(privKey2))

