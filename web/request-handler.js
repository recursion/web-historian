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

var fileLoad = function(req, callback) {
  var filePath = __dirname + '/public' + req.url; // = ./public + req.url || ./public/index.html
  console.log(filePath);
  if (filePath === __dirname + '/public/') {
    filePath = __dirname + '/public/index.html';
  }

  fs.exists(filePath, function(exists) {

    if (exists) {
      fs.readFile(filePath, function(error, content) {
        if (error) {
          callback(null, 500);
        }
        else {
          callback(content, 200);
        }
      });
    }
    else {
      callback(null, 404);
    }
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
    var destination = req.url.split('/').pop();
    console.log("You've arrived at: " + destination);
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

  // if(req.url.indexOf('archive') > -1){
  //   var blah = req.url.split('/');
  //   console.log(blah);
  // }

  var action = actions[req.method];
  if(action){
    action(req, res);
  }
  //res.end(archive.paths.list);
};
