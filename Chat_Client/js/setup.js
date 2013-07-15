(function(){
var friendList = {};
var chatRooms = {
  currentChatroom: 'messages'
};

var _SERVER_URL = 'http://127.0.0.1:8080/classes/';
var refreshRate = 0000;

if(!/(&|\?)username=/.test(window.location.search)){
  var newSearch = window.location.search;
  if(newSearch !== '' & newSearch !== '?'){
    newSearch += '&';
  }
  var username = prompt('your username? (letters and numbers only): ');
  while (!username || !/^[a-zA-Z0-9]+$/.test(username)){
    var username = prompt('Invalid characters.\nyour username? (letters and numbers only): ');
  }
  newSearch += 'username=' + username;
  window.location.search = newSearch;
}
var user = window.location.search.slice(10);
$('#userName').text(user);

// Don't worry about this code, it will ensure that your ajax calls are allowed by the browser
// $.ajaxPrefilter(function(settings, _, jqXHR) {
//   jqXHR.setRequestHeader("X-Parse-Application-Id", "voLazbq9nXuZuos9hsmprUz7JwM2N0asnPnUcI7r");
//   jqXHR.setRequestHeader("X-Parse-REST-API-Key", "QC2F43aSAghM97XidJw8Qiy1NXlpL5LR45rhAVAf");
// });

function print(data){
  data = JSON.parse(data);
  $('#chatList').text('');
  _.each(data, function(val){
    var $userLink = $("<a href='#' class='userLink'></a>").text(val['username']);
    var $timeStamp = $("<span class='timeStamp'></span><br>").text(prettyTimeStamp(val['createdAt']));
    var $text = val['text'] ? $("<span class='chatMessage'></span>").text(val['text'].slice(0,200)) : "";
    if (friendList[val['username']] && $text) {
      $text.addClass('bold');
    }
    var newMessage = $('<li></li>').append($userLink).append($timeStamp).append($text);
    $('#chatList').append(newMessage);
  });
}

function prettyTimeStamp(timeStamp){
  var now = new Date(),
  dif = Math.floor((now-timeStamp)/1000); // dif in seconds

  if (dif < 2){
    return dif + " second ago";
  }else if (dif < 60){
    return dif + " seconds ago"
  }else{
    return moment(timeStamp).fromNow(); // function defined in MIT's mement.min.js
  }
}

var timeID;
/** GET: classes/[roomName] **/
var $get = function(){
  var roomName = chatRooms.currentChatroom,
      url = _SERVER_URL + roomName;
  console.log('GET request url: ', url);
  $.ajax(url, {
    contentType: 'application/json',
    type: 'GET',
    data: {
      'order':'-createdAt',
      'limit': '30'
    },
    success: print,
    error: function(data) {
      console.log('Ajax GET failed');
    }
  });
  if(refreshRate){
    timeID = setTimeout($get, refreshRate);
  }
};

/** POST: classes/[roomName] **/
var $post = function(message){
  var roomName = chatRooms.currentChatroom,
      url = _SERVER_URL + roomName;
$.ajax(url, {
  contentType: 'application/json',
  type: 'POST',
  data: JSON.stringify({
    /*jshint multistr: true */
    'text' : message,
    'username': user
  }),
  success: function(data){
    console.log('POSTED');
  },
  error: function(data) {
    console.log('Ajax POST failed');
  }
});
clearTimeout(timeID);
$get(roomName);
};
/* >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
 * Event Listeners
<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<*/

$('#refresh').find('select').change(function(){
  clearTimeout(timeID);
  refreshRate = $(this).val()*1000;
  if(refreshRate){
    $('#manualRefresh').find('input').prop('disabled', true);
    timeID = setTimeout($get, refreshRate);
  } else{
    $('#manualRefresh').find('input').prop('disabled', false);
  }
});

$('#manualRefresh').submit(function(event){
  event.preventDefault();
  $get();
});

$('#listLength').find('select').change(function(){
  console.log($(this).val()); // >>> TODO: make server return limit of message on GET
});

/** Click Username:
 ** Add User to Fiend List,
 ** Hightight Friend's Messages **/
$('body').on('click','.userLink',function(event){
  event.preventDefault();
  if($(this).text() !== user){
    friendList[$(this).text()] = friendList[$(this).text()] ? false : true;
    if (friendList[$(this).text()]) { $('#friendList').append('<li>'+$(this).text()+'</li>'); }
    else { $('#friendList').find($('li:contains('+$(this).text()+')')).remove(); }
    clearTimeout(timeID);
    $get();
  }
});

$('#createChatRoomForm').submit(function(event){
  event.preventDefault();
  var roomName = $('#createChatRoom').val().split(" ").join('_'); // TODO: need regex checker function
  if (chatRooms.currentChatroom !== roomName && !chatRooms[roomName]){
    chatRooms.currentChatroom = roomName;
    chatRooms[roomName] = true;
    $('#chatRooms').append('<li><a href="#">' + roomName + '</a></li>');
    clearTimeout(timeID);
    $get(roomName);
    $('#chatRoomName').text(roomName);
    $('#createChatRoom').val("");
  }
});

/** Click Chatroom Name to Switch Chatroom **/
$('#chatRooms').on('click','li', function(event){
  event.preventDefault();
  chatRooms.currentChatroom = $(this).text();
  $('#chatRoomName').text($(this).text());
  clearTimeout(timeID);
  $get();
});

/** Get User Chat Input, POST to Server **/
$('#userChatForm').submit(function(event){
  event.preventDefault();
  $post($('#userChatMessage').val());
  $('#userChatMessage').val('');
});

/* >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
 * Initial Get + Print Funciton Call
<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<*/
clearTimeout(timeID);
$get();
})();