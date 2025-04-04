
const Logger = require("./logger");
const logger = new Logger('pranav.p','Case-12345678');

logger.info('App started')
setTimeout(function(){},3000)
logger.debug('Event START triggered')
setTimeout(function(){},3000)
logger.warn('THING Deprecated')
setTimeout(function(){},3000)
logger.error('Logging is too cool')
setTimeout(function(){},3000)
logger.fatal('App crashed because of X, Y and Z')

var localeDate = new Date().toLocaleString('en-IN', { hour12: false,timeZone: 'Asia/Kolkata'}).replace(',',''); 
console.log(localeDate)
