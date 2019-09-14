var bsv = require('../node_modules/bsv')
var code = generateCode()
var privKey = bsv.PrivateKey.fromWIF(OWNER_KEY)
var sig = bsv.Message.sign(code, privKey)

