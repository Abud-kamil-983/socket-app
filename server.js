 var express = require('express');
 var app = express();
 var http = require('http');
 var bodyParser = require('body-parser');
 var bcrypt = require('bcrypt');
 var jwt = require('jsonwebtoken');
 var socketIO = require('socket.io');
 var server = http.createServer(app);
 var io = socketIO(server);
 app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
 app.use(bodyParser.json()); // support json encoded bodies
 var events = require('events');
 var eventEmitter = new events.EventEmitter();
// requiring mongoose 

 var mongoose = require('mongoose');
 // requiring mongoose objectId
 var ObjectId = require('mongodb').ObjectId; 
 var dbpath = 'mongodb://localhost/Chat';
 db = mongoose.connect(dbpath);

 mongoose.connection.once('open', function(){
 	console.log('database connection opened');
 });

// including blog model

var User = require('./models/User.js');
var Chat = require('./models/Chat.js');
var chatModel = mongoose.model('Chat');
var userModel = mongoose.model('User');

app.get('/', function(req, res){
	res.sendFile(__dirname + '/views/login.html')
});


app.post('/register', function(req, res){
  var newUser = new userModel(req.body);
  newUser.hash_password = bcrypt.hashSync(req.body.password, 10);
  newUser.save(function(err, user) {
    if (err) {
      return res.status(400).send({
        message: err
      });
    } else {
      return res.json(user);
    }
  });
});

app.post('/login', function(req, res){
	userModel.findOne({'email':req.body.email}, function(err, user){
    if (err) throw err;
    if (!user) {
      res.status(401).json({ message: 'Authentication failed. User not found.' });
    } else if (user) {
      if (!user.comparePassword(req.body.password)) {
        res.status(401).json({ message: 'Authentication failed. Wrong password.' });
      } else {
        return res.json({token: jwt.sign({ email: user.email, fullName: user.fullName, _id: user._id}, 'mysecret', {expiresIn : 1200}), fullName:user.fullName});
      }
    }
  });
});


// middileware for verying token
app.use(function(req, res, next) {
  var token = req.body.token || req.query.token || req.headers['x-access-token'];
  // decode token
  if (token) {

    // verifies secret and checks exp
    jwt.verify(token, 'mysecret', function(err, decoded) {      
      if (err) {
        return res.json({ success: false, message: 'Failed to authenticate token.' });    
      } else {
        // if everything is good, save to request for use in other routes
        req.decoded = decoded;    
        next();
      }
    });

  } else {

    // if there is no token
    // return an error
    return res.status(403).send({ 
        success: false, 
        message: 'No token provided.' 
    });

  }
});

// route for chat box after user loggedin
app.get('/chat', function(req, res){
	res.sendFile(__dirname + '/views/chat.html');
});
// event handler to save chat to database 
eventEmitter.on('saveChat', function(msg){
  console.log(msg);
  var newChat = new chatModel();
  newChat.sender = msg.name;
  newChat.message = msg.text;
  newChat.save(function(err, msg) {
    if (err) {
      console.log(err);
    } else {
      console.log("chat saved");
    }
  });
});

// start socket connection

io.on('connection', function(socket){
    var username = '';

    chatModel.find({}, function(err, result){
      if (err) {
        console.log(err);
      }
      else{
      // emit event to fecht data to client side
      socket.emit('getMsg',result);
      }
    });

    // event hander for getting msg from client 
    socket.on('createMsg',function(msg){
      // firing event to save the new msg
      eventEmitter.emit('saveChat',msg);
      // firing event to display current msg what user typed
      io.emit('newMsg', {
        from:msg.name,
        msg:msg.text

      });
});
    // handling the event fired to notify new user joined
    socket.on('joinNotification',function(data){
      username = data.who;
      // sending notification to all except sender
      socket.broadcast.emit('newNotification', {
        who:data.who,
        notification:data.notification

      });
    });
    // event handler for notifying a user is typing
    socket.on('typingNotification', function(data){
      socket.broadcast.emit('newTypingNotification',{
        typist:data.typist,
        notification:data.notification
      });
    });

    socket.on('disconnect', function(){
      console.log('disconnected');
      // firing event when user loggout
      socket.broadcast.emit('newLeaveNotification', {
        who:username,
        notification:' left the chat!'

      });
    });
  });

server.listen(3000, function(){
 	console.log('Chat app listening on port 3000!')
 });