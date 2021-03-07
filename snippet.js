


function consoleLog(arg1, arg2, arg3){ // fonctionne sur serveur node 

  switch(arg2){
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
console.log(chalkColor(arg1 , arg3))
}

function consoleLog(arg1,arg2, arg3){// fonctionne sur navigateur 
  console.log(`%c  ${arg1}`, `color: ${arg2}`, arg3)
}

// consoleLog('texte', 'couleur', variable) // appel la fonction de cette maniere

var backgroundColor =  '#'+(Math.random()* 0xFFFFFF << 0).toString(16).padStart(6,'0')