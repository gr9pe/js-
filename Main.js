const white = "○";
const black = "●";
const wall = "□";
const blank = "・";
const suggest = "＊";
const directions = [{x:-1,y:0},{x:-1,y:1},{x:0,y:1},{x:1,y:1},{x:1,y:0},{x:1,y:-1},{x:0,y:-1},{x:-1,y:-1}];
let field = [];

let game = {
	turnColor:black,
	easyMode:false,
	useNpc:false,
	blackPoints:0,
	whitePoints:0
}

function newGame(){
	game.turnColor = black;
	document.getElementById("reStart").style.display ="none";
	document.getElementById("message").textContent = "";
	document.getElementById("turn").textContent = "黒のターン";
	printField(makeField());
}

function run(...inputPos){
	if(canPut(inputPos)){
		reverse(inputPos);
		changeTurn();
		printField(field);
		if(game.useNpc && game.turnColor == white){
			setTimeout(runNpc, 600);
		}
	}else if(surchLegalPos(game.turnColor).length == 0){
		document.getElementById("message").textContent = `${game.turnColor}は置ける場所がありません`;
		changeTurn();
	}else{
		document.getElementById("message").textContent = "その場所には置けません";
	}
	if(isFinish()){
		finishGame();
	}
}
function makeField(){
	for(let i=0;i<10;i++) {
		let line = [];
		for(let j=0;j<10;j++) {
			line.push({		state : blank,
							  pos : [i,j],
						 makeHtml : function(state = this.state, onclick = `onclick = run(${this.pos})`){return `<p class="yubi" ${onclick}> ${state} </p>`}
					});
		    if(i==0||i==9||j==0||j==9) {
				line[line.length-1].state = wall;
			}
		}
		field[i] = line;
	}
	field[5][5].state = black;
	field[4][4].state = black;
	field[5][4].state = white;
	field[4][5].state = white;
	
	return field;
}

function printField(arg = field){
	document.getElementById("field").innerHTML = "";
	arg.map(line => {
		line.map(square => {
			if(souldSuggestPrint(field, square.pos)){
				document.getElementById("field").innerHTML += square.makeHtml(suggest);
			}else{
				document.getElementById("field").innerHTML += square.makeHtml();
			}
		})
		document.getElementById("field").innerHTML += "<br>"
	})
}

function souldSuggestPrint(field,pos){
	if(canPut(pos) && (game.easyMode && !game.useNpc || game.easyMode && game.turnColor == black)){
		return true;
	}
	return false;
}

function canPut(pos){
	const legalPoses = surchLegalPos(game.turnColer);
	if(legalPoses.length == 0){
		return false;
	}
	if(legalPoses.some(legalPos => legalPos.toString() == pos.toString())){
		return true;
	}
	return false;
}


function surchLegalPos(color = game.turnColor) {
	let enemy = getEnemy(color);
	let legalPos = [];
	for(let row=1;row<9;row++) {
		for(let col=1;col<9;col++) {
			if(field[row][col].state != blank) {
				continue;
			}
			for(let{x,y} of directions){
				let canPutFlag = false;
				let searchRow = row + x;
				let searchCol = col + y;
				
				let targetSquare = field[searchRow][searchCol].state;
				if(targetSquare != enemy) {
					continue;
				}
				while(true) {
					searchRow += x;
					searchCol += y;
					targetSquare = field[searchRow][searchCol].state;
					
					if(targetSquare != enemy && targetSquare != game.turnColor) {
						break;
					}else if(targetSquare == enemy) {
						continue;
					}else {
						canPutFlag = true;
						legalPos.push([row,col]);
						break;
					}
				}
				if(canPutFlag){
					break;
				}
			}
		}
	}
	return legalPos;
}

function reverse(inputPos){
	let enemy = getEnemy(game.turnColor);
	let putRow = parseInt(inputPos[0]);
	let putCol = parseInt(inputPos[1]);
	
	field[putRow][putCol].state = game.turnColor;
	
	for(let{x,y} of directions){
		let row = putRow + x;
		let col = putCol + y;
		if(field[row][col].state != enemy) {
			continue;
		}
		let reversePosList = [];
		reversePosList.push([row,col]);
		let reverseFlag = false;
		while(true) {
			row += x;
			col += y;
			let targetSquare = field[row][col].state;
			if(targetSquare != enemy && targetSquare != game.turnColor) {
				break;
			}
			if(targetSquare == enemy) {
				reversePosList.push([row,col]);
			}else {
				reverseFlag = true;
				break;
			}
		}
		if(reverseFlag) {
			for(let pos of reversePosList) {
			    field[pos[0]][pos[1]].state = game.turnColor;
			}
		}
	}
}

function changeTurn(){
	if(game.turnColor == black) {
		game.turnColor = white;
		document.getElementById("turn").textContent = "白のターン";
	}else {
		game.turnColor = black;
		document.getElementById("turn").textContent = "黒のターン";
	}
}

function getEnemy(color){
	if(color == black) {
		return white;
	}
	return black;
}

function countStone(color){
	let stoneCount = 0;
	field.map(line=>line.map(square=>{
		if(square.state == color){
			stoneCount++;
		}
	}));
	return stoneCount;
}

function isFinish() {
	if(countStone(black)==0||countStone(white)==0){
		return true;
	}
	if(field.some(line=>line.some(square => square.state == blank))){
		return false;
	}
	return true;
}

function changeMode(){
	game.easyMode = !game.easyMode;
	if(game.easyMode){
		document.getElementById("mode").textContent = "ふつう";
	}else{
		document.getElementById("mode").textContent = "やさしい";
	}
	printField(field);
}

function finishGame(){
	document.getElementById("turn").textContent = "";
	document.getElementById("field").innerHTML = "";
	field.map(line=>{line.map(square=>{
				document.getElementById("field").innerHTML += square.makeHtml(square.state,"");
			})
		document.getElementById("field").innerHTML += '<br/>';
	});
	let blackCount = countStone(black);
	let whiteCount = countStone(white)
	let result = "結果"+"<br>"+ blackCount + "：" + whiteCount + "<br>";
	if(blackCount>whiteCount){
		result += "黒の勝ち";
	}else if(blackCount<whiteCount){
		result += "白の勝ち";
	}else{
		result += "引き分け";
	}
	
	document.getElementById("message").innerHTML = result;
	document.getElementById("reStart").style.display ="block";
}

function changeNpc(){
	newGame();
	game.useNpc = !game.useNpc;
	if(game.useNpc){
		document.getElementById("npc").textContent = "2人で遊ぶ";
	}else{
		document.getElementById("npc").textContent = "1人で遊ぶ";
	}
}

function runNpc(){
	let legalPos = surchLegalPos(white);
	if(legalPos.length!=0){
		let index = Math.floor(Math.random()*legalPos.length);
		reverse(legalPos[index]);
	}else{
		changeTurn();
		document.getElementById("message").textContent = `NPCは置ける場所がありません`;
	}
	changeTurn();
	printField();
	if(isFinish()){
		finishGame();
	}
}
document.addEventListener('DOMContentLoaded', function(){
    newGame();
});