const	express	= require("express"),
		app		= express(),
		http	= require("http").createServer(app),
		io		= require("socket.io")(http),
		bodyParser	= require("body-parser"),

		// CLASSES / MODELS
		PlayUnit	= require("./js/PlayUnit"),
		PlayGround	= require("./js/PlayGround"),
		PlayBomb	= require("./js/PlayBomb");
		// util		= require("./js/util");



app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

// Initialise Playground
let currentPlayGround = new PlayGround(11, 11, 0); // 11x11 grid

// INITIALISATION END ====================



//========
// ROUTES
//========

// INDEX
app.get("/", function(req, res) {
	res.render("index", {currentPlayGround: currentPlayGround});
});

// ROUTES END ====================



//===========
// SOCKET.IO
//===========

// Global Variables
let timer = 0;
// let gameState = {
// 	inPlay = false,
// }

io.on("connection", function(socket) {

	// Initiate Global Details
	socket.emit("ioUpdateTime", timer);
	currentPlayGround.players.forEach(function(player, index, players) {
		socket.emit("ioInsertPlayer", player);
	});

	// Join Game
	socket.on("ioJoinGame", function(playerName) {
		// console.log("socket.on 'ioJoinGame' " + socket.id);
		// Add new player to game
		let gx = 0; 
		let gy = 0;
		while(currentPlayGround.grid[gy][gx].id != 0) {
			if (gx < currentPlayGround.rows-1) {
				gx++;
			} else {
				gx = 0;
				gy++;
			}
		}
		let newPlayUnit = new PlayUnit(playerName, socket.id, gx, gy);
		currentPlayGround.players.push(newPlayUnit);
		currentPlayGround.grid[newPlayUnit.pos.y][newPlayUnit.pos.x] = {id: newPlayUnit.playerId, type: "PlayUnit"};
		currentPlayGround.numPlayers++;

		socket.emit("ioInsertPlayer", newPlayUnit);
		socket.broadcast.emit("ioInsertPlayer", newPlayUnit);
	});

	// Input Command
	socket.on("ioUpdateInstructions", function(arr) {
		if (timer === 0) {
			currentPlayGround.players.forEach(function(player, index, players) {
				if (player.playerId === socket.id) {
					player.instructions = arr;
				}
			});
		}
	});

	// Start Game
	socket.on("ioStartGame", function() {
		if (timer === 0) {
			setInterval(function() {
				if ( timer === 150 ) {
					clearInterval(this);
					console.log("game has ended");
					timer = 0;
				} else {
					socket.broadcast.emit("ioUpdateTime", (timer*0.2).toFixed(0));
					socket.emit("ioUpdateTime", (timer*0.2).toFixed(0));
					timer++;

					// Run Instructions
					currentPlayGround.players.forEach(function(player, index, players) {
						nextInstruction = player.instructions.shift();
						if (nextInstruction === "if") {

						} else {
							player.instructions.push(nextInstruction);
							player.callCommand(nextInstruction, currentPlayGround);
							socket.broadcast.emit("ioUpdateUnit", player);
							socket.emit("ioUpdateUnit", player);
						}
					});

					// Run Items
					currentPlayGround.items.forEach(function(item, index, items) {
						item.runItem(currentPlayGround);
					});
				}
			}, 200);
		}
	});

	socket.on("console", function() {
			console.log(currentPlayGround.grid[0][0].type);
	});

	console.log("a user connected: " + socket.id);

	// Disconnect and remove player
	socket.on("disconnect", function() {
		console.log("user disconnected: " + socket.id);
		setInterval(function() {
			if (timer === 0) {
				currentPlayGround.numPlayers--;
				currentPlayGround.players.forEach(function(player, index, players) {
					if (player.playerId === socket.id) {
						let index = currentPlayGround.players.indexOf(player);
						currentPlayGround.players.splice(index, 1);
						currentPlayGround.grid[player.pos.y][player.pos.x] = {id: 0, type:"null"};
						socket.broadcast.emit("ioRemoveUnit", player);
						socket.emit("ioRemoveUnit", player);
					}
				});
				clearInterval(this);
			}
		}, 100);
	});

	socket.on("ioChatMessage", function(msg) {
		socket.emit("ioChatMessage", msg);
		socket.broadcast.emit("ioChatMessage", msg);
	});
});

// SOCKET.IO END ====================



//========
// LISTEN
//========

const port = process.env.PORT || 3000;
http.listen(port, function() {
	let today = new Date();
	console.log("ai-game has started on " + today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds());
});

// LISTEN END ====================