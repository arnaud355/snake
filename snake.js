window.onload = function(){ //au chargement de la fenetre
	const canvasWidth = 900;
	const canvasHeight = 600;
	const blockSize = 30;
	const canvas = document.createElement('canvas'); //cree un nouvel element de type canvas, dans le doc d'hmtl
	const ctx = canvas.getContext('2d');//creation context
	let delay;
	let serpentin;
	let pommette;
	const widthInBlocks = canvasWidth/blockSize;
	const heightInBlocks = canvasHeight/blockSize;
	let score;
	let timeOut;
	const centreX = canvasWidth / 2;
	const centreY = canvasHeight / 2;
	//const à placer si pas de réassignation, par défaut on met const
	let as = document.getElementById('aS');
	
	init();		
	function init(){
		
		canvas.width = canvasWidth;
		canvas.height = canvasHeight;
		canvas.style.border = "30px solid gray";
		canvas.style.margin = "50px auto";
		/*pour centrer element et que marges marchent
		il faut un type display*/
		canvas.style.display = "block";
		/*en CSS3 on fait background-color mais
		ej JS on met une MAJ à la place du tiret*/
		canvas.style.backgroundColor = "#ddd";
		document.body.appendChild(canvas); //ajoute un noeud au canvas
		launch();
	}
	
	function launch(){
		as.style.display = "none";
		serpentin = new Serpent([[6,4],[5,4],[4,4]],"right");
		pommette = new Pomme([10,10]);
		score = 0;
		clearTimeout(timeOut);
		delay = 100;
		refreshCanvas();
	}
	
	function refreshCanvas(){
	    serpentin.advance();/*Par defaut direction vers droite, si evenement au clavier
		avant appel de la méthode advance et que c'est une touche de changement de direction autorisée, 
		c'est la fonction setDirection qui modifiera la direction, la methode advance prendra
		en compte nouvelle coordonnees de direction...*/
		if(serpentin.checkCollision())
		{
			gameOver();
		}
		else
		{
			if(serpentin.isEatingApple(pommette))
			{
				score++;
				serpentin.ateApple = true;
				do
				{
					pommette.setNewPosition();
				}while(pommette.isOnSnake(serpentin));
				
				if(score % 5 == 0){
					speedUp();
				}
			}
			ctx.clearRect(0,0,canvasWidth,canvasHeight);//efface données rect, met à 0, 0, L,l initiale
			afficheScore();
			serpentin.dessine();
			pommette.dessine();
			/*ctx.fillStyle = "#ff0000"; //rempli avec une couleur
			ctx.fillRect(xcoord,ycoord,100,50); //place une forme: absicisse,ordonéee,L,l*/
			timeOut = setTimeout(refreshCanvas,delay);//fonction pour executer une certaine fonction quand un délai est passé
		}
		
	}
	
	function speedUp(){
		delay /= 2;
	}
	function gameOver(){
		ctx.save();
		ctx.font = "bold 70px sans-serif";
		ctx.fillStyle = "#000";
		ctx.textAlign = "center";
		ctx.textbaseline = "middle"; //affichage par rapport au milieu
		ctx.strokeStyle = "white";
		ctx.lineWidth = 5;
		ctx.strokeText("Game Over",centreX,centreY - 180);
		ctx.fillText("Game Over",centreX,centreY - 180);
		ctx.font = "bold 30px sans-serif";
		ctx.strokeText("Apuyer sur la touche Espace pour rejouer",centreX,centreY - 120);
		ctx.fillText("Apuyer sur la touche Espace pour rejouer",centreX,centreY - 120);
		ctx.restore();
		
		as.style.display = "block";
		as.style.position = "absolute";
		as.style.marginTop = "250px";
		as.style.marginLeft = "300px";
		as.style.backgroundColor = "#beba46";
		as.style.border = "2px solid #beba46";
		as.style.color = "#fff";
		as.style.textDecoration = "none";
	}
		
	function afficheScore(){
		ctx.save();
		ctx.font = "bold 200px sans-serif";
		ctx.fillStyle = "gray";
		ctx.textAlign = "center";
		ctx.textbaseline = "middle"; //affichage par rapport au milieu
		ctx.fillText(score.toString(),centreX,centreY);
		ctx.restore();
	}
	
	function drawBlock(ctx,position){
		const x = position[0] * blockSize;
		const y = position[1] * blockSize;
		ctx.fillRect(x,y,blockSize,blockSize);
	}

	function Serpent(body, direction){
		this.body = body;
		this.direction = direction;
		this.ateApple = false;
		this.dessine = function(){
			ctx.save();//sauvegarde config actuelle
			ctx.fillStyle = "#00a600";
			for(let i = 0; i < this.body.length; i++)
			{
				drawBlock(ctx,this.body[i]);
			}
			ctx.restore();//restaure config au moment sauvegarde
		};
		this.advance = function(){
			const nextPosition = this.body[0].slice();
			//le slice() fait une copie de la tête
			/*pourquoi const devant nextPosition et pas let ?
			c'est un tableau (se comporte comme les objets),
			on lui dit pointe sur l'adresse et change la
            valeur existante qui s'y trouve,
			je ne réassigne pas une nouvelle valeur */
			switch(this.direction)
			{
				case "left":
					nextPosition[0] -= 1;
					break;
				case "right":
					nextPosition[0] += 1;
					break;
				case "down":
					nextPosition[1] += 1;
					break;
				case "up":
					nextPosition[1] -= 1;
					break;
				default:
					throw("Invalid direction");
			}
			this.body.unshift(nextPosition);
			/*unshift ajoute un nouvel element en premier
			par ex: 7,4 après 6,4*/
			if(!this.ateApple)
				this.body.pop();//supprime dernier element
			else
				this.ateApple = false;
		};
		this.setDirection = function(newDirection){
			let allowedDirections;
			switch(this.direction)
			{
				case "left":
				case "right":
					allowedDirections = ["up","down"];
					break;
				case "up":
				case "down":
					allowedDirections = ["left","right"];
					break;
				default:
					throw("Invalid direction");
			}
			if(allowedDirections.indexOf(newDirection) > -1)
			{
				this.direction = newDirection;
			}
		};
		this.checkCollision = function(){
			let wallCollision =  false;
			let snakeCollision =  false;
			const head = this.body[0];//tete du serpent
			const rest = this.body.slice(1);/*avec 1  
			en argument: signifie copie tout sauf à l'index 0
			donc copie le corps du serpent sauf la tête*/
			const snakeX =  head[0];
			const snakeY =  head[1];
			const minX = 0;
			const minY = 0;
			const maxX = widthInBlocks - 1;
			const maxY = heightInBlocks - 1;
			const isNotBetweenHorizontalWalls = snakeX < minX || snakeX > maxX;
			const isNotBetweenVerticalWalls = snakeY < minY || snakeY > maxY;
			
			if(isNotBetweenHorizontalWalls || isNotBetweenVerticalWalls)
			{
				wallCollision = true;
			}
			for(let i = 0;i < rest.length; i++)
			{
				if(snakeX === rest[i][0] && snakeY === rest[i][1])
				{
					snakeCollision = true;
				}
			}
			return wallCollision || snakeCollision;
		};
		this.isEatingApple = function(appleToEat){
			const head = this.body[0];
			if(head[0] === appleToEat.position[0] && head[1] === appleToEat.position[1] )
				return true;
			else
				return false;
			
		};
	}
	
	function Pomme(position){
		this.position = position;
		this.dessine = function(){
			const radius = blockSize/2;
			const x = this.position[0]*blockSize + radius;
			const y = this.position[1]*blockSize + radius;
			ctx.save();
			ctx.fillStyle = "#ff0000";
			ctx.beginPath();//premier chemin
			/*Pour appeler la méthode pour dessiner cercle
			elle auras besoin du point au centre et non en haut
            à gauche, elle aura besoin en plus de x et y,
            du rayon, soit le blockSize/2 et de pi*/
			ctx.arc(x,y,radius,0,Math.PI*2,true);
			ctx.fill();
			ctx.restore();
		};
		this.setNewPosition = function(){
			const newX = Math.round(Math.random() * (widthInBlocks - 1));
			const newY = Math.round(Math.random() * (heightInBlocks - 1));
			this.position = [newX,newY];
		};
		this.isOnSnake = function(snakeToCheck){
			let isOnSnake = false;
			
			for(let i = 0; i < snakeToCheck.body.length; i++)
			{
				if(this.position[0] === snakeToCheck.body[i][0] && this.position[1] === snakeToCheck.body[i][1])
					isOnSnake = true;
			}
			return isOnSnake;
		};
	}
	
	document.onkeydown = function handlekeyDown(e){
		const key = e.keyCode;
		let newDirection;
		switch(key)
		{
			case 37:
				newDirection = "left";
				break;
			case 38:
				newDirection = "up";
				break;
			case 39:
				newDirection = "right";
				break;
			case 40:
				newDirection = "down";
				break;
			case 32 :
				launch();
				return
			default:
				return;
		}
		serpentin.setDirection(newDirection);
	}
}
