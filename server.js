var WebSocketServer = require("websocket").server;
var http = require("http");
var readline = require("readline");
var fs = require("fs");

// show the new user the website
var server = http.createServer(function(request,response){
	var markup;
	fs.readFile("index.html", function(error, markup){
		if (error){
			response.write("file not found")
		}
		else{
			response.write(markup);
		}
		response.end();
	});
});
// listen for more requests
server.listen(9000,function(){
	console.log(new Date() + " listening on port 9000");
});
var socket = new WebSocketServer({
	httpServer: server
});
var r1 = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

var connections = [];
var connPtr = 0;
// maintain an array of dead connections (indices)
var deadConnections = [];
var deadConnPtr = 0;
var numLive = 0; // number of live clients at any given time

socket.on("request",function(request){
	var currConn = request.accept(null,request.origin);

	numLive++;
	console.log(numLive + " clients are live.");
	// need to tell all clients how many are present

	connections[connPtr] = currConn;
	connPtr++;

	// inform all users how many are present
	for (i = 0; i < connections.length; i++){
		//  sending the data to everyone
		connections[i].sendUTF("u." + numLive + ".");
	}
	
	console.log(connPtr + " connections have been established.\n");
	
	currConn.on("close",function(reasonCode,description){
		numLive--;
		var identity;
		for (i = 0; i < connections.length; i++){
			// update the number of live clients on every client
			connections[i].sendUTF("u." + numLive + ".");
			if(connections[i]==this){
				identity = i;
			}
		}
		console.log("Client \"" + identity + "\" closed");
		deadConnections[deadConnPtr] = identity;
		deadConnPtr++;
		//console.log("Dead connections are: " + deadConnections);
	});
	currConn.on("message",function(message){
		if (message.utf8Data.includes(",")){
			// (it's the paintbrush)
			var identity;
			for (i = 0; i < connections.length; i++){
				if(connections[i]==this){
					console.log(i + " said \"" + message.utf8Data + "\"...I think.");
					identity = i;
				}
			}
			// send the message back
			for (i = 0; i < connections.length; i++){
				//  sending the data to everyone
				connections[i].sendUTF(message.utf8Data);
			}
		}
		else{
			// (it's an update to the number of users)
			
		}
	});
	
});
