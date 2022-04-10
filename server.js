
const express = require ('express');
const path = require ('path');
const http = require ('http');
const socketIO = require('socket.io')

const dotenv = require ('dotenv');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

server.listen(process.env.PORT);

app.use(express.static(path.join(__dirname, 'public')));

let connectedUsers = [];

io.on('connection', (socket) => {
    console.log("Conexão detectada...");

    socket.on('join-request', (userName) => {
        socket.userName = userName;
        connectedUsers.push ( userName );

        console.log( connectedUsers );
    });
})