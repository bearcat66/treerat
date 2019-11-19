const logger = require('simple-node-logger')
//Configure Logger
var pid = process.argv[2]
var opts ={
  logFilePath: 'tr.log',
  timeStampFormat: 'YYYY-MM-DD HH:mm:ss.SSS'
}
function CreateLogger() {
  var manager = logger.createLogManager();
  var createdLog = manager.createLogger(pid);
  return createdLog
}
module.exports.CreateLogger = CreateLogger
