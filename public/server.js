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
const dbUrl = "mongodb+srv://rookies:Rukaka77@cluster0.qotkq.mongodb.net/test";
// const dbUrl = "mongodb://localhost:27017/atelier-back";
const collectionName = 'game';
const dbName = "aterlier-back";
const chalk = require('chalk');
let playerExpress = {};
let players = {}; // les joueurs du pong
let score1 = 2;
let score2 = 2;
let chalkColor;
let differentTime = 0;
let currentPlayer = 0;


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
  if (!playerExpress.player1) {
    playerExpress.player1 = toto;
  } else if (!playerExpress.player2) {
    playerExpress.player2 = toto;
  }

  res.render('game.pug', {
    title: 'Bienvenue dans le jeu du Pong',
    pseudo: req.body.pseudo, // affichage du nom du joueur en front
  })

})

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
  console.log('on ecoute sur le port ...', port)
})

//------------------------------------------ Player ------------------------------------------//


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
let playersInGame = 0;
let interval;
let canvas = new Canvas(800, 500)
let ball = new Ball(10, '#333', canvas.width / 2, canvas.height / 2, 3, 2, 2);


// SOCKET IO SERVER **************************************************
const io = socketIO(server);

io.on('connection', function (socket) {
  console.log('on est connecté en socketIO', socket.connected) // lorsqu'on est connecté

  if (playersInGame < maxPlayer) {
    if (playersInGame == 1) {
      players[socket.id] = {
        index: 1,
        width: 10,
        height: 75,
        color: 'brown',
        xPos: canvas.width - 10,
        yPos: canvas.height / 2,
        speed: 5,
        inGame: true,
        id: socket.id,
      }
      playersInGame += 1;
      image2 = 'src/boy.png';
    } else if (playersInGame == 0) {
      players[socket.id] = {
        index: 0,
        width: 10,
        height: 75,
        color: 'blue',
        xPos: 0,
        yPos: canvas.height / 2,
        speed: 5,
        inGame: true,
        id: socket.id,
      }
      playersInGame += 1;
      currentPlayer++;
      image1 = '/src/batman.png';
    }
  }

  socket.on('score_restart', function (data) {
    score1 = data.score;
    score2 = data.score;
  })

  socket.emit('donnésDuCanvasDuServer', canvas);
  socket.emit('playerInGame', playersInGame)


  // Lancement du jeu -------------------
  socket.on('start-game', () => {
    clearInterval(interval);
    score1 = 2; // Score des joueurs de depart 
    score2 = 2;
    let currentTime = new Date(); // debut du compteur du jeu au lancement de la partie
    let startTime = currentTime;

    ball.xPos = canvas.width / 2;
    ball.yPos = canvas.height / 2;

    // boucle du jeu
    interval = setInterval(() => {
      currentTime = new Date(); // fin du compteur du jeu a la fin de la partie
      differentTime = Math.round((currentTime - startTime) / 1000); // seconde ecoulé depuis le debut du temps

      ball.moveBall(ball);
      wallCollision(ball, canvas);

      io.emit('draw-everything', { // envoie des données vers les navigateurs 
        ball: ball,
        players: Object.values(players), // envoyé en array
        score1: score1,
        score2: score2,
        time: differentTime

      });
    }, (1000 / 60));
  })
  let playersArray = Object.values(players)

  // LES collisions sur les murs et sur les raquettes
  function wallCollision(ball, canvas) {
    // Collision bord gauche
    if (playersInGame == 2) {

      if ((ball.xPos - ball.radius) < 0) {
        score1-- ; // reduction du score quand la balle touche le mur gauche 
        ball.dx = -ball.dx; // inversement de la direction de la balle au rebond du mur

        if (ball.xPos - ball.radius < playersArray[0].xPos + playersArray[0].width && ball.yPos + ball.radius > playersArray[0].yPos && ball.yPos - ball.radius < playersArray[0].yPos + playersArray[0].height) {
          ball.dx = +ball.dx; //  inversement de la direction de la balle au rebond de la raquette
          consoleLog('toto', 'red')
          score1++; // avec le reduction du score avec le mur + l'augmentation avec la raquette le score ne bouge pas
        }

      }
      // Collision bord droit
      else if ((ball.xPos + ball.radius) > canvas.width) {
        ball.dx = -ball.dx;
        score2-- ;
        if (ball.xPos + ball.radius > playersArray[1].xPos && ball.yPos - ball.radius > playersArray[1].yPos && ball.yPos + ball.radius < playersArray[1].yPos + playersArray[1].height) {
          ball.dx = +ball.dx;
          score2++
        }

      }

      // Collision bord haut
      else if ((ball.yPos - ball.radius) < 0) {
        ball.dy = -ball.dy;
      }

      // Collision bord bas
      else if ((ball.yPos + ball.radius) > canvas.height) {
        ball.dy = -ball.dy;
      }
    }
    // condition fin de la partie et insertion des joueurs dans la base de donnée 
    if (score1 == 0) {
      if (!playerExpress.time) {
        playerExpress.time = differentTime
      }
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
              collection.insertOne(playerExpress) // insertion de l'objet playerExpressJson dans la BDD
            }
          })
        }
      })
   
      clearInterval(interval) // on arrete la game 

    } else if (score2 == 0) {
      if (!playerExpress.time) { // recuperation du temps joué pendant la partie
        playerExpress.time = differentTime
      }
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
              collection.insertOne(playerExpress)
            }
          })
        }
      })
      clearInterval(interval)
    }

  }



  // recuperation du mouvement de la raquette du front --------------------------------------------
  socket.on('move up', function () {
    players[socket.id].yPos -= players[socket.id].speed;
    if (players[socket.id].yPos < 0) {
      players[socket.id].yPos = 0
    }

  });

  socket.on('move down', function () {
    players[socket.id].yPos += players[socket.id].speed;
    if (players[socket.id].yPos > canvas.height - players[socket.id].height) {
      players[socket.id].yPos = canvas.height - players[socket.id].height
    }

  });


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
            // console.log('list des joueurs pour la lecture : ', document)
          }
        })
      })
    }
  })



  // --------- Déconnexion du client ---------//
  socket.on('disconnect', () => {
    delete players[socket.id]
    console.log('un joueur vient de quitter')
    players = {}
    playersInGame = 0
    io.emit('restart')
    playerExpress = {};
    clearInterval(interval)
  })



})