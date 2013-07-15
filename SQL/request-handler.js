var defaultCorsHeaders = require("./cors-header.js").defaultCorsHeaders,
    _ = require('underscore'),
    fs = require('fs'),
    url = require('url'),
    querystring = require('querystring');

var _CHAT_CLIENT_PATH = '../Chat_Client';
var dbConnection = require('./persistent_server.js').dbConnection;

var handleRequest = function(request, response) {

  var headers = defaultCorsHeaders;
  // var response_body = ''; //default, string!!!
  var reqUrl = url.parse(request.url, true),
      reqQuery = reqUrl.query;

  // console.log('Parsed reqUrl >>>>> ', reqUrl, ' <<<<<');
  console.log("Received request type " + request.method + " for url: " + reqUrl.pathname, ' >>>>>>');
  console.log('querystring: ', typeof reqQuery,' ',reqQuery);


  if(reqUrl.pathname.match(/^\/classes\/.*/)){
    var chat_room_name = reqUrl.pathname.replace(/^\/classes\//,'');

    if(request.method ==='GET'){
      dbConnection.query('SELECT messages.message, messages.created_at, users.username FROM messages JOIN chat_rooms ON chat_rooms.chat_room_name = ? JOIN users ON users.user_id = messages.user_id', chat_room_name, function(err,result){
        if(err) console.log(err);
        console.log(typeof result, result, ' -----------GET query result');
        endResponse(200, 'text/JSON', JSON.stringify(result));
      });
    } else if (request.method === 'POST') {
      var chunks = [];
      request.on('data', function(data){
        chunks.push(data);
      });

      request.on('end', function(){
        chunks = chunks.join('');
        chunks = _(JSON.parse(chunks)).extend({'created_at': new Date()});
        dbConnection.query('INSERT INTO messages (message, created_at, user_id, chat_room_id) SELECT ?, ?, users.user_id, chat_rooms.chat_room_id FROM users, chat_rooms WHERE users.username = ? AND chat_rooms.chat_room_name = ?', [chunks.message, chunks.created_at, chunks.username, chat_room_name], function(err, result){
            if(err) console.log(err);
            else console.log('Message posted: ', chunks);
            endResponse(200);
        });
      });

    } else {
      endResponse(404);
    }

  } else if (reqUrl.pathname.match(/^\/users.*/)) {
    var chunks = [];
    request.on('data', function(data){
      chunks.push(data);
    });

    request.on('end', function(){
      chunks = chunks.join('');
      chunks = JSON.parse(chunks);
      console.log('Inserting username to users table: ',chunks);
      dbConnection.query('INSERT INTO users (username) values (?)', chunks.username, function(err, result){
        if (err){
          console.log(err);
        }
        endResponse(200);
      })
    });

  } else if (reqUrl.pathname === '/'){
    console.log('Serving the index.html of chat client. >>>>>>');
    fs.readFile(_CHAT_CLIENT_PATH + '/index.html', {'encoding': 'utf8'}, function(err, data){
      if (err) {
        console.log('err', err);
      }
      endResponse(200,'text/html', data);
    });
  } else if (fs.existsSync(_CHAT_CLIENT_PATH + reqUrl.pathname)) {
    console.log('Serving chat client script file: ', reqUrl.pathname, ' >>>>>>');

    fs.readFile(_CHAT_CLIENT_PATH + reqUrl.pathname, {'encoding': 'utf8'}, function(err, data){
      if (err) {
        console.log('err', err);
        // throw err;
      }
      endResponse(200,'application/script', data);
    });

  } else {
    endResponse(404);
  }

  function endResponse(statuscode, contentType, response_body){
    headers['contentType'] = contentType || 'text/plain';
    response_body = response_body || ' ';
    response.writeHead(statuscode, headers);
    response.end(response_body);

    console.log('endResponse ', statuscode, ' <<<<<<'); // >>>> TODO: DELETE LATER <<<<
  }
};

exports.handleRequest = handleRequest;

