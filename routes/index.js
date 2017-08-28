var express = require('express');
var router = express.Router();
var config = require('../private/config.json');

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index');
});

router.post('/uploadFile', function (req, res) {
  console.log('/uploadFile Called');
  var formidable = require('formidable');
  var form = new formidable.IncomingForm();
  var dir = !!process.platform.match(/^win/) ? '\\..\\uploads\\' : '/../uploads/';

  form.uploadDir = __dirname + dir;
  form.keepExtensions = true;
  form.maxFieldsSize = 10 * 1024 * 1024;
  form.maxFields = 1000;
  form.multiples = false;




  form.parse(req, function (err, fields, files) {
    if (err) {
      res.writeHead(200, {
        'content-type': 'text/plain'
      });
      res.write('an error occurred');
    } else {

      //console.log("CallData: " + fields.calldata);

      var calldata = JSON.parse(fields.calldata);
      console.log("channel: " + calldata.channel);

      /* Example files
        \"event\":\"Newstate\",
        \"privilege\":\"call,all\",
        \"channel\":\"PJSIP/80001-000000e4\",
        \"channelstate\":\"5\",
        \"channelstatedesc\":\"Ringing\",
        \"calleridnum\":\"575795\",
        \"calleridname\":\"<unknown>\",
        \"connectedlinenum\":\"90003\",
        \"connectedlinename\":\"<unknown>\",
        \"language\":\"en\",
        \"accountcode\":\"\",
        \"context\":\"from-internal\",
        \"exten\":\"575795\",
        \"priority\":\"1\",
        \"uniqueid\":\"1503683575.385\",
        \"linkedid\":\"1503683574.384\"

      {
        "file":{
          "size":31908,
          "path":"/home/centos/virtualagent/uploads/upload_999b8e0fd0208260420826a970452a14.png",
          "name":"uploaded_file_name.webm",
          "type":"video/webm", 7032935917
          "mtime":"2017-08-22T15:21:04.019Z"
        }
      }


      
      extension|recording_agent|processing_agent|received           |processed          |video_duration|status|deleted |src_channel      |dest_channel         |unique_id   |video_filename                              |video_filepath      
      32767    |virtualagent   |agent1          |2017-08-17 15:16:22|2017-08-17 15:16:22|90            |UNREAD|       0|SIP/5001-00000000|SIP/twilio0-00000001 |1497537484.1|upload_b91df3726d2e03b0d663efe24b5a615a.webm|/home/centos/virtualagent/uploads/ |
      */
      var fullpath = files.file.path
      var ext = parseInt(calldata.connectedlinenum) || 0;
      if(ext)
      var path = fullpath.substring(0, fullpath.lastIndexOf("/") + 1);
      var filename = fullpath.substring(fullpath.lastIndexOf("/") + 1);
      var query = "INSERT INTO " + config.mysql.videomailtable +
        " (extension, recording_agent, processing_agent, received, processed, video_duration, status, deleted, src_channel, dest_channel, unique_id, video_filename, video_filepath)" +
        " VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)";
      var args = [ext, 'virtualagent', null, new Date(), null, 90, 'UNREAD', 0, null, calldata.channel, calldata.uniqueid, filename, path];
      req.mysql.query(query, args, function (err, result) {
        if (err) {
          console.log("Mysql Error on insert: " + err)
        } else {
          console.log('File Uploaded: ' + JSON.stringify(files));
          res.write('received upload: ' + files.file.name);
          res.end();
        }
      });

    }
    
  });
});

module.exports = router;