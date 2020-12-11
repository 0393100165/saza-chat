const port = 3000;
const HOST = 'localhost';
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken") 
const cors = require('cors');
const express = require('express');
const cookieParser = require('cookie-parser')

const app = express()
const server = require('http').createServer(app);
const io = require('socket.io')(server);

app.use(cors({
  origin: true,
  credentials: 'include',
  methods: 'POST,PUT,PATCH,GET',
}));
app.use(bodyParser.json());
app.use(cookieParser())

/***************************Server listening */
server.listen(process.env.PORT || port);
/***************************DynamoDB */
var AWS = require('aws-sdk');
AWS.config.update({
  region: 'ap-southeast-1',
  endpoint: 'http://dynamodb.ap-southeast-1.amazonaws.com',
});
var dynamodb = new AWS.DynamoDB();
var docClient = new AWS.DynamoDB.DocumentClient();
var tableName = 'User';
/***************************FindUser */
function login(res, username, password){
  var params = {
      TableName : tableName,
      FilterExpression  : 'username = :u and password = :p',
      ExpressionAttributeValues:{
          ':u': username,
          ':p': password
      },
  };
  docClient.scan(params, function (err, data) {
    if (err) {
        console.log(JSON.stringify(err, null, 2));
    } else {
        if(data.Items.length === 0){
          return res.json({
            token: null
          })
        } else{
          var token = jwt.sign({_id: data._id}, 'id')
          return res.json({
            token: token,
            user: data.Items
          })
        }
    }
  });
}
function getAll(res){
  var params = {
      TableName : tableName,
  };
  docClient.scan(params, function (err, data) {
    if (err) {
        console.log(JSON.stringify(err, null, 2));
    } else {
      return res.json({
        user: data.Items
      })      
    }
  });
}
app.get('/api/getall', (req, res) =>{
  getAll(res)
});
/***************************FindUserbyUsername */
function findUserbyUsername(res, username){
  var params = {
      TableName : tableName,
      FilterExpression  : 'username = :u',
      ExpressionAttributeValues:{
          ':u': username
      },
  };
  docClient.scan(params, function (err, data) {
    if (err) {
        console.log(JSON.stringify(err, null, 2));
    } else {
        if(data.Items.length === 0){
          return res.json({
            user: null
          })
        } else{
          return res.json({
            user: data.Items
          })
        }
    }
  });
}
app.post('/api/findbyusername', (req, res) =>{
  findUserbyUsername(res, req.body.username)
});
/***************************logging */
app.post('/api/login', (req, res) =>{
  login(res, req.body.email, req.body.password);
});
app.post('/api/checklogin', (req, res) =>{
  try {
    var token = req.body.token;
    var check = jwt.verify(token, 'id');
    return check;
  } catch (error) {
    return res.redirect('/account/login');
  }
});
/***************************saveUser */
let saveUser = function (res, username, password, isAdmin, fullname, email, phone, birthday) {
  var max = 999999;
  var min = 100000;
  var id = Math.floor(Math.random() * (max - min) ) + min;
  var input = {
          id: id,
          'username': username,
          'password': password,
          'fullname': fullname,
          'nickname': fullname, //Mặc định lúc đầu nick = fullname
          'isAdministrator': isAdmin,
          'status': 'Đang hoạt động',
          'phone': phone,
          'email': email,
          'sex': 'Không xác định', //Mặc định
          'birthday': birthday,
          'address': ' ',
          'status_message': ' ',
          'url_avatar': 'assets/images/users/default.png', //avatar mặc định
       };
  var params = {
      TableName: 'User',
      Item: input
  };
  docClient.put(params, function (err, data) {
      if (err) {
          console.log('User::save::error - ' + JSON.stringify(err, null, 2));
      } else {
          console.log('User::save::success' );
          if(data === null){
            return res.json({
              token: null,
              error: 'Đăng kí không thành công'
            })
          } else{
            login(res, username, password);
          }
      }
  });
}
/***************************register */
app.post('/api/register', (req, res) => {
    saveUser(res, req.body.username, req.body.password, req.body.isAdmin, req.body.fullname, req.body.email, req.body.phone, req.body.birthday);
});
/***************************Get all user email, phone */
//Tìm mỗi user thôi
function getAllEmailPhone(res){
  const userData = []
  var params = {
      TableName : tableName,
      FilterExpression  : 'isAdministrator = :u',
      ExpressionAttributeValues:{
          ':u': 0
      },
  };
  docClient.scan(params, function (err, data) {
    if (err) {
        console.log(JSON.stringify(err, null, 2));
    } else {
      data.Items.forEach(function(itemdata) {
          userData.push(itemdata.username)
      });
      // continue scanning if we have more items
      if (typeof data.LastEvaluatedKey != 'undefined') {
        console.log('Scanning for more...');
        params.ExclusiveStartKey = data.LastEvaluatedKey;
        docClient.scan(params, onScan);
      }
    }
    return res.json({userData})
  });
}
app.get('/api/getAllEmailPhone', (req, res) => {
  docClient.scan(getAllEmailPhone(res));
})
/*************************Friend request */
function sendfriendrequest(id, usernameReceived, msg){
  /******Tim` username */
  var user
  var params = {
    TableName : tableName,
    FilterExpression  : 'username = :u',
    ExpressionAttributeValues:{
        ':u': usernameReceived
    },
  };
  docClient.scan(params, function (err, data) {
    if (err) {
        console.log(JSON.stringify(err, null, 2));
    } else {
      if(data.Items.length === 0){
        user = null
      } else{
        user = data.Items
        /*********Luu request ben nhan */
        var paramReceived = {
        TableName : tableName,
        Key :{
            'id' : user[0].id
        },
        UpdateExpression : 'SET #s = list_append(if_not_exists(#s, :empty_list), :r)',
        ExpressionAttributeNames:{
            '#s': 'receiveFr'
        },
        ExpressionAttributeValues: {
          ':r': [usernameReceived, msg],
          ':empty_list': []
        },
          ReturnValues: 'UPDATED_NEW'
        };
        docClient.update(paramReceived, function(err, data) {});
      }
    }
    /*********Luu request ben gui */
    var paramSend = {
      TableName : tableName,
      Key :{
          'id' : id
      },
      UpdateExpression : 'SET #s = list_append(if_not_exists(#s, :empty_list), :r)',
      ExpressionAttributeNames:{
          '#s': 'sendFr'
      },
      ExpressionAttributeValues: {
        ':r': [user[0].username],
        ':empty_list': []
      },
      ReturnValues: 'UPDATED_NEW'
    };
    docClient.update(paramSend, function(err, data) {});
  });
}

