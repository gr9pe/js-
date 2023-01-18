let field = [[],[],[],[],[],[],[],[],[],[]];
const white = "○";
const black = "●";
const wall = "□";
const blank = "・";
let turn;

function printField() {
	let f ='';
	document.getElementById("fields").innerHTML = f; 
	for(let i=0;i<10;i++) {
		for(let j=0;j<10;j++) {
			document.getElementById("fields").innerHTML += field[i][j];
		}
		document.getElementById("fields").innerHTML += '<br/>'; 
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
						const pos = [row,col];
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

    let putRow = inputPos[0];
	let putCol = inputPos[1];

	field[putRow][putCol] = turn;

		for(const direction of directions) {
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
					const reversePos = [row,col];
					reversePosList.push(reversePos);
				}else {
					reverseFlag = true;
					break;
				}
			}
			if(reverseFlag) {
				for(let reversePos of reversePosList) {
				    field[reversePos.row][reversePos.col] = turn;
				}
			}
		}
}

function changeTurn() {
	if(turn==black) {
		turn = white;
	}else {
		turn = black;
	}
}

function getEnemy(color) {
	if(color==black) {
		return white;
	}
	return black;
}

function isFinish() {
	canPutWhiteList = canPutPosList(white);
	canPutBlackList = canPutPosList(black);
	if(canPutWhiteList.length==0&&canPutBlackList.length==0) {
		return true;
	}
	return false;
}

function checkInput(input) {
	let mach = /^([1-9]\d*|0)$/;
	if(input.length==2 && mach.test(input)) {
		return true;
	}
	document.getElementById("message").textContent = "2桁の数値でマスを指定してください";
	return false;
}

function printResult() {
	let result = "";
	result += "----結果----"+ "<br>";
	let blackCount = 0;
	let whiteCount = 0;
	for(let row=1;row<9;row++) {
		for(let col=1;col<9;col++) {
			if(field[row][col]==black) {
				blackCount++;
			}else {
				whiteCount++;
			}
		}
	}
	result += blackCount + "：" + whiteCount + "\n";
	if(blackCount>whiteCount) {
		result +="黒の勝ち";
	}else if(blackCount>whiteCount){
		result += "白の勝ち";
	}else {
		result += "引き分け";
	}
	document.getElementById("message").textContent = result;
}


document.getElementById("message").textContent = "2桁の数値でマスを指定してください";
setfield();
printField();
turn = black;
document.getElementById("message").textContent = "黒のターン";

function run(){
	console.log(canPutPosList(turn));
	if(canPutPosList(turn).length==0) {
		document.getElementById("message").textContent = "置ける場所がありません";
		changeTurn();
	}
	
	const input = document.getElementById('in').value;
	
	if(checkInput(input)) {
		let inputRow = parseInt(input.charAt(0));
		let inputCol = parseInt(input.charAt(1));
		let inputPos = [inputRow,inputCol];

		let canPutFlag = false;
		for(let canPutPos of canPutPosList(turn)) {
			if(canPutPos.toString()==inputPos.toString()) {
				canPutFlag = true;
			}
		}
		console.log(canPutFlag);
		if(canPutFlag) {
			reverse(inputPos);
			printField();
		}else {
			document.getElementById("message").textContent = "その場所には置けません";
			return;
		}
		if(!isFinish()) {
			changeTurn();
		}else {
			printResult();
		}
	}
	if(turn==black) {
		document.getElementById("message").textContent = "黒のターン";
	}else {
		document.getElementById("message").textContent = "白のターン";
	}
}