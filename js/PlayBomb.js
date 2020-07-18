class PlayBomb {

	constructor (x, y) {
		this.x = x;
		this.y = y;
		this.tick = 0;
	}

	runItem(playarea) {
		this.tick++;
		if (this.tick === 10) this.explode(playarea);
	}

	explode (playarea) {
		for (let j = (this.y-2); j < (this.y+2); j++) {
			console.log("I CAME BY J");
			for (let i = this.x-2; i < this.x+2; i++) {
				console.log(playarea.grid[j][i].type);
				if (playarea.grid[j][i].type === "PlayUnit") {
					playarea.players.forEach(function(player, index, players) {
						console.log(player.name + " has died");
						if (player.playerId === playarea.grid[j][i].id) players.splice(index, 1);
					});
					playarea.grid[j][i] = {id: 0, type : "null"};
				} else if (playarea.grid[j][i].type === "PlayBomb") {
					playarea.items.forEach(function(item, index, items) {
						item.explode(playarea);
					});
				}
			}
		}
	}
}

module.exports = PlayBomb