/************** getSendfriendrequest*/
function getSendfriendrequest(res, id){
  var params = {
    TableName : tableName,
    FilterExpression  : 'id = :u',
      ExpressionAttributeValues:{
          ':u': id
      },
  };
  docClient.scan(params, function (err, data) {
    if (err) {
        console.log(JSON.stringify(err, null, 2));
    } else {
      return res.json(data.Items[0].sendFr)
    }
  });
}
app.post(('/api/getSendfriendrequest'), (req, res) => {
  getSendfriendrequest(res, req.body.id)
})
/***************************LockUser */
function updateStatus(res, id, staus){
  var params = {
    TableName : tableName,
    Key :{
        'id' : Number(id)
    },
    UpdateExpression : 'set #ts = :r',
    ExpressionAttributeValues:{
        ':r': staus
    },
    ExpressionAttributeNames:{
      '#ts': 'status'
    }
  };
  docClient.update(params, function(err, data) {
    if (err) {
      return res.json(false)
    } else {
      return res.json(true)
    }
  });
}
app.post('/api/lockuser', (req, res) => {
  updateStatus(res, req.body.id, 'lock')
});
app.post('/api/unlockuser', (req, res) => {
  updateStatus(res, req.body.id, 'Đang hoạt động')
});
/***************************Chat */
io.on('connection', function(socket) {
  //Mess
  socket.on("Client-Send-Message",function(message){
    socket.emit("Server-Send-Message",message);
    console.log(message);
  });

  //Friend request
  socket.on('sendFriend', ({id, usernameReceived, msg}) => {
    sendfriendrequest(id, usernameReceived, msg)
    socket.emit('friendRequest', id)
  })
});