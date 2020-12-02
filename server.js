const port = 3000;
const HOST = 'localhost';
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken") 

var express = require('express');
var cookieParser = require('cookie-parser')
 
var app = express()
var server = require('http').createServer(app);
app.use(bodyParser.json());
app.use(cookieParser())
app.use(express.static(process.cwd()+"/Saza/dist/Chatvia/"));

/***************************DynamoDB */
var AWS = require("aws-sdk");
AWS.config.update({
  region: "ap-southeast-1",
  endpoint: "http://dynamodb.ap-southeast-1.amazonaws.com",
  accessKeyId:"AKIA5WDQBAFZ5U7AQIPJ",
  secretAccessKey:"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"
});
var dynamodb = new AWS.DynamoDB();
var docClient = new AWS.DynamoDB.DocumentClient();
var tableName = "User";
/***************************FindUser */
function login(res, username, password){
  var params = {
      TableName : tableName,
      FilterExpression  : "username = :u and password = :p",
      ExpressionAttributeValues:{
          ":u": username,
          ":p": password
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
/***************************FindUserbyUsername */
function FindUserbyUsername(res, username){
  var params = {
      TableName : tableName,
      FilterExpression  : "username = :u",
      ExpressionAttributeValues:{
          ":u": username
      },
  };
  docClient.scan(params, function (err, data) {
    if (err) {
        console.log(JSON.stringify(err, null, 2));
    } else {
        console.log(data);
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
  FindUserbyUsername(res, req.body.username)
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
let saveUser = function (res, username, password, fullname, email, phone, birthday) {
  var max = 999999;
  var min = 100000;
  var id = Math.floor(Math.random() * (max - min) ) + min;
  var input = {
          id: id,
          'username': username,
          'password': password,
          'fullname': fullname,
          'nickname': fullname, //Mặc định lúc đầu nick = fullname
          'isAdministrator': 0, //Người dùng bình thường
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
      TableName: "User",
      Item: input
  };
  docClient.put(params, function (err, data) {
      if (err) {
          console.log("User::save::error - " + JSON.stringify(err, null, 2));
      } else {
          console.log("User::save::success" );
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
    saveUser(res, req.body.username, req.body.password, req.body.fullname, req.body.email, req.body.phone, req.body.birthday);
});
/***************************Get all user email, phone */
//Tìm mỗi user thôi
function getAllEmailPhone(res){
  const userData = []
  var params = {
      TableName : tableName,
      FilterExpression  : "isAdministrator = :u",
      ExpressionAttributeValues:{
          ":u": 0
      },
  };
  docClient.scan(params, function (err, data) {
    if (err) {
        console.log(JSON.stringify(err, null, 2));
    } else {
      data.Items.forEach(function(itemdata) {
        if(itemdata.phone != ' ')
          userData.push(itemdata.phone)
        if(itemdata.email != ' ')
          userData.push(itemdata.email)
      });
      // continue scanning if we have more items
      if (typeof data.LastEvaluatedKey != "undefined") {
        console.log("Scanning for more...");
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
/***************************Chat */
app.get('/api/', (req, res) => {
  try {
    var token = req.cookies.token;
    var check = jwt.verify(token, 'id');
    if(check){
      
    }
  } catch (error) {
    return res.redirect('/account/login');
  }
});
/***************************Server listening */
server.listen(process.env.PORT || port);
