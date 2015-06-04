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

exports.sendResponse = sendResponse = function(res, data, status, type){
  status = status || 200;
  type = type || "text/html";
  httphelpers.headers["Content-Type"] = type;
  res.writeHead(status, httphelpers.headers);
  res.end(data);
};

exports.findPath = findPath = function(url) {
  var filePath = __dirname + '/public' + url;
  if(url === "/"){
    filePath = __dirname + '/public/index.html';
  } else if (url.indexOf("archive") > -1){
    filePath = __dirname.slice(0,-4) + '/archives/sites/' + url.split('/').pop();
  }
  return filePath;
};

exports.fileLoad = fileLoad = function(req, callback) {
  var filePath = findPath(req.url);
  fs.exists(filePath, function(exists) {
    if (exists) {
      fs.readFile(filePath, function(error, content) {
        if (error) {
          callback(null, 500);
        } else {
          callback(content, 200);
        }
      });
    } else {
      callback(null, 404);
    }
  });
};

// Gather POST data
exports.gatherPostData = gatherPostData = function(request, response) {
  var body = '';

  request.on('data', function(chunk){
    body += chunk.toString();
  });

  request.on('end', function() {
    var postData = body;//JSON.parse(body);
    // do something with this data
    console.log(postData);
  });

};

var routerLogic = function(url){
  var re = /archive.+/g;
  if (re.test(url)) {
    return routes["archives"];
  } else if (routes[url]){
    return routes[url];
  } else {
    return routes["bad"];
  }
}

// As you progress, keep thinking about what helper functions you can put here!
