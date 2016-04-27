function doKeys(e) {
	if (debug) var stime = new Date().getTime();
	
	// stupid toggling flag, to make sure table changes on key event.
	keyFlag = !keyFlag;
	tbl.setAttribute('flag', keyFlag);
	
	var prevX = player.curX, prevY = player.curY;
	var keyCode = e.keyCode; 
	switch(keyCode) {		
		case 38: (player.curY > 0 && !isCollision(player.curX, player.curY-1)) && player.curY--; break;
		case 104: (player.curY > 0 && !isCollision(player.curX, player.curY-1)) && player.curY--; break;
		case 40: (player.curY < buffSizeY-1 && !isCollision(player.curX, player.curY+1)) && player.curY++; break;
		case 98: (player.curY < buffSizeY-1 && !isCollision(player.curX, player.curY+1)) && player.curY++; break;
		case 37: (player.curX > 0 && !isCollision(player.curX-1, player.curY)) && player.curX--; break;
		case 100: (player.curX > 0 && !isCollision(player.curX-1, player.curY)) && player.curX--; break;
		case 39: (player.curX < buffSizeX-1 && !isCollision(player.curX+1, player.curY)) && player.curX++; break;
		case 102: (player.curX < buffSizeX-1 && !isCollision(player.curX+1, player.curY)) && player.curX++; break;
		case 71: 
			entities.forEach( function(entity, i) {
				if (entity.type=='item' && player.curX==entity.curX && player.curY == entity.curY) {
					if (entity.name=='ccopper'||entity.name=='csilver'||entity.name=='cgold') {
						player.ag += entity.value; if (debug) console.log('Ag: '+player.ag);
					}
					else player.inv.push(entity);
					if(debug) console.log("push: "+player.inv[player.inv.length-1]);
					entities.splice(i, 1);
					if(debug) console.log("snip.");
				}
			});
			break;
		default: break;
	}
	
	// update screen buffer.
	for (y=0; y<buffSizeY; y++){
		for(x=0; x<buffSizeX; x++) {
			var td = document.getElementById('tr'+y+'td'+x);
			td.innerHTML = screenBuff[x][y];
			entities.forEach( function(entity, i) {
				if (entity.type == 'monster' && entity.dead) entities.splice(i, 1);
				else if (x==entity.curX && y==entity.curY)  td.innerHTML = entity.icon;
			});
			document.getElementById('hp').innerHTML = "HP: "+player.hp+' ';
			document.getElementById('ac').innerHTML = "AC: "+player.ac+' ';
			document.getElementById('ag').innerHTML = "Ag: "+player.ag+' ';
			if (x == player.curX && y == player.curY) td.innerHTML = '@';
		}
	}
	if(debug) {
		var etime = new Date().getTime();
		console.log('doKeys() exec time: '+(etime-stime)+'. cursor at '+player.curX+', '+player.curY);
	}
}

function array2d(x, y) {
	var arr = [];
	for (var i = 0; i<x; i++) {
		arr[i] = [y];
	}
    return arr;
}

function doCombat(foe) {
	player.hp -= foe.dmg-player.ac;
	foe.hp -= player.dmg-foe.ac;
	if (foe.hp <= 0) foe.dead=true;
	if (player.hp <= 0) player.dead=true;
	if (debug) console.log('combat! player hp: '+player.hp+', foe hp: '+foe.hp);
	return foe;
}

function isCollision(x, y) {
	var collider = false;
	
	// check entities for monster collision at target location.
	entities.forEach( function(entity) {
		if (entity.type == 'monster' && x==entity.curX && y==entity.curY) {entity = doCombat(entity); collider = entity}
	})
	
	if(collider) {if (debug) console.log('collision: '+collider.icon); return true;}
	switch (screenBuff[x][y]) {
		case ' ': collider = ' ';
		case '-': collider = '-';
		case '.': collider = '.';
		case ' ': collider = ' ';
		case '~': collider = '~';
		case '`': collider = '`'; return false;
		case '|': screenBuff[x][y] = '`'; if (debug) console.log('collision: '+collider); return true;
		case '-': screenBuff[x][y] = '`'; if (debug) console.log('collision: '+collider); return true;
		case '#': collider = '#'; screenBuff[x][y] = '`'; if (debug) console.log('collision: '+collider); return true;
		default: 
		if(debug) console.log('collision: '+collider); return true;
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
				
				// let's place some jackals
				if (Math.random() > 0.998 ) {
					entities.push({name:'jackal', icon:'j', curX:x, curY:y, hp:5, dmg:3, ac:0, dead:false, type:'monster'});
				}
				
				// now some potions
				else if (Math.random() > 0.9985 ) {
					entities.push({icon:'\u2695', curX:x, curY:y, hp:5, type:'item'});
				}
				
				/* now coins, trying  the design I'm hoping to use. this places all coins of each type
				at the same x,y on screen for some reason. Will have to fix later*/
				else if (Math.random() > 0.995) {
					var copper = ccopper;
					copper.curX = x; copper.curY = y;
					copper.value= 0.01 * rndBetween(1, 100);
					entities.push(copper);
					if(debug) console.log('copper! '+copper.curX+', '+copper.curY+': '+copper.value);
				}
				else if (Math.random() > 0.998) {
					var silver = csilver;
					silver.curX = x; silver.curY = y;
					silver.value = rndBetween(1, 100);
					entities.push(silver);
					console.log('silver! '+silver.curX+', '+silver.curY+': '+silver.value);
				}
				
				dungeon[x][y] = '-';
			}
	}
