const port = 3000;
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
var docClient = new AWS.DynamoDB.DocumentClient();
var tableUser = 'User';
var tableMessage = 'Message'
/***************************FindUser */
function login(res, username, password) {
  var params = {
    TableName: tableUser,
    FilterExpression: 'username = :u and password = :p',
    ExpressionAttributeValues: {
      ':u': username,
      ':p': password
    },
  };
  docClient.scan(params, function (err, data) {
    if (err) {
      console.log(JSON.stringify(err, null, 2));
    } else {
      if (data.Items.length === 0) {
        return res.json({
          token: null
        })
      } else {
        var token = jwt.sign({ _id: data._id }, 'id')
        return res.json({
          token: token,
          user: data.Items
        })
      }
    }
  });
}
function getAll(res) {
  var params = {
    TableName: tableUser,
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
app.get('/api/getall', (req, res) => {
  getAll(res)
});
/***************************FindUserbyUsername */
function findUserbyUsername(res, username) {
  var params = {
    TableName: tableUser,
    FilterExpression: 'username = :u',
    ExpressionAttributeValues: {
      ':u': username
    },
  };
  docClient.scan(params, function (err, data) {
    if (err) {
      console.log(JSON.stringify(err, null, 2));
    } else {
      if (data.Items.length === 0) {
        return res.json({
          user: null
        })
      } else {
        return res.json({
          user: data.Items
        })
      }
    }
  });
}
app.post('/api/findbyusername', (req, res) => {
  findUserbyUsername(res, req.body.username)
});
/***************************logging */
app.post('/api/login', (req, res) => {
  login(res, req.body.email, req.body.password);
});
app.post('/api/checklogin', (req, res) => {
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
  var id = Math.floor(Math.random() * (max - min)) + min;
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
    TableName: tableUser,
    Item: input
  };
  docClient.put(params, function (err, data) {
    if (err) {
      console.log('User::save::error - ' + JSON.stringify(err, null, 2));
    } else {
      if (data === null) {
        return res.json({
          token: null,
          error: 'Đăng kí không thành công'
        })
      }
      return true
    }
  });
}
/***************************register */
app.post('/api/register', (req, res) => {
  saveUser(res, req.body.username, req.body.password, req.body.isAdmin, req.body.fullname, req.body.email, req.body.phone, req.body.birthday);
});
/***************************Get all user email, phone */
//Tìm mỗi user thôi
function getAllEmailPhone(res) {
  const userData = []
  var params = {
    TableName: tableUser,
    FilterExpression: 'isAdministrator = :u',
    ExpressionAttributeValues: {
      ':u': 0
    },
  };
  docClient.scan(params, function (err, data) {
    if (err) {
      console.log(JSON.stringify(err, null, 2));
    } else {
      data.Items.forEach(function (itemdata) {
        userData.push(itemdata.username)
      });
      // continue scanning if we have more items
      if (typeof data.LastEvaluatedKey != 'undefined') {
        params.ExclusiveStartKey = data.LastEvaluatedKey;
        docClient.scan(params, onScan);
      }
    }
    return res.json({ userData })
  });
}
app.get('/api/getAllEmailPhone', (req, res) => {
  docClient.scan(getAllEmailPhone(res));
})
/************get user by id */
function getUserbyID(res, id) {
  var params = {
    TableName: tableUser,
    FilterExpression: 'id = :u',
    ExpressionAttributeValues: {
      ':u': id
    },
  };
  docClient.scan(params, function (err, data) {
    if (data.Items.length === 0) {
      return res.json({
        user: null
      })
    } else {
      return res.json({
        user: data.Items
      })
    }
  });
}
app.post('/api/getUserbyID', (req, res) => {
  docClient.scan(getUserbyID(res, req.body.id));
})
/*************************Friend request */
function sendfriendrequest(socket, id, usernameReceived, msg) {
  /******Tim` username */
  var userReceived, userSend
  var params = {
    TableName: tableUser,
    FilterExpression: 'username = :u',
    ExpressionAttributeValues: {
      ':u': usernameReceived
    },
  };
  docClient.scan(params, function (err, data) {
    if (err) {
      console.log(JSON.stringify(err, null, 2));
    } else {
      userReceived = data.Items[0]
      /*********Luu request ben nhan */
      var params = {
        TableName: tableUser,
        FilterExpression: 'id = :u',
        ExpressionAttributeValues: {
          ':u': id
        },
      };
      docClient.scan(params, function (err, data) {
        userSend = data.Items[0]
        var paramReceived = {
          TableName: tableUser,
          Key: {
            'id': userReceived.id
          },
          UpdateExpression: 'SET #s = list_append(if_not_exists(#s, :empty_list), :r)',
          ExpressionAttributeNames: {
            '#s': 'receiveFr'
          },
          ExpressionAttributeValues: {
            ':r': [userSend.id, userSend.fullname, userSend.url_avatar, msg],
            ':empty_list': []
          },
          ReturnValues: 'UPDATED_NEW'
        };
        docClient.update(paramReceived, function (err, data) { });
      });
    }
    /*********Luu request ben gui */
    var paramSend = {
      TableName: tableUser,
      Key: {
        'id': id
      },
      UpdateExpression: 'SET #s = list_append(if_not_exists(#s, :empty_list), :r)',
      ExpressionAttributeNames: {
        '#s': 'sendFr'
      },
      ExpressionAttributeValues: {
        ':r': [usernameReceived],
        ':empty_list': []
      },
      ReturnValues: 'UPDATED_NEW'
    };
    docClient.update(paramSend, async function (err, data) {
      //Gui thong bao cho nguoi nhan
      if(err) console.log(err);
      setTimeout(()=>{
        socket.emit('friendRequest', usernameReceived)
      }, 600);
    });
  });
}
/************** getSendfriendrequest*/
function getSendfriendrequest(res, id) {
  var params = {
    TableName: tableUser,
    FilterExpression: 'id = :u',
    ExpressionAttributeValues: {
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
/************ getReceiveFriendRequest */
function getReceiveFriendRequest(res, username) {
  friendReq = []
  var params = {
    TableName: tableUser,
    FilterExpression: 'username = :u',
    ExpressionAttributeValues: {
      ':u': username
    },
  };
  docClient.scan(params, function (err, data) {
    if (err) {
      console.log(JSON.stringify(err, null, 2));
    } else {
      if (data.Items.length === 0) {
        user = null
      } else {
        user = data.Items
        var count = 0
        var id, fullname, url_avatar, msg
        if (typeof (user[0].receiveFr) != 'undefined') {
          user[0].receiveFr.forEach(e => {
            switch (count % 4) {
              case 0:
                id = e
                break
              case 1:
                fullname = e
                break
              case 2:
                url_avatar = e
                break
              case 3:
                msg = e
                friendReq.push({ id, fullname, url_avatar, msg })
                break
            }
            count++
          })
        }
        return res.json(friendReq)
      }
    }
  })
}
app.post('/api/getReceiveFriendRequest', (req, res) => {
  getReceiveFriendRequest(res, req.body.username)
});
/********************refuseFriendRequest*/
function removeSendFr(id, username){
    var params = {
      TableName: tableUser,
      FilterExpression: 'id = :u',
      ExpressionAttributeValues: {
        ':u': id
      },
    };
    docClient.scan(params, function (err, data) {
      if (data.Items.length === 0) {
        return res.json(false)
      }
      var index = 0
      data.Items[0].sendFr.forEach(e => {
        if(e === username){
          var paramRemove = {
            TableName: tableUser,
            Key: {
              'id': Number(id)
            },
            UpdateExpression: 'REMOVE sendFr[' + index + ']'
          };
          docClient.update(paramRemove, function (err, data) {});
        }
        index++
      });
    })
}
function removeReceiveFr(id, username){
  var params = {
    TableName: tableUser,
    FilterExpression: 'username = :u',
    ExpressionAttributeValues: {
      ':u': username
    },
  };
  docClient.scan(params, function (err, data) {
    if (err) {
      console.log(JSON.stringify(err, null, 2));
    } else {
      if (data.Items.length === 0) {
        return res.json(false)
      } else {
        index = 0
        data.Items[0].receiveFr.forEach(e => {
          if(e === id){
            var paramRemove = {
              TableName: tableUser,
              Key: {
                'id': data.Items[0].id
              },
              UpdateExpression: 'REMOVE receiveFr[' + index + '], receiveFr[' + (index+1) + '], receiveFr[' + (index+2) + '], receiveFr[' + (index+3) + ']'
            };
            docClient.update(paramRemove, function (err, data) {});
            index++
          }
        })
      }
    }
  });
}
app.post('/api/refuseFriendRequest', (req, res) => {
  removeSendFr(req.body.id, req.body.username)
  removeReceiveFr(req.body.id, req.body.username)
});
/***********************acceptFriendReq */
function acceptFriendReq(socket, id, username){
  var params = {
    TableName: tableUser,
    FilterExpression: 'username = :u',
    ExpressionAttributeValues: {
      ':u': username
    },
  };
  docClient.scan(params, function (err, data) {
    if (err) {
      console.log(JSON.stringify(err, null, 2));
    } else {
      if (data.Items.length === 0) {
        return res.json(false)
      } else {
        var userA = data.Items[0]
        var paramsB = {
          TableName: tableUser,
          FilterExpression: 'id = :u',
          ExpressionAttributeValues: {
            ':u': id
          },
        };
        docClient.scan(paramsB, function (err, data) {
          if(err) console.log(err);
          var userB = data.Items[0]
          var paramUserA = {
            TableName: tableUser,
            Key: {
              'id': userA.id
            },
            UpdateExpression: 'SET #s = list_append(if_not_exists(#s, :empty_list), :r)',
            ExpressionAttributeNames: {
              '#s': 'friendlist'
            },
            ExpressionAttributeValues: {
              ':r': [userB.id, userB.username],
              ':empty_list': []
            },
            ReturnValues: 'UPDATED_NEW'
          };
          docClient.update(paramUserA, function (err, data) {
            if(err) console.log(err);
            socket.emit('newfriend', userA.id)
          });
          var paramUserB = {
            TableName: tableUser,
            Key: {
              'id': userB.id
            },
            UpdateExpression: 'SET #s = list_append(if_not_exists(#s, :empty_list), :r)',
            ExpressionAttributeNames: {
              '#s': 'friendlist'
            },
            ExpressionAttributeValues: {
              ':r': [userA.id, userA.username],
              ':empty_list': []
            },
            ReturnValues: 'UPDATED_NEW'
          };
          docClient.update(paramUserB, function (err, data) { 
            if(err) console.log(err);
            socket.emit('newfriend', id)
          });
          removeSendFr(userB.id, userA.username)
          removeReceiveFr(userB.id, userA.username)
          createRoom(userA, userB)
        })
      }
    }
  })
}
function createRoom(userA, userB){
  var max = 9999999999;
  var min = 1000000000;
  var id = Math.floor(Math.random() * (max - min)) + min;
  var input = {
    'idRoom': id,
    'listUser': [userA.id, userB.id],
    'info': [userA.id, userA.fullname, userA.url_avatar, userB.id, userB.fullname, userB.url_avatar]
  };
  var params = {
    TableName: tableMessage,
    Item: input
  };
  docClient.put(params, function (err, data) {
    if (err) {
      console.log('Room::save::error - ' + JSON.stringify(err, null, 2));
    }
    var paramReceived = {
      TableName: tableUser,
      Key: {
        'id': userA.id
      },
      UpdateExpression: 'SET #s = list_append(if_not_exists(#s, :empty_list), :r)',
      ExpressionAttributeNames: {
        '#s': 'chats'
      },
      ExpressionAttributeValues: {
        ':r': [id],
        ':empty_list': []
      },
      ReturnValues: 'UPDATED_NEW'
    };
    docClient.update(paramReceived, function (err, data) { });
    var paramReceived = {
      TableName: tableUser,
      Key: {
        'id': userB.id
      },
      UpdateExpression: 'SET #s = list_append(if_not_exists(#s, :empty_list), :r)',
      ExpressionAttributeNames: {
        '#s': 'chats'
      },
      ExpressionAttributeValues: {
        ':r': [id],
        ':empty_list': []
      },
      ReturnValues: 'UPDATED_NEW'
    };
    docClient.update(paramReceived, function (err, data) { });
  });
}
/***********************getFriendlist */
function getFriendlist(res, id) {
  var params = {
    TableName: tableUser,
    FilterExpression: 'id = :u',
    ExpressionAttributeValues: {
      ':u': id
    },
  };
  docClient.scan(params, function (err, data) {
    if (err) {
      console.log(JSON.stringify(err, null, 2));
    } else {
      if (data.Items.length === 0) {
        return res.json(null)
      } else {
        return res.json(data.Items[0].friendlist)
      }
    }
  })
}
app.post('/api/getFriendlist', (req, res) => {
  getFriendlist(res, req.body.id)
});
/************ getChatRoomInfo */
function getChatRoomInfo(res, id){
  var params = {
    TableName: tableMessage,
    FilterExpression: 'idRoom = :u',
    ExpressionAttributeValues: {
      ':u': id
    },
  };
  docClient.scan(params, function (err, data) {
    if(err) console.log(err);
    if(typeof(data.Items[0].idRoom) != 'undefined')
      res.json({
        'idRoom': data.Items[0].idRoom,
        'info': data.Items[0].info
      })
  })
}
app.post('/api/getChatRoomInfo', (req, res) => {
  getChatRoomInfo(res, req.body.id)
});
/**************getUserChats */
function getUserChats(res, id) {
  var params = {
    TableName: tableUser,
    FilterExpression: 'id = :u',
    ExpressionAttributeValues: {
      ':u': id
    },
  };
  docClient.scan(params, function (err, data) {
    res.json(data.Items[0].chats)
  })
}
app.post('/api/getUserChats', (req, res) => {
  getUserChats(res, req.body.id)
});
/***************************LockUser */
function updateStatus(res, id, staus) {
  var params = {
    TableName: tableUser,
    Key: {
      'id': Number(id)
    },
    UpdateExpression: 'set #ts = :r',
    ExpressionAttributeValues: {
      ':r': staus
    },
    ExpressionAttributeNames: {
      '#ts': 'status'
    }
  };
  docClient.update(params, function (err, data) {
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
io.on('connection', function (socket) {
  //Mess
  socket.on('join-room', idRoom => {
    socket.join(idRoom);
  })
  socket.on('Client-Send-Message', async (idRoom, idUserSend, message) => {
    await saveChat(idRoom, idUserSend, message);
    await io.to(idRoom).emit('Server-Send-Message', message, socket.id);
  });
  //Friend request
  socket.on('sendFriend', ({ id, usernameReceived, msg }) => {
    sendfriendrequest(socket, id, usernameReceived, msg)
  })

  socket.on('acceptFriend', ({id, username}) =>{
    acceptFriendReq(socket, id, username)
  })
});
/***************************saveChat */
let saveChat = function (idRoom, idUserSend, message) {
  var today = new Date();
  var date = today.getDate() + '-' + (today.getMonth() + 1) + '-' + today.getFullYear();
  var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  var dateTime = date + ' ' + time;
  //save chat
  var paramReceived = {
    TableName: tableMessage,
    Key: {
      'idRoom': idRoom
    },
    UpdateExpression: 'SET #s = list_append(if_not_exists(#s, :empty_list), :r)',
    ExpressionAttributeNames: {
      '#s': 'listMess'
    },
    ExpressionAttributeValues: {
      ':r': [idUserSend, message, dateTime.toString()],
      ':empty_list': []
    },
    ReturnValues: 'UPDATED_NEW'
  };
  docClient.update(paramReceived, function (err, data) {
    if (err) {
      console.log("mess::save::error - " + JSON.stringify(err, null, 2));
    } else {
      console.log("mess::save::success");
    }
  });
}
/***************************getChat */
function getChats (res, idRoom) {
  var params = {
    TableName: tableMessage,
    FilterExpression: "idRoom = :u",
    ExpressionAttributeValues: {
      ":u": idRoom
    },
  };
  docClient.scan(params, function (err, data) {
    if (err) {
      console.log(JSON.stringify(err, null, 2));
    } else {
      if (data.Items.length === 0) {
        console.log("null");
      } else {
        res.json(data.Items[0]['listMess'])
      }
    }
  });
}
app.post('/api/getChats', (req, res) => {
  getChats(res, req.body.id)
});
/***************************findroom */