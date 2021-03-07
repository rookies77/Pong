const express = require('express');
const app = express();
const fs = require('fs');
const http = require('http');
const path = require('path');
const bodyParser = require('body-parser');
const mongodb = require('mongodb');
const port = process.env.PORT || 8080;
const socketIO = require('socket.io');
const session = require('express-session');
// const dbUrl = "mongodb+srv://rookies:Rukaka77@cluster0.qotkq.mongodb.net/test";
const dbUrl = "mongodb://localhost:27017/atelier-back";
const collectionName = 'game';
const dbName = "aterlier-back";
const chalk = require('chalk');
const collision = require('../annexe_js/collision.js')

let chalkColor;

function consoleLog(arg1, arg2, arg3) { // fonctionne sur serveur node 

  switch (arg2) {
    case 'red':
      chalkColor = chalk.red;
      break
    case 'blue':
      chalkColor = chalk.blue;
      break
    case 'green':
      chalkColor = chalk.green;
      break
    case 'yellow':
      chalkColor = chalk.yellow;
      break
    case 'cyan':
      chalkColor = chalk.cyan;
      break
  }
  console.log(chalkColor(arg1, arg3))
}





app.set('view engine', 'pug');
app.use('/src', express.static(__dirname + '/src'))
app.use('/js', express.static(__dirname + '/'))
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(session({
  secret: 'mon-sercret',
  saveUninitialized: false,
  resave: false,
  cookies: {}
}))

app.get('/', (req, res) => {
  res.render('index.pug', {
    title: 'Le jeu du Pong'
  })
});

app.post('/game', (req, res, next) => {
  let toto = req.body.pseudo;
  players.name = toto;
  console.log('pseudo post : ', players);
  consoleLog('pseudo par la methode POST', 'blue', players);


  mongodb.MongoClient.connect(dbUrl, {
    useUnifiedTopology: true
  }, (error, client) => {
    if (error) {
      return next(error);
    } else {
      const db = client.db();
      db.collection('game', (error, collection) => {
        if (error) {
          return next(error);
        } else {
          collection.insertOne(players)
        }
      })
    }
  })

  console.log('dataAsObject:', players)

  res.render('game.pug', {
    title: 'Bienvenue dans le jeu du Pong',
    pseudo: req.body.pseudo,
  })

})

app.get('/waiting-room', (req, res, next) => {
  res.render('waiting-room.pug', {
    title: 'Page d\'attente !'
  })
});

app.all('*', (req, res, next) => {
  next(new Error('page not found'));
});

app.use((error, req, res, next) => {
  res.status(500);
  res.render('server-error.pug', {
    title: 'Server Error 500'
  })
});

const server = app.listen(port, () => {
  console.log('on ecoute sur le port ...')
})



//------------------------------------------ Player ------------------------------------------//
class Player {
  constructor(id, width, height, color, xPos, yPos) {
    this.id = id;
    this.width = width;
    this.height = height;
    this.color = color;
    this.xPos = xPos;
    this.yPos = yPos;
  }
  inGame = false;
  socketId = 0;
  ip = '';
}
//------------------------------------------ Ball ------------------------------------------//
class Ball {
  xOldPos = -1;
  yOldPos = -1;

  constructor(radius, color, xPos, yPos, speed, dx, dy) {
    this.radius = radius;
    this.color = color;
    this.xPos = xPos;
    this.yPos = yPos;
    this.speed = speed;
    this.dx = dx;
    this.dy = dy;
  }

  moveBall(ball) {
    // ball.xOldPos = ball.xPos;
    // ball.yOldPos = ball.yPos;

    ball.xPos += ball.speed * ball.dx;
    ball.yPos += ball.speed * ball.dy;
  }
}
//------------------------------------------ Canvas ------------------------------------------//

class Canvas {
  constructor(width, height) {
    this.width = width;
    this.height = height;
  }
}

//------------------------------------------ Initialisation ------------------------------------------//
const maxPlayer = 2;
let listConnectedIp = [];
let allSocketId = [];
let playersInGame = 0;
let interval;
let canvas = new Canvas(800, 500)
let ball = new Ball(10, '#333', canvas.width / 2, canvas.height / 2, 3, 2, 2);
let players = []
//   new Player(0, 10, 75, 'blue', 0, canvas.height / 2),
//   new Player(1, 10, 75, 'brown', canvas.width - 10, canvas.height / 2),
// ]
let player1;
let player2;
let playerId = -1;
let allSocket = [];

