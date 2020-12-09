const app = require('express')();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
io.on('connection', (socket) => {
    console.log('connect')
    socket.emit('XXX', [12,31,2])
});
server.listen(8000, () => {
    console.log('appp connected');
});