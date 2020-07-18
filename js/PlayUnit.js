const PlayBomb = require("./PlayBomb");

class PlayUnit {

	constructor (name, playerId, x, y) {
		this.name = name;
		this.playerId = playerId;
		this.instructions = [];
		this.score = 0;
		this.pos = { 
			x: x, 
			y: y 
		}
		this.health = 1;
		this.direction = 0; //0: north, 1: east, 2: south, 3: west
	}

	callCommand(command, playarea) {
		if (command === "moveForward") this.moveForward(playarea);
		if (command === "turnLeft") this.turnLeft();
		if (command === "turnRight") this.turnRight();
		if (command === "randomMove") this.randomMove(playarea);
		if (command === "chaseNearestEnemy") this.chaseNearestEnemy(playarea);
		if (command === "dropBomb") this.dropBomb(playarea);
	}

	moveForward(playarea) {
		let moveX = 0, moveY = 0;
		if (this.direction === 0) moveY--;
		else if (this.direction === 1) moveX++;
		else if (this.direction === 2) moveY++;
		else moveX--;

		if (this.checkSquare(playarea, this.pos.x + moveX, this.pos.y + moveY)) {
			playarea.grid[this.pos.y][this.pos.x] = {id: 0, type: "null"};
			this.pos.x += moveX;
			this.pos.y += moveY;
			playarea.grid[this.pos.y][this.pos.x] = {id: this.playerId, type:"PlayUnit"};
		} else {
			//console.log("something in the way of " + this.name);
		}
	}

	turnLeft() {
		if (this.direction === 0) {
			this.direction = 3;
		} else {
			this.direction -= 1;
		}
	}

	turnRight() {
		if (this.direction === 3) {
			this.direction = 0;
		} else {
			this.direction += 1;
		}
	}

	randomMove(playarea) {
		let dice = Math.random();
		if (dice <= 0.25) this.turnLeft();
		else if (dice <= 0.5) this.turnRight();
		else if (dice <= 1) this.moveForward(playarea);
	}

	checkSquare(playarea, x, y) {
		if (playarea.rows-1 < x || x < 0 || playarea.cols-1 < y || y < 0) {
			return false;
		} else if (playarea.grid[y][x].id != 0) {
			return false;
		} else {
			return true;
		}
	}

	goTo(playarea, x, y) {

	}

	findEnemy(playarea) {
		for (let j = this.y-2; j < this.y+2; j++) {
			for (let i = this.x-2; i < this.x+2; i++) {
				if (this.checkSquare(playarea, i, j)) { //check square only returns true for empty space
					if (playarea.grid[j][i].type === "PlayUnit") {
						return {x: i, y: j};
					} else {
						return false;
					}
				}
			}
		}
	}

	chaseNearestEnemy(playarea) {
		let coord = findEnemy(playarea);
		if (!coord) {
			this.randomMove(playarea);
		} else {
			this.goTo(playarea, coord.x, coord.y);
		}
	}

	dropBomb(playarea) {
		let newBomb = new PlayBomb(this.pos.x, this.pos.y);
		playarea.items.push(newBomb);
		playarea.grid[this.pos.y][this.pos.x] = {id: this.playerId, type: "PlayBomb"};
	}
}

// let dictionary = {
// 	moveForward: moveForward,
// }

module.exports = PlayUnit;