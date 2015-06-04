var path = require('path');
var fs = require('fs');
var archive = require('../helpers/archive-helpers');

exports.headers = headers = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-allow-headers": "content-type, accept",
  "access-control-max-age": 10, // Seconds.
  'Content-Type': "text/html"
};

exports.serveAssets = function(res, asset, callback) {
  // Write some code here that helps serve up your static files!
  // (Static files are things like html (yours or archived from others...), css, or anything that doesn't change often.)
};

// construct an http response and send it out
exports.sendResponse = sendResponse = function(res, data, status, type){
  status = status || 200;
  type = type || "text/html";
  headers["Content-Type"] = type;
  res.writeHead(status, headers);
  res.end(data);
};

// find the path of a given url
exports.findPath = findPath = function(url) {
  var filePath = __dirname + '/public' + url;
  if(url === "/"){
    filePath = __dirname + '/public/index.html';
  } else if (url.indexOf("archive") > -1){
    filePath = archive.archivedSites + url.split('/').pop();
  }
  return filePath;
};

// load files
exports.fileLoad = fileLoad = function(req, callback) {
  var filePath = findPath(req.url);
  fs.exists(filePath, function(exists) {
    if (exists) {
      fs.readFile(filePath, function(error, content) {
        if (error) {
          callback(null, 500);
        } else {
          console.log(content);
          callback(content, 200);
        }
      });
    } else {
      callback(null, 404);
    }
  });
};

// Gather POST data
exports.gatherPostData = gatherPostData = function(request, response, callback) {
  var body = '';

  request.on('data', function(chunk){
    body += chunk.toString();
  });

  request.on('end', function() {
    var url = body.split('=').pop();
    callback(url);
  });

};