// cgold.value : rndBetween(1, 8)
	
	// rnd seed room size and location
	var rSizeX = rndBetween(5, 8);
	var rSizeY = rndBetween(5, 8); if(debug) console.log("rSizeX: "+rSizeX+", rSizeY: "+rSizeY);
	var rStartX = rndBetween(0, buffSizeX-rSizeX-1);
	var rStartY = rndBetween(0, buffSizeY-rSizeY)-1; if(debug) console.log("rStartX: "+rStartX+", rStartY: "+rStartY);
	
	// set cursor ~ middle of seed room.
	player.curX = Math.floor(rSizeX/2) + rStartX;
	player.curY = Math.floor(rSizeY/2)+ rStartY;

	// draw seed room.
	for (var hwall = rStartX; hwall < rStartX+rSizeX; hwall++) {
		dungeon[hwall][rStartY] = '#';
		dungeon[hwall][rStartY+rSizeY-1] = '#';
	}
	for (var vwall = rStartY; vwall < rStartY+rSizeY; vwall++) {
		dungeon[rStartX][vwall] = '#';
		dungeon[rStartX+rSizeX-1][vwall] = '#';		
	}
	
	return dungeon;
}

var debug = true;

var buffSizeX =32, buffSizeY = 32;

var player = {icon:'@', curX:0, curY:0, hp:20, xp:0, lvl:1, ag:0, ac:0, dmg:4, dex:0, inv:[], wld:[], dead:false}
var entities = [];
var phealing = {type:'item', name:'', hp:5};
var pHealing = {type:'item', name:'', hp:10};
var ccopper = {icon:'c',type:'item', name:'ccopper', desc:'', value:0, curX:0, curY:0};
var csilver = {icon:'s',type:'item', name:'csilver', desc:'', value:0};
var cgold = {icon:'g',type:'item', name:'cgold', desc:'', value:0, curX:0, curY:0};
var aleather = {type:'item', name:'aleather', desc:'leather armor'};
var achain = {type:'item', name:'chainmail armor'};

var keyFlag = true;

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
		if (x==player.curX && y==player.curY) td.appendChild(document.createTextNode(player.icon));
		else td.appendChild(document.createTextNode(screenBuff[x][y]));
		entities.forEach( function(entity) {
			if (x==entity.curX && y==entity.curY) {
				td.innerHTML = entity.icon; if(debug) console.log(entity.name+': '+entity.curX+', '+entity.curY);
			}
		});

        tr.appendChild(td);
	}
	tbdy.appendChild(tr);
}
tbl.appendChild(tbdy);
body.appendChild(tbl);

// create ui
tbl2 = document.createElement('tbl');
tbdy = document.createElement('tbdy');
tr = document.createElement('tr'); tr.setAttribute('id', 'ui');
td = document.createElement('td'); tr.setAttribute('id', 'stats');

var a = document.createElement('a'); a.setAttribute('id', 'hp');
a.appendChild(document.createTextNode('HP: '+player.hp+' '));
td.appendChild(a);

a = document.createElement('a'); a.setAttribute('id', 'ac');
a.appendChild(document.createTextNode('AC: '+player.ac+' '));
td.appendChild(a);

a = document.createElement('a'); a.setAttribute('id', 'ag');
a.appendChild(document.createTextNode('Ag: '+player.ag+' '));
td.appendChild(a);

tr.appendChild(td);

tbdy.appendChild(tr);
tbl2.appendChild(tbdy);
body.appendChild(tbl2);

body.addEventListener('keydown', doKeys, false);

