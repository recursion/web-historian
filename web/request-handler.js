var path = require('path');
var fs = require('fs');
var archive = require('../helpers/archive-helpers');
var httphelpers = require('./http-helpers');
var urlParser = require('url');
var sites = {
  addToSites: function(info){
    this[info] = 1;
    //append to sites.txt
    fs.appendFile(__dirname.slice(0,-4) + '/archives/sites.txt', info + "\n", function (err) {
      if (err) throw err;
    });
  }
};

var routes = {
  "\/": function(req, res){
    httphelpers.fileLoad(req, function(data, statusCode){
      httphelpers.sendResponse(res, data, statusCode);
    });
  },
  "\/styles.css": function(req ,res){
    httphelpers.fileLoad(req, function(data, statusCode){
      httphelpers.sendResponse(res, data, statusCode, "text/css");
    });
  },
  "bad": function(req, res){
    sendResponse(res, null, 404);
  },
  "archives": function(req, res){
    httphelpers.fileLoad(req, function(data, statusCode){
      httphelpers.sendResponse(res, data, statusCode);
    });
  },
  "redirect": function(req, res){
    req.url = '/loading.html';
    httphelpers.fileLoad(req, function(data, statusCode){
      httphelpers.sendResponse(res, data, statusCode);
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
};

var actions = {
  "POST": function(req, res){
    httphelpers.gatherPostData(req, res, function (url) {
      console.log(url);
      if(sites[url]){
        // should this be req.url or just url?
        var route = routerLogic(req.url);
        route(req, res);
      } else {
        sites.addToSites(url);
        routes['redirect'](req, res);
      }
    });
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
