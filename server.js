var WebSocketServer = require("websocket").server;
var http = require("http");
var readline = require("readline");
var fs = require("fs");

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
// maintain an array of indexes of the above (connections) variable that indicates if the connection is dead
var deadConnections = [];
var deadConnPtr = 0;

socket.on("request",function(request){
	var currConn = request.accept(null,request.origin);
	
	connections[connPtr] = currConn;
	connPtr++;
	
	console.log(connPtr + " connections have been established.\n");

	
	
	currConn.on("close",function(reasonCode,description){
		var identity;
		for (i = 0; i < connections.length; i++){
			if(connections[i]==this){
				identity = i;
			}
		}
		console.log(identity + " closed");
		deadConnections[deadConnPtr] = identity;
		deadConnPtr++;
		console.log("Dead connections are: " + deadConnections);
	});
	currConn.on("message",function(message){
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
	});
	
});
