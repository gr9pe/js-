const white = "○";
const black = "●";
const wall = "□";
const blank = "・";
const suggest = "＊";
const directions = [{x:-1,y:0},{x:-1,y:1},{x:0,y:1},{x:1,y:1},{x:1,y:0},{x:1,y:-1},{x:0,y:-1},{x:-1,y:-1}];
let field = [];
let turnColor = black;
let easyMode = false;
let useNpc = false;
let blackPoints = 0;
let whitePoints = 0;

function newGame(){
	turnColor = black;
	document.getElementById("reStart").style.display ="none";
	document.getElementById("message").textContent = "";
	document.getElementById("turn").textContent = "黒のターン";
	field=makeField();
	printField();
}


function run(inputPos) {
    document.getElementById("message").textContent="";
	if(canPut(inputPos)){
		reverse(inputPos);
		changeTurn();
		printField();
	}else{
	    document.getElementById("message").textContent = "その場所には置けません";
	}
	if(isFinish()){
		finishGame();
	}
}

function makeField(){
    let field = [];
	for(let i=0;i<10;i++) {
		let line = [];
		for(let j=0;j<10;j++) {
			line.push({	state : i==0||i==9||j==0||j==9 ? wall : blank,
						pos : `${i}${j}`,
						makeHtml : function(state = this.state, onclick = `onclick = run('${this.pos}')`){return `<p class="yubi" ${onclick}> ${state} </p>`}
					});
		}
		field[i] = line;
	}
	field[5][5].state = white;
	field[4][4].state = white;
	field[5][4].state = black;
	field[4][5].state = black;
	return field;
}

function printField(){
	document.getElementById("field").innerHTML = "";
	field.map(line => {
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
	if(canPut(pos) && (easyMode && !useNpc || easyMode && turnColor == black)){
		return true;
	}
	return false;
}

function changeTurn(){
	turnColor == black ? turnColor = white : turnColor = black;
	document.getElementById("turn").textContent = `${turnColor}のターン`;
	if(searchLegalPos(turnColor).length == 0 && !isFinish()){
        document.getElementById("message").textContent = `${turnColor}は置ける場所がありません`;
        changeTurn();
    }
	if(useNpc && turnColor == white){
        setTimeout(runNpc, 600);
    }
}

function canPut(pos){
	const legalPoses = searchLegalPos(turnColor);
	if(legalPoses.length == 0){
		return false;
	}
	if(legalPoses.some(legalPos => legalPos == pos)){
		return true;
	}
	return false;
}

function searchLegalPos(color=turnColor){
	let enemy = getEnemy(color);
	let legalPoses = [];
	field.map((line,row)=>line.map((square,col)=>{
        if(field[row][col].state != blank){
            return;
        }
        for(let{x,y} of directions){
            let searchRow = row + x;
            let searchCol = col + y;
            if(field[searchRow][searchCol].state != enemy) {
                continue;
            }
            while(true) {
                searchRow += x;
                searchCol += y;
                let targetSquare = field[searchRow][searchCol].state;
                if(targetSquare != black && targetSquare != white) {
                    break;
                }else if(targetSquare == enemy) {
                    continue;
                }else {
                    canPutFlag = true;
                    legalPoses = [...legalPoses,square.pos];
                }
            }
        }
    }));
    return legalPoses;
}

function reverse(inputPos){
	let enemy = getEnemy(turnColor);
	let putRow = parseInt(inputPos[0]);
	let putCol = parseInt(inputPos[1]);
	field[putRow][putCol].state = turnColor;
	for(let{x,y} of directions){
		let row = putRow + x;
		let col = putCol + y;
		if(field[row][col].state != enemy) {
			continue;
		}
		let reversePosList = [[row,col]];
		while(true) {
			row += x;
			col += y;
			let targetSquare = field[row][col].state;
			if(targetSquare != black && targetSquare != white) {
				break;
			}
			if(targetSquare == enemy) {
				reversePosList = [...reversePosList,[row,col]];
			}else {
				for(let pos of reversePosList) {
                    			field[pos[0]][pos[1]].state = turnColor;
				}
				break;
			}
		}
	}
    return field;
}

function getEnemy(color){
	return color == black ? white : black;
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
	easyMode = !easyMode;
	if(easyMode){
		document.getElementById("mode").textContent = "ふつう";
	}else{
		document.getElementById("mode").textContent = "やさしい";
	}
	printField();
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
	let result = blackCount + "：" + whiteCount + "<br>";
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
	useNpc = !useNpc;
	if(useNpc){
		document.getElementById("npc").textContent = "2人で遊ぶ";
	}else{
		document.getElementById("npc").textContent = "1人で遊ぶ";
	}
}

function runNpc(){
	if(searchLegalPos(turnColor).length==0){
		return;
	}
	let legalPos = searchLegalPos(white);
	let index = Math.floor(Math.random()*legalPos.length);
	reverse(legalPos[index]);
	changeTurn();
	printField();
	if(isFinish()){
		finishGame();
	}
}

newGame();
