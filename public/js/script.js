$(function() {
	const socket = io();

	$('#joinGame').submit(function(e) {
		e.preventDefault(); //prevents page reloading, which is the default action after form submission
		socket.emit("ioJoinGame", $("#joinName").val());
		$("#joinGame").remove();
		return false;
	});

	$('#startGame').submit(function(e) {
		e.preventDefault(); //prevents page reloading, which is the default action after form submission
		socket.emit("ioStartGame");
		return false;
	});

	$("#console").submit(function(e) {
		e.preventDefault();
		socket.emit("console");
		return false;
	});

	socket.on("ioInsertPlayer", function(newPlayUnit) {
		$("#players").append("<div id='"+ newPlayUnit.playerId + "' class='playerUnit'><span class='playerUnitName'>"+newPlayUnit.name+"</span></div>");
		$("#"+newPlayUnit.playerId).css("transform","translate(" + newPlayUnit.pos.x*9.090909 + "vmin, " + newPlayUnit.pos.y*9.090909 + "vmin)");
		// $("#listOfPlayers").append("<li> " + newPlayUnit.name + "</li>");
	});

	// socket.on("ioUpdateTime", function(timer) {
	// 	$("#gameTime").text(timer+"s");
	// });

	socket.on("ioUpdateUnit", function(player) {
		$("#"+player.playerId).css("transform","translate(" + (player.pos.x*9.090909).toString() + "vmin, " + (player.pos.y*9.090909).toString() + "vmin) rotate(" + player.direction*90 + "deg)");
	});

	socket.on("ioRemoveUnit", function(player) {
		$("#"+player.playerId).remove();
	})

	$("#instructionPanel input").keypress(function(e){
		if (e.which === 13) {
			let cmd = $(this).val();
			$(this).val("");
			//create a new li and add to ul
			$("#instructionPanel ul").append("<li>" + cmd + "</li>")
			return false;
		}
	});

	$("#instructionPanel ul").on("click", "li", function(e){
		$(this).fadeOut(300, function(){
			$(this).remove();
		});
		e.stopPropagation();
	});

	$("#instructionPanel button").on("click", function(e) {
		let arr = [];
		$("#instructionPanel ul li").each(function(index) {
			arr.push($(this).text());
		});
		socket.emit("ioUpdateInstructions", arr);
	});

	// CHATBOX
	$('#chatbox input').keypress(function(e) {
		if (e.which === 13) {
			socket.emit("ioChatMessage", $("#m").val());
			$("#m").val("");
			return false;
		}
	});
	socket.on("ioChatMessage", function(msg) {
		$("#chatbox ul").append($("<li>" + msg + "</li>"));
		setInterval(function(){
			$("#chatbox li").first().fadeOut(100, function() {
				$(this).remove();
			});
		}, 15000)
	});
});