// SOCKET IO SERVER **************************************************
const io = socketIO(server);



io.on('connection', function (socket) {
  console.log('on est connecté en socketIO') // lorsqu'on esr connecté
  if (playersInGame < maxPlayer) {

    if (allSocket.length != 0) {

      player2 = new Player(1, 10, 75, 'brown', canvas.width - 10, canvas.height / 2)
      player2.inGame = true;
      player2.id = socket.id
      allSocket.push(player2.id);
      playersInGame += 1;
      players.push(player2)
    }else{
      player1 = new Player(0, 10, 75, 'blue', 0, canvas.height / 2)
      player1.inGame = true;
      player1.id = socket.id;
      allSocket.push(player1.id);
      playersInGame += 1;
      players.push(player1)
    }
 
      
    



  }

  console.log('playerIn GAME ', playersInGame)
  // if (playersInGame < maxPlayer) {
  //   let currentPlayer = 0;
  //   while (players[currentPlayer].inGame && currentPlayer < playersInGame) {
  //     currentPlayer += 1;
  //   }
  //   allSocketId.push(socket.id);
  //   players[currentPlayer].ip = socket.handshake.address;
  //   players[currentPlayer].socketId = socket.id;
  //   players[currentPlayer].inGame = true;
  //   playerId = players[currentPlayer].id;
  //   playersInGame += 1;
  //   consoleLog('currentplayer', 'blue', players[currentPlayer].id)
  // }
  socket.emit('donnésDuCanvasDuServer', canvas);
  // socket.emit('connexionDuJoueur', playerId);

  // consoleLog('playerID','yellow', playerId)

  socket.on('start-game', () => {
    clearInterval(interval);
    let currentTime = new Date();
    let startTime = currentTime;
    let differentTime = 0;

    ball.xPos = canvas.width / 2;
    ball.yPos = canvas.height / 2;

    // boucle du jeu

    interval = setInterval(() => {
      currentTime = new Date();
      differentTime = (currentTime - startTime) / 1000; // seconde ecoulé depuis le debut du temps
      ball.moveBall(ball)
      collision.wallCollision(ball, canvas)

      io.emit('draw-everything', {
        ball: ball,
        players
      });
    }, (1000 / 60));

    console.log('player tableau', players)

  })
  // console.log('allsocketId ', allSocketId)
  // consoleLog('allSocketId.length : ', 'green', allSocketId.length)
  socket.on('envoieDuMovementY', (data) => {
    // console.log('playerId envoie',playerId)
    console.log(data)
    if (data.socketId == player1.id) {
      player1.yPos = data.moveY;
    }
    
    // if(data.socketId == player2.id){
    //   player2.yPos = data.moveY
    // }
    // console.log('player1 id ', player1.id)
    // if (player2) {
    //   console.log('player2 id ', player2.id)
    // }

    // console.log('allsocket ', allSocket)
    // if (player2.id == 1) {
    //   player2.yPos = data;
    // }



  })






  mongodb.MongoClient.connect(dbUrl, {
    useUnifiedTopology: true
  }, (error, client) => {

    if (!error) {
      const db = client.db();
      db.collection('game', (error, collection) => {
        console.log('on est connecté sur mongodb dont la base de donnée est : ', collection.namespace)
        const cursor = collection.find({});
        // console.log('cursor:', cursor)
        cursor.toArray((error, document) => {
          if (!error) {

            socket.emit('envoieMessage', document)
            // console.log(document)
          }
        })
      })
    }
  })

  consoleLog('tableau allsocket', 'yellow', allSocket)

  // --------- Déconnexion du client ---------//
  socket.on('disconnect', () => {
    allsocket = []
    let index = listConnectedIp.indexOf({
      address: socket.handshake.address,
      id: playerId
    });
    listConnectedIp.splice(index, 1);
    io.emit('get-connected-ip', listConnectedIp);

    if (playerId != -1) {
      playersInGame--;
      players[playerId].inGame = false;
      players[playerId].ip = "";
    }
  })



})