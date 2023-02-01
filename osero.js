
let field = [[],[],[],[],[],[],[],[],[],[]];
const white = "○";
const black = "●";
const wall = "□";
const blank = "・";
let turn;
let npc = false;
let mode = false;

window.addEventListener('DOMContentLoaded', function() {
	setfield();
	printField();
	turn = black;
	document.getElementById("turn").textContent = "黒のターン";
})

function run(pos){
	let inputPos = [parseInt(pos[0]),parseInt(pos[1])];
	
	let canPutFlag = false;
	for(let canPutPos of canPutPosList(turn)) {
		if(canPutPos.toString()==inputPos.toString()) {
			canPutFlag = true;
			break;
		}
	}
	if(canPutFlag) {
		reverse(inputPos);
		if(isFinish()){
			printResult();
			document.getElementById("turn").textContent = "";
			return;
		}else{
			changeTurn();
			if(canPutPosList(turn).length==0 && !isFinish()){
				changeTurn();
				document.getElementById("message").textContent = "置ける場所がありません";
			}
			if(npc && turn==white){
				setTimeout(runNpc, 600);
			}
			printField();
			return;
		}
	}else{
		document.getElementById("message").textContent = "その場所には置けません";
	}
}

function printField() {
	document.getElementById("fields").innerHTML = ""; 
	for(let i=0;i<10;i++) {
		for(let j=0;j<10;j++) {
			if(mode && !npc || mode && turn == black){
				document.getElementById("fields").innerHTML += suggestPrintField(i,j);
			}else{
				let stone ="";
				stone = '<p class="yubi" onclick="run(\'' + i + j + '\')">' + field[i][j] + ' </p>';
				document.getElementById("fields").innerHTML += stone;
			}
		}
		document.getElementById("fields").innerHTML += '<br/>'; 
	}
}

function suggestPrintField(i,j){
	let suggest = false;
	for(let pos of canPutPosList(turn)){
		if(i == pos[0] && j == pos[1]){
			suggest = true;
			break;
		}
	}
	let stone = "";
	if(suggest){
		stone = '<p class="yubi" onclick="run(\'' + i + j + '\')">' + "＊" + ' </p>';
		return stone;
	}else{
		stone = '<p class="yubi" onclick="run(\'' + i + j + '\')">' + field[i][j] + ' </p>';
		return stone;
	}
}

function setfield() {
	for(let i=0;i<10;i++) {
		for(let j=0;j<10;j++) {
		    if(i==0||i==9||j==0||j==9) {
				field[i][j] = wall;
			}else{
				field[i][j] = blank;
			}
		}
	}
		field[5][5] = black;
		field[4][4] = black;
		field[5][4] = white;
		field[4][5] = white;
}

function canPutPosList(color) {
	const directions = [[-1,0],[-1,1],[0,1],[1,1],[1,0],[1,-1],[0,-1],[-1,-1]];
	let enemy = getEnemy(color);
	let canPutList = [];

	for(let row=1;row<9;row++) {
		for(let col=1;col<9;col++) {
			if(field[row][col]!=blank) {
				continue;
			}

			for(const direction of directions) {
				let canPutFlag = false;
				let searchRow = row + direction[0];
				let searchCol = col + direction[1];

				if(field[searchRow][searchCol]!=enemy) {
					continue;
				}
				while(true) {
						searchRow += direction[0];
						searchCol += direction[1];

						if(field[searchRow][searchCol] != enemy && field[searchRow][searchCol] != turn) {
							break;
						}else if(field[searchRow][searchCol]==enemy) {
							continue;
						}else {
							let pos = [row,col];
							canPutList.push(pos);
							canPutFlag = true;
							break;
						}
				}
				if(canPutFlag) {
					break;
				}
			}
		}
	}
	return canPutList;
}

function reverse(inputPos) {
	const directions = [[-1,0],[-1,1],[0,1],[1,1],[1,0],[1,-1],[0,-1],[-1,-1]];
	let enemy = getEnemy(turn);

    let putRow = parseInt(inputPos[0]);
	let putCol = parseInt(inputPos[1]);

	field[putRow][putCol] = turn;

		for(let direction of directions) {
			let row = putRow + direction[0];
			let col = putCol + direction[1];
			
			if(field[row][col]!=enemy) {
				continue;
			}

			let reversePosList = [];
			let fReversePos = {row,col};
			reversePosList.push(fReversePos);

			let reverseFlag = false;
			while(true) {
				row += direction[0];
				col += direction[1];

				if(field[row][col]!=enemy && field[row][col]!=turn) {
					break;
				}
				if(field[row][col]==enemy) {
					let pos = {row:row,col:col,};
					reversePosList.push(pos);
				}else {
					reverseFlag = true;
					break;
				}
			}
			if(reverseFlag) {
				console.log(reversePosList);
				for(let p of reversePosList) {
				    field[p.row][p.col] = turn;
				}
			}
		}
}

function changeTurn() {
	document.getElementById("message").textContent = "";
	if(turn==black) {
		turn = white;
		document.getElementById("turn").textContent = "白のターン";
	}else {
		turn = black;
		document.getElementById("turn").textContent = "黒のターン";
	}
}

function getEnemy(color) {
	if(color==black) {
		return white;
	}
	return black;
}

function isFinish() {
	if(field.some(stone => stone.includes(blank)) && field.some(stone => stone.includes(black)) && field.some(stone => stone.includes(white))){
		return false;
	}
	return true;
}

function printResult() {
	let f ='';
	document.getElementById("fields").innerHTML = f; 
	for(let i=0;i<10;i++) {
		for(let j=0;j<10;j++) {
			let stone = '<p>' + field[i][j] + ' </p>';
			document.getElementById("fields").innerHTML += stone;
		}
		document.getElementById("fields").innerHTML += '<br/>'; 
	}
	
	let result = "";
	result += "----結果----"+ "<br>";
	let blackCount = 0;
	let whiteCount = 0;
	for(let row=1;row<9;row++) {
		for(let col=1;col<9;col++) {
			if(field[row][col]==black) {
				blackCount++;
			}else if(field[row][col]==white){
				whiteCount++;
			}
		}
	}
	result += blackCount + "：" + whiteCount + "<br>";
	if(blackCount>whiteCount) {
		result += "黒の勝ち";
	}else if(blackCount<whiteCount){
		result += "白の勝ち";
	}else {
		result += "引き分け";
	}
	document.getElementById("message").innerHTML = result;
}

function changeMode(){
	mode = !mode;
	if(mode){
		document.getElementById("mode").textContent = "ふつう";
	}else{
		document.getElementById("mode").textContent = "やさしい";
	}
	printField();
}

function changeNpc(){
	npc = !npc;
	turn = black;
	setfield();
	printField();
	document.getElementById("turn").textContent = "黒のターン";
	if(npc){
		document.getElementById("npc").textContent = "2人で遊ぶ";
	}else{
		document.getElementById("npc").textContent = "1人で遊ぶ";
	}
}

function runNpc(){
	let list = canPutPosList(white);
	if(list.length!=0){
		let index = Math.floor(Math.random()*list.length);
		reverse(list[index]);
	}
	if(isFinish()){
		printResult();
		document.getElementById("turn").textContent = "";
		return;
	}
	changeTurn();
	printField();
}
