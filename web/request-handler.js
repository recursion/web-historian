var path = require('path');
var fs = require('fs');
var archive = require('../helpers/archive-helpers');
var httphelpers = require('./http-helpers');
var urlParser = require('url');

var sendResponse = function(res, data, status, type){
  status = status || 200;
  type = type || "text/html";
  httphelpers.headers["Content-Type"] = type;
  res.writeHead(status, httphelpers.headers);
  res.end(data);
};

var findPath = function(url) {
  var filePath = __dirname + '/public' + url;
  if(url === "/"){
    filePath = __dirname + '/public/index.html';
  } else if (url.indexOf("archive") > -1){
    filePath = __dirname.slice(0,-4) + '/archives/sites/' + url.split('/').pop();
  }
  return filePath;
};

var fileLoad = function(req, callback) {
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
var gatherPostData = function(request, response) {
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

var routes = {
  "\/": function(req, res){
    fileLoad(req, function(data, statusCode){
      sendResponse(res, data, statusCode);
    });
  },
  "\/styles.css": function(req ,res){
    fileLoad(req, function(data, statusCode){
      sendResponse(res, data, statusCode, "text/css");
    });
  },
  "bad": function(req, res){
    sendResponse(res, null, 404);
  },
  "archives": function(req, res){
    fileLoad(req, function(data, statusCode){
      sendResponse(res, data, statusCode);
    });
  }
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

var actions = {
  "POST": function(req, res){
    //check if on sites.txt
      //if not - append to
      //send to loading.html
    //if on sites.txt
      //go to archived version

    gatherPostData(req, res);
    var route = routerLogic(req.url);
    route(req, res);

  },
  "GET": function(req, res){
    var route = routerLogic(req.url);
    route(req, res);
  },
  "OPTION": function(req, res){
    var route = routerLogic(req.url);
    route(req, res);
  }
};

exports.handleRequest = function (req, res) {

  var action = actions[req.method];
  if(action){
    action(req, res);
  }

};
