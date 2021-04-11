const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let toto;
const startGame = document.getElementById('start-game')
startGame.style.display = 'block';
const resetGame = document.getElementById('reset-button')
resetGame.style.display = 'none';
const restartGame = document.getElementById('return-game')
restartGame.style.display = 'none';

let avatar = document.getElementById('avatar');
const winner1 = document.getElementById('winner1');
const winner2 = document.getElementById('winner2');

function consoleLog(arg1, arg2, arg3) {
  console.log(`%c  ${arg1}`, `color: ${arg2}`, arg3)
}

function consoleLog2(arg1) {
  console.log('----*****---->  ', arg1)
}

function drawBall(ball) {
  ctx.beginPath();

  ctx.fillStyle = ball.color;
  ctx.arc(ball.xPos, ball.yPos, ball.radius, 0, 2 * Math.PI, false);

  ctx.fill();

  // Direction de la balle
  ctx.beginPath();

  // ctx.moveTo(ball.xPos, ball.yPos);
  // ctx.lineTo(ball.xPos + ball.dx * 1000, ball.yPos + ball.dy * 1000);

}

function drawPlayer(player) {
  ctx.beginPath();

  ctx.rect(player.xPos, player.yPos, player.width, player.height);
  ctx.fillStyle = player.color;
  // ctx.lineWidth = 10;

  ctx.fill();
}
let list = document.getElementById('list-player');

function drawScore1(score1) {
  ctx.font = "16px arial";
  ctx.fillStyle = 'blue';
  ctx.fillText('score player 1 : ' + score1, 8, 20)
}

function drawScore2(score2) {
  ctx.font = "16px arial";
  ctx.fillStyle = 'brown';
  ctx.fillText('score player 2 : ' + score2, canvas.width - 130, 20)
}

function drawTime(time) {
  ctx.font = "16px airal";
  ctx.fillStyle = 'black';
  ctx.fillText('Time : ' + time + ' s', canvas.width / 2 - 30, 20)
}
window.addEventListener('DOMContentLoaded', function () {
  const socket = io();

  let socketId;
  let playersInGame;
  // Canvas pong *************************************************************************
  const container = document.querySelector('.canvas-container');
  socket.on('connect', () => {
    socketId = socket.id;

  })



  canvas.style.backgroundColor = '#E8F3F6';
  socket.on('donnésDuCanvasDuServer', (valeurCanvas) => {
    canvas.width = valeurCanvas.width;
    canvas.height = valeurCanvas.height;
  })

  // Permet de lancer la partie qu'on envoie au server

  document.querySelector('#start-game').addEventListener('click', () => {
    startGame.style.display = 'none';
    restartGame.style.display = 'block';
    socket.emit('start-game');

  })
  restartGame.addEventListener('click', () => {
    window.location.href = '/';
  })

  socket.on('playerInGame', (data) => {

    playersInGame = data;
    if (playersInGame == 2) {
      startGame.style.display = 'block'
      avatar.src = '/src/avatar2.png'
    } else {
      startGame.style.display = 'none'
      avatar.src = '/src/avatar1.png'
    }

  })
  socket.on('envoieMessage', (data) => {
    let list = document.getElementById('list-player');
    const previousGame = document.getElementById('previous-game');
    previousGame.innerHTML = 'partie Précédente :'
    for (let element of data) {
      console.log(element)

      list.innerHTML += `- Player ${element.player1} VS Player ${element.player2} , Durée de la partie : ${element.time} s - <br>`
      // list.innerHTML += element.game + '<br>'
    }
  })

  let players = []
  let ball;
  socket.on('draw-everything', (data) => { // dessine ball + raquette 

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBall(data.ball);
    data.players.forEach(player => {
      drawPlayer(player);

    });
    movePlayer()
    ball = data.ball;
    players = data.players;
    drawScore1(data.score1)
    drawScore2(data.score2)
    drawTime(data.time)



    socket.on('restart', function () {

      startGame.style.display = 'none';

      resetGame.style.display = 'block';

      resetGame.addEventListener('click', function () {

        players = []
        delete players[socket.id]
        socket.emit('score_reset', {
          score: 2
        })
        window.location.href = '/';
      })
    })

    if (data.score1 == 0) {
      console.log('player 2 win')
      console.log(players[2].color)
      winner2.style.display = 'block';
      winner1.style.display = 'none';
    } else if (data.score2 == 0) {
      console.log('player 1 win')
      console.log(players[1].color)
      winner1.style.display = 'block';
      winner2.style.display = 'none';
    }


  });

  // Déplacement du joueur-----------

  const keyboard = {};
  window.onkeydown = function (e) {
    keyboard[e.keyCode] = true;
    // console.log(e)
  };

  window.onkeyup = function (e) {
    delete keyboard[e.keyCode];
  };

  function movePlayer() {

    if (keyboard[38]) socket.emit('move up');

    if (keyboard[40]) socket.emit('move down');
  }


  socket.on('connect_error', () => {
    consoleLog('Evenenement connect_error coté navigateur ', 'red', '')
  })

  socket.on('disconnect', () => {
    consoleLog('evenement disconnect coté navigateur ', 'red', '')
  })
});