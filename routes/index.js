var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index');
});

router.post('/uploadFile', function (req, res) {
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
      /* Example files
      {
        "file":{
          "size":31908,
          "path":"/home/centos/virtualagent/uploads/upload_999b8e0fd0208260420826a970452a14.png",
          "name":"uploaded_file_name.webm",
          "type":"video/webm",
          "mtime":"2017-08-22T15:21:04.019Z"
        }
      }
      */
      res.write('received upload: ' + files.file.name);
    }
    res.end();
  });
});

module.exports = router;