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
  accessKeyId:"AKIA5WDQBAFZ2OKJ4OMD",
  secretAccessKey:"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"
});
var dynamodb = new AWS.DynamoDB();
var docClient = new AWS.DynamoDB.DocumentClient();
var tableName = "User";
/***************************FindUserbyIDPass */
function findUserbyIDPass(res, ID, pass){
  var params = {
      TableName : tableName,
      FilterExpression  : "username = :r and password = :t",
      ExpressionAttributeValues:{
          ":r": ID,
          ":t": pass
      },
      Limit : 1
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
            // data : data.Items
          
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
  findUserbyIDPass(res, req.body.email, req.body.password);
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
let saveUser = function (ho,ten,pass,sdt,email,username,res) {
  var id = Math.random();
  var input = {
          id:id,
          firstName: ho,
          lastName: ten,
          password:pass,
          stage: 1,
          phone:sdt,
          email:email,
          token:"1",
          username : username
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
              token: null
            })
          } else{
            // data : data.Items
             
            var token = jwt.sign({_id: data._id}, 'id')
            return res.json({
              token: token,
              user: data
            }) 
          }
      }
  });
}
/***************************register */
app.post('/api/register', (req, res) => {
    console.log(req.body.username, req.body.password, req.body.fullname, req.body.birthday);
    // saveUser(req.body.fnameUser,req.body.fnameUser,req.body.password,req.body.phone,req.body.email,req.body.username,res);
});
/***************************Chat */
app.get('/api/', (req, res) => {
  try {
    var token = req.cookies.token;
    var check = jwt.verify(token, 'id');
    console.log(check);
    if(check){
      
    }
  } catch (error) {
    return res.redirect('/account/login');
  }
});
/***************************Server listening */
server.listen(process.env.PORT || port);
