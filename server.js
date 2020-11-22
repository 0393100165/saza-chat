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
      }
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
              data : data.Items
              if(data == null){
                return res.json({
                  token: null
                })
              }else{
                var token = jwt.sign({_id: data._id}, 'id')
                return res.json({
                  token: token
                })
              }
          }
      }
  });
}
/***************************logging */
app.post('/api/login', (req, res) =>{
  findUserbyIDPass(res, req.body.email, req.body.password);
});
/***************************Chat */

/***************************Server listening */
server.listen(process.env.PORT || port);