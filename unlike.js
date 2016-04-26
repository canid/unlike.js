function doKeys(e) {
	if (debug) var stime = new Date().getTime();
	var prevX = curX, prevY = curY;
	var keyCode = e.keyCode; 
	switch(keyCode) {		
		case 38: (curY > 0 && !isCollision(curX, curY-1)) && curY--; break;
		case 104: (curY > 0 && !isCollision(curX, curY-1)) && curY--; break;
		case 40: (curY < buffSizeY-1 && !isCollision(curX, curY+1)) && curY++; break;
		case 98: (curY < buffSizeY-1 && !isCollision(curX, curY+1)) && curY++; break;
		case 37: (curX > 0 && !isCollision(curX-1, curY)) && curX--; break;
		case 100: (curX > 0 && !isCollision(curX-1, curY)) && curX--; break;
		case 39: (curX < buffSizeX-1 && !isCollision(curX+1, curY)) && curX++; break;
		case 102: (curX < buffSizeX-1 && !isCollision(curX+1, curY)) && curX++; break;
		default: break;
	}
	
	// update screen buffer.
	//screenBuff[prevX][prevY] = " "; 
	//screenBuff[curX][curY] = '@';
	for (y=0; y<buffSizeY; y++){
		for(x=0; x<buffSizeX; x++) {
			var td = document.getElementById('tr'+y+'td'+x);
			if (typeof screenBuff[x][y] == 'object') {
				td.innerHTML = screenBuff[x][y][0];
			}
			else if (x == curX && y == curY) td.innerHTML = '@';
			else td.innerHTML = screenBuff[x][y];
		}
	}
	if(debug) {
		var etime = new Date().getTime();
		console.log('doKeys() exec time: '+(etime-stime)+'. cursor at '+curX+', '+curY);
	}
}

function array2d(x, y) {
	var arr = [];
	for (var i = 0; i<x; i++) {
		arr[i] = [y];
	}
    return arr;
}

function doCombat(targetX, targetY) {
	
}

function isCollision(x, y) {
	var collider = '';
	switch (screenBuff[x][y]) {
		case ' ': collider = ' ';
		case '-': collider = '-';
		case '.': collider = '.';
		case ' ': collider = ' ';
		case '~': collider = '~';
		case '`': collider = '`'; return false;
		case '|': screenBuff[x][y] = '`'; console.log('collision: '+collider); return true;
		case '-': screenBuff[x][y] = '`'; console.log('collision: '+collider); return true;
		case '#': collider = '#'; screenBuff[x][y] = '`'; console.log('collision: '+collider); return true;
		default: if(debug) console.log('collision: '+collider); return true;
	}
}

function rndBetween(min, max) {
	return Math.floor(Math.random()*(max-min+1)+min);
}

function genDungeon() {
// Seeding screen buffer. level generation will replace this.
	var dungeon = array2d(buffSizeX,buffSizeY);	
	for (y=0; y<buffSizeY; y++){
			for(x=0; x<buffSizeX; x++) {
				if (Math.random() > 0.996 ) {
					dungeon[x][y] = new Array('j', 3);
				}
				else dungeon[x][y] = '-';
			}
	}
	
	// rnd seed room size and location
	var rSizeX = rndBetween(5, 8);
	var rSizeY = rndBetween(5, 8); if(debug) console.log("rSizeX: "+rSizeX+", rSizeY: "+rSizeY);
	var rStartX = rndBetween(0, buffSizeX-rSizeX-1);
	var rStartY = rndBetween(0, buffSizeY-rSizeY)-1; if(debug) console.log("rStartX: "+rStartX+", rStartY: "+rStartY);
	
	// set cursor ~ middle of seed room.
	curX = Math.floor(rSizeX/2) + rStartX;
	curY = Math.floor(rSizeY/2)+ rStartY;
	// draw seed room.
	for (var hwall = rStartX; hwall < rStartX+rSizeX; hwall++) {
		dungeon[hwall][rStartY] = '#';
		dungeon[hwall][rStartY+rSizeY-1] = '#';
	}
	for (var vwall = rStartY; vwall < rStartY+rSizeY; vwall++) {
		dungeon[rStartX][vwall] = '#';
		dungeon[rStartX+rSizeX-1][vwall] = '#';		
	}
	//dungeon[curX][curY] = '@'; if(debug) console.log("cursor: "+curX+", "+curY);
	return dungeon;
}

var debug = true;
var buffSizeX =32, buffSizeY = 32;
var curX = 0; var curY = 0;
var screenBuff = genDungeon();
// Creating table of sceen buffer elements with their contents as text nodes.
var body = document.getElementsByTagName('body')[0];
var tbl = document.createElement('table');
var tbdy = document.createElement('tbdy');
for (y=0; y<buffSizeY; y++){
	var tr = document.createElement('tr');
	tr.setAttribute('id', 'tr'+y);
	for(x=0; x<buffSizeX; x++) {
		var td = document.createElement('td');
		td.setAttribute('id', 'tr'+y+'td'+x);
		if (typeof screenBuff[x][y] == 'object') {
			console.log('drawing jackal');
			td.appendChild(document.createTextNode(screenBuff[x][y][0]));			
		}
		else if (x == curX && y == curY) td.appendChild(document.createTextNode('@'));
		else td.appendChild(document.createTextNode(screenBuff[x][y]));
        tr.appendChild(td);
	}
	tbdy.appendChild(tr);
}
tbl.appendChild(tbdy);
body.appendChild(tbl);

body.addEventListener('keydown', doKeys, false);
