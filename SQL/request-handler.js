var defaultCorsHeaders = require("./cors-header.js").defaultCorsHeaders,
    _ = require('underscore'),
    fs = require('fs'),
    url = require('url'),
    querystring = require('querystring');

var _CHAT_CLIENT_PATH = '../Chat_Client';
var dbConnection = require('./persistent_server.js').dbConnection;

var CHATLOG = 'chatlog.txt';
var storage = {};
fs.exists(CHATLOG, function (exists) {
  if(exists){
    fs.readFile(CHATLOG, {'encoding':'utf8'}, function (err, data) {
      if (err) throw err;
      storage = JSON.parse(data);
    });
  }
});



var handleRequest = function(request, response) {
  var headers = defaultCorsHeaders;
  var response_body = ''; //default, string!!!
  var reqUrl = url.parse(request.url, true),
      reqQuery = reqUrl.query;

  // console.log('Parsed reqUrl >>>>> ', reqUrl, ' <<<<<');
  console.log("Received request type " + request.method + " for url: " + reqUrl.pathname, ' >>>>>>');
  console.log('querystring: ', typeof reqQuery,' ',reqQuery);


  if(reqUrl.pathname.match(/^\/classes\/.*/)){

    if(request.method ==='GET'){

      response_body = storage[reqUrl.pathname] || [];
      response_body = JSON.stringify(response_body);
      endResponse(200);

    }else if(request.method === 'POST') {

      var chunks = [];
      request.on('data', function(data){
        chunks.push(data);
      });

      request.on('end', function(){
        chunks = chunks.join('');
        var inputData = _( JSON.parse(chunks) ).extend({'createdAt': new Date()});
        storage[reqUrl.pathname] = storage[reqUrl.pathname] || [];
        storage[reqUrl.pathname].push(inputData);
        endResponse(200);

        fs.writeFile(CHATLOG, JSON.stringify(storage), function (err) {
          if (err) throw err;
        });
      });

    } else {
      endResponse(404);
    }

  }else if(reqUrl.pathname === '/'){
    console.log('Serving the index.html of chat client. >>>>>>');
    fs.readFile(_CHAT_CLIENT_PATH + '/index.html', {'encoding': 'utf8'}, function(err, data){
      if (err) {
        console.log('err', err);
      }
      response_body = data;
      endResponse(200,'text/html');
    });
  }else if(fs.existsSync(_CHAT_CLIENT_PATH + reqUrl.pathname)) {
    console.log('Serving chat client script file: ', reqUrl.pathname, ' >>>>>>');

    fs.readFile(_CHAT_CLIENT_PATH + reqUrl.pathname, {'encoding': 'utf8'}, function(err, data){
      if (err) {
        console.log('err', err);
        // throw err;
      }
      response_body = data;
      endResponse(200,'application/script');
    });

  }else{
    endResponse(404);
  }

  function endResponse(statuscode, contentType){
    headers['contentType'] = contentType || 'text/plain';
    response.writeHead(statuscode, headers);
    response.end(response_body);
    dbConnection.end(); // end SQL server connection

    console.log('endResponse ', statuscode, ' <<<<<<'); // >>>> TODO: DELETE LATER <<<<
    // console.log('response_body: \n', response_body);  // >>>> TODO: DELETE LATER <<<<
  }
};

exports.handleRequest = handleRequest;

