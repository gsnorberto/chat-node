
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

    //Quando alguém entra no chat
    socket.on('join-request', (userName) => {
        socket.userName = userName;
        connectedUsers.push ( userName );

        //console.log( connectedUsers );

        //Alguém entrou no chat
        socket.emit('user-ok', connectedUsers);

        //Emitir para todos os usuários conectados ao chat quem acabou de entrar
        socket.broadcast.emit('list-update', {
            joined: userName,
            list: connectedUsers
        });
    });

    //Quando alguém sai do chat
    socket.on('disconnect', () => {
        connectedUsers = connectedUsers.filter(u => u != socket.userName);

        socket.broadcast.emit('list-update', {
            left: socket.userName,
            list: connectedUsers
        })
    });

    //Recebe a mensagem do chat enviada pelo usuário
    socket.on('send-msg', (txt) => {
        let data = {
            userName: socket.userName,
            message: txt
        };

        //Manda a mensagem para o próprio usuário
        socket.emit('show-msg', data)

        //Manda a mensagem para os outros chats online
        socket.broadcast.emit('show-msg', data)
    })
})