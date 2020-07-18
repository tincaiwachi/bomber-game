class PlayGround {

	constructor (rows, cols, numPlayers) {
		this.rows = rows;
		this.cols = cols;
		this.grid = createGrid(rows, cols);
		this.numPlayers = 0;
		this.players = [];
		this.items = [];
	}
}

// TO INITITIATE PLAYGROUND'S GRID
function createGrid(x, y) {
	let arr = [];
	for (let i = 0; i < y; i++) {
		arr[i] = [];
		for (let j = 0; j < x; j++) {
			arr[i][j] = {id: 0, type: "null"};
		}
	}
	return arr;
};

module.exports = PlayGround