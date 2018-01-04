//var port = require('./private/config.json').port;
var port = require('../dat/config.json').virtual_agent.port;
module.exports = function(value){
    // Port is either a number or string depending if the config.json is encoded or plaintext
    // Therefore check if port isNaN to determine if configs should be decoded or not.
    if(!isNaN(port))
        return value; 
 
    var decodedString = new Buffer(value, 'base64');
	return (decodedString.toString());
}
