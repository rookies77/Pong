function wallCollision(ball, canvas) {
	// Collision bord gauche
	if ((ball.xPos - ball.radius) < 0) {
		// ball.dx *= (ball.dx < 0) ? -1 : 1;
    ball.dx = -ball.dx;
    // clearInterval(interval);

	}
	// Collision bord droit
	else if ((ball.xPos + ball.radius) > canvas.width) {
  
    ball.dx = - ball.dx;
    // clearInterval(interval);
	}

	// Collision bord haut
	else if ((ball.yPos - ball.radius) < 0) {	
		// ball.dy *= (ball.dy < 0) ? -1 : 1;
    ball.dy =  -ball.dy;
	}

	// Collision bord bas
    else if ((ball.yPos + ball.radius) > canvas.height) {
		// ball.dy *= (ball.dy > 0) ? -1 : 1;
    ball.dy = -ball.dy;
	}


}

function playerCollision(ball, player){
// Collision partie inférieure du joueur
if(ball.xPos < player.xPos){
  ball.dx =  ball.dx
}
  
}
module.exports= {wallCollision, playerCollision}