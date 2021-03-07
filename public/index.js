const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

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




window.addEventListener('DOMContentLoaded', function () {
  let playerId;
  const socket = io();
  let list = document.getElementById('list-player');
  let elementP = document.createElement('p');
  let moveY = 0;
  let allSocketId = [];



  // Canvas pong *************************************************************************
  const container = document.querySelector('.canvas-container');



  // canvas.width = container.clientWidth;
  // canvas.height = container.clientHeight;
  // const canvasWidth = canvas.width;
  // const canvasHeight = canvas.height;
  canvas.style.backgroundColor = '#E8F3F6';
  socket.on('donnésDuCanvasDuServer', (valeurCanvas) => {
    canvas.width = valeurCanvas.width;
    canvas.height = valeurCanvas.height;
  })
  socket.on('connexionDuJoueur', (playerIdDuServeur) => {

    playerId = playerIdDuServeur;
    playerId++;
    document.querySelector('h6').innerText = (playerId == 0) ? "Vous êtes spectateur" :
      "Vous êtes le joueur " + playerId;
    console.log('id: ', playerId)
  })
  // Permet de lancer la partie qu'on envoie au server
  document.querySelector('#start-game').addEventListener('click', () => {
    socket.emit('start-game');
  })





  let player = []

  socket.on('draw-everything', (data) => {
    // console.log(data.players)
    document.querySelector('.list-player').innerText = "";
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBall(data.ball);
    // drawPlayer(data.player1)
    // drawPlayer(data.player2)
    data.players.forEach(player => {
      drawPlayer(player);
// allSocketId.push(data.player.id)

    });
player = data.players
console.log(player)
  });

  // Déplacement du joueur-----------

  document.addEventListener('mousemove', function mouseMove(e) {

    const relativeY = e.clientY - canvas.offsetTop;

    if (relativeY > 0 && relativeY < canvas.height) {

      moveY = relativeY
    }
    if (relativeY + 75 > canvas.height) {
      moveY = canvas.height - 75
    }

    // console.log(allSocketId)

  

    let socketId = socket.id;
      // console.log(socketId )
    socket.emit('envoieDuMovementY', {
      moveY,
      socketId
    })
  })






  function test() {

    // let ballX;
    // let ballY;
    // let dx;
    // let dy;
    // let ballRadius;

    // // initialisé raquette 1
    // let raquette1_X;
    // let raquette1_Y;
    // let raquette1_W;
    // let raquette1_H;
    // let raquette1_color;

    // // initialisé raquette 2
    // let raquette2_X;
    // let raquette2_Y;
    // let raquette2_W;
    // let raquette2_H;
    // let raquette2_color;

    // let score1 = 0;
    // let score2 = 0;

    // let upPressed = false;
    // let downPressed = false;
    // let raquette1_id;
    // let raquette2_id;


    // // les données du canvas transmis vers le server ************
    // let canvasCoord = {
    //   width: canvasWidth,
    //   height: canvasHeight
    // }
    // socket.emit('donnéesCanvas', canvasCoord)

    // // player raquette 1 **********************
    // socket.on('donnésDuServeur_Raq_1', (raquetteServer) => {
    //   raquette1_X = raquetteServer.x;
    //   raquette1_Y = raquetteServer.y;
    //   raquette1_W = raquetteServer.w;
    //   raquette1_H = raquetteServer.h;
    //   raquette1_id = raquetteServer.id;
    //   raquette1_color = raquetteServer.backgroundColor;

    // })
    // if (!raquette1_id) {
    //   function drawPaddle1() {
    //     ctx.beginPath();
    //     ctx.rect(raquette1_X, raquette1_Y, raquette1_W, raquette1_H)
    //     ctx.fillStyle = raquette1_color;
    //     ctx.fill();
    //     ctx.closePath();
    //   }

    // }


    // // player raquette 2 **********************
    // socket.on('donnésDuServeur_Raq_2', (raquetteServer2) => {
    //   raquette2_X = raquetteServer2.x;
    //   raquette2_Y = raquetteServer2.y;
    //   raquette2_W = raquetteServer2.w;
    //   raquette2_H = raquetteServer2.h;
    //   raquette2_id = raquetteServer2.id;
    //   raquette2_color = raquetteServer2.backgroundColor
    // })
    // if (raquette1_id) {
    //   function drawPaddle2() {
    //     ctx.beginPath();
    //     ctx.rect(canvasWidth - 30, raquette2_Y, raquette2_W, raquette2_H);
    //     ctx.fillStyle = raquette2_color;
    //     ctx.fill();
    //     ctx.closePath();

    //   }
    // }

    // console.log(raquette1_id, raquette2_id)



    // function lineCenter() {
    //   ctx.beginPath();
    //   ctx.rect(canvasWidth / 2, 0, 2, canvasHeight);
    //   ctx.fillStyle = "#0023DD";
    //   ctx.fill();
    //   ctx.closePath();
    // }

    // function lineMiddle() {
    //   ctx.beginPath();
    //   ctx.rect(0, canvasHeight / 2, canvasWidth, 2);
    //   ctx.fillStyle = "white";
    //   ctx.fill();
    //   ctx.closePath();
    // }

    // function drawScoreplayer1() {
    //   ctx.font = "16px Arial";
    //   ctx.fillStyle = "#0095DD";
    //   ctx.fillText("Score: " + score1, 8, 20);
    // }

    // function drawScoreplayer2() {
    //   ctx.font = "16px Arial";
    //   ctx.fillStyle = "#0095DD";
    //   ctx.fillText("Score: " + score2, canvasWidth - 80, 20);
    // }


    // socket.on('ballEveryOne', (dataBall) => { //****** Creation Ball **************** */
    //   ballX = dataBall.x;
    //   ballY = dataBall.y;
    //   dx = dataBall.dx;
    //   dy = dataBall.dy;
    //   ballRadius = dataBall.radius
    // })
    // // socket.on('movementBallAllNavigator', (dataAllNavigator)=>{
    // //   ballX = dataAllNavigator.x;
    // //   ballY = dataAllNavigator.y;
    // //   ballRadius = dataAllNavigator.radius
    // // })
    // function drawBall() {
    //   ctx.beginPath();
    //   ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
    //   // ctx.arc(canvasWidth / 2, canvasHeight - 10, 10, 0, Math.PI * 2);
    //   ctx.fillStyle = "#0095DD";
    //   ctx.fill();
    //   ctx.closePath();
    // }

    // function moveBall() {
    //   ballX += dx;
    //   ballY += dy;
    //   if (ballY + dy < ballRadius || ballY + dy > canvasHeight - ballRadius) {
    //     dy = -dy
    //   }
    //   if (ballX + dx > canvasWidth - ballRadius || ballX + dx < ballRadius) {

    //     if (ballY > paddleY && paddleY + paddleHeight) {
    //       dx = -dx;
    //     } else {
    //       alert('GAME OVER');
    //       clearInterval(interval)
    //     }
    //   }
    // }

    // // Direction de la raquette 
    // document.addEventListener("keydown", keyDownHandler, false);
    // document.addEventListener("keyup", keyUpHandler, false);
    // // document.addEventListener("mousemove", mouseMoveHandler, false);

    // function keyDownHandler(e) {
    //   if (e.key == "up" || e.key == "ArrowUp") {
    //     upPressed = true;
    //   } else if (e.key == "down" || e.key == "ArrowDown") {
    //     downPressed = true;
    //   } else if (e.code == "Space") {
    //     document.location.reload();
    //   }
    // }

    // function keyUpHandler(e) {
    //   // console.log(e)
    //   if (e.key == "up" || e.key == "ArrowUp") {
    //     upPressed = false;
    //   } else if (e.key == "down" || e.key == "ArrowDown") {
    //     downPressed = false;
    //   }
    // }

    // function mouseMoveHandler(e) {
    //   var relativeY = e.clientY - canvas.offsetTop;
    //   console.log('relativeY',relativeY)
    //   console.log('------------------------------------');
    //   console.log(relativeY > 0 && relativeY < canvasHeight);
    //   console.log('------------------------------------');
    //   if (relativeY > 0 && relativeY < canvasHeight) {
    //     paddleY = relativeY;

    //   }
    // }



    // socket IO front

    // socket.on('connect', () => {
    //   consoleLog('on est connecté en front Game.js', 'green', '')




    //   // const MonPaddle1 = drawPaddle1(raquetteDuServeur)
    //   function draw() {
    //     ctx.clearRect(0, 0, canvasWidth, canvasHeight);


    //     drawBall();
    //     drawPaddle1();
    //     // console.log(raquetteServer)
    //     moveBall();
    //     lineMiddle();
    //     // console.log(drawPaddle2)
    //     drawPaddle2();
    //     drawScoreplayer1();
    //     drawScoreplayer2();
    //     lineCenter();
    //     // consoleLog('drawP1', 'blue', raquetteDuServeur)


    //     // socket.emit('envoieBallAuServer', dataBall);
    //     // socket.emit('envoieRaquetteAuServer', raquetteServer)

    //     if (downPressed) {
    //       paddleY += 7;
    //       if (paddleY + paddleHeight > canvasHeight) {
    //         paddleY = canvasHeight - paddleHeight
    //       }
    //     } else if (upPressed) {
    //       paddleY -= 7;
    //       if (paddleY < 0) {
    //         paddleY = 0
    //       }
    //     }
    //   }
    //   // draw()
    //   const interval = setInterval(draw, 10);










    //   // test mongodb sur le navigateur
    //   socket.on('envoieMessage', function (msg) {
    //     msg.forEach(element => {
    //       // console.log(typeof (JSON.stringify(element)))
    //       toto = JSON.stringify(element.name)

    //       elementP.innerText = toto;

    //       // console.log(typeof (elementP))
    //       // console.log(elementP)
    //       toto = elementP.toString();
    //       // console.log(toto)
    //     });

    //   })


    // })

  }




  socket.on('connect_error', () => {
    consoleLog('Evenenement connect_error coté navigateur ', 'red', '')
  })

  socket.on('disconnect', () => {
    consoleLog('evenement disconnect coté navigateur ', 'red', '')
  })
});