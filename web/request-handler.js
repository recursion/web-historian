var path = require('path');
var fs = require('fs');
var archive = require('../helpers/archive-helpers');
var httphelpers = require('./http-helpers');
var urlParser = require('url');


var sites = {
  addToSites: function(info, callback){
    this[info] = 1;
    fs.writeFile(archive.paths.list, info + "\n", function (err) {
      if (err) throw err;
      callback();
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
      httphelpers.sendResponse(res, data, 302);
    });
  }
};

var routerLogic = function(url){
  var re = /\.com/g;
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
      if(sites[url]){
        // should this be req.url or just url?
        var route = routerLogic(req.url);
        route(req, res);
      } else {
        sites.addToSites(url, function() {
          routes['redirect'](req, res);
        });
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
