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
let saveUser = function (username, password, fullname, email, phone, birthday, res) {
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
    //Kiểm tra số điện thoại & email
    var username = req.body.username
    
    if(!isNaN(username)){
      const re = /[0-9]{9,11}$/ //Kiểm tra sô đt
      if(re.test(String(username))){
        //Username là số dt
        saveUser(username, req.body.password, req.body.fullname, ' ', username, req.body.birthday, res);
      }else{
        return res.json({
          token: null,
          error: 'Tên người dùng không hợp lệ'
        })
      }
    }else{
      //Check Email
      const re = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
      username = username.toLowerCase()
      if(re.test(String(username))){
        //username là Email
        saveUser(username, req.body.password, req.body.fullname, username, ' ', req.body.birthday, res);
      }else{
        return res.json({
          token: null,
          error: 'Tên người dùng không hợp lệ'
        })
      }
    }
});
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
