const socket = io();

let userName = '';
let userList = [];

let loginPage = document.querySelector('#loginPage')
let chatPage = document.querySelector('#chatPage')
let loginInput = document.querySelector('#loginNameInput')
let textInput = document.querySelector('#chatTextInput')

loginPage.style.display = 'flex';
chatPage.style.display = 'none';

// FUNCTIONS +++++++++++++++++++++++++++++++++++
function renderUserList() {
    let ul = document.querySelector('.userList');
    ul.innerHTML = '';

    userList.forEach(user => {
        ul.innerHTML += '<li>' + user + '</li>';
    });
}

function addMessage(type, user, msg) {
    let ul = document.querySelector('.chatList');

    switch (type) {
        case 'status':
            ul.innerHTML += '<li class="m-status">' + msg + '</li>';
        break;
        case 'msg':
            // Não é a melhor verificação, pois pode haver mais de uma pessoa com o mesmo nome no chat
            if (userName == user) {
                ul.innerHTML += '<li class="m-txt"><span class="me">' + user + '</span> ' + msg + '</li>';
            } else {
                ul.innerHTML += '<li class="m-txt"><span>' + user + '</span> ' + msg + '</li>';
            }

        break;
    }

    // Scroll sempre no final
    ul.scrollTop = ul.scrollHeight;
}

//EVENT LISTENER +++++++++++++++++++++++++++++++
loginInput.addEventListener('keyup', (e) => {
    if (e.keyCode === 13) { // tecla 'Enter'
        let name = loginInput.value.trim();

        if (name != '') {
            userName = name;
            document.title = 'Chat (' + userName + ')'

            socket.emit('join-request', userName);
        }
    }
});

textInput.addEventListener('keyup', (e) => {
    if (e.keyCode === 13) {
        let txt = textInput.value.trim();

        textInput.value = '';

        if (txt !== '') {
            socket.emit('send-msg', txt); //manda a msg para o servidor
        }
    }
});

//SOCKETS ++++++++++++++++++++++++++++++++++++++
socket.on('user-ok', (list) => {
    loginPage.style.display = 'none';
    chatPage.style.display = 'flex';
    textInput.focus();

    addMessage('status', null, 'Conectado!')

    userList = list;

    renderUserList();
});

socket.on('list-update', (data) => {

    //Alguém entrou no chat
    if (data.joined) {
        addMessage('status', null, data.joined + ' entrou no chat.')
    }

    //Alguém saiu do chat
    if (data.left) {
        addMessage('status', null, data.left + ' saiu do chat.')
    }

    userList = data.list;
    renderUserList();
});

socket.on('show-msg', (data) => {
    addMessage('msg', data.userName, data.message);
});

//Quando a conexão da sala de bate papo parar de funcionar
socket.on('disconnect', () => {
    addMessage('status', null, 'Você foi desconectado!');

    //Renderiza a lista de usuários sem nada
    userList= [];
    renderUserList();

    //Desabilita o input do chat
    textInput.disabled = true;
});

//Tentando reconectar a sala de bate papo
socket.on('connect_error', () => {
    addMessage('status', null, 'Tentando reconectar...')
})

//Quando a sala de bate papo conseguir reconectar
socket.on('connect', () => {
    addMessage('status', null, 'Reconectado!')
    textInput.disabled = false;

    //Reconecta o usuário automaticamente, não sendo necessário retornar à tela de login
    if(userName !== ''){
        socket.emit('join-request', userName);
    }
